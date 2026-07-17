import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Form, Button, Spinner, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import { getTaxBreakdown, getTaxStatusFromStateCode } from './invoiceUtils';
import logo from '../img/slogo.png'

function Invoice() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const invoiceState = location.state || {};
  const stateInvoiceNo = invoiceState.invoiceNo || invoiceState.invNo || invoiceState.invoice_number || '';
  const isEditMode = Boolean(stateInvoiceNo);
  const initialItems = Array.isArray(invoiceState.items) ? invoiceState.items : [];
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasSavedInvoice, setHasSavedInvoice] = useState(Boolean(stateInvoiceNo));
  const [showPrintPrompt, setShowPrintPrompt] = useState(false);
  const [existingChecked, setExistingChecked] = useState(false);
  const [taxStatus, setTaxStatus] = useState(() => getTaxStatusFromStateCode(null));
  const [taxStatusLoading, setTaxStatusLoading] = useState(false);

  const stateCustomerId = invoiceState.customerid || invoiceState.customerId || invoiceState.customer_id || invoiceState.customerID || 
    (initialItems[0]?.customerid) || (initialItems[0]?.customerId) || (initialItems[0]?.customer_id) || '';

  const normalizeShipToAddress = useCallback((item = {}) => ({
    ship_name: (item?.ship_name || item?.name || '').toString().trim(),
    ship_contact_number: (item?.ship_contact_number || item?.contact_number || '').toString().trim(),
    ship_address1: (item?.ship_address1 || item?.address1 || '').toString().trim(),
    ship_address2: (item?.ship_address2 || item?.address2 || '').toString().trim(),
    ship_city: (item?.ship_city || item?.city || '').toString().trim(),
    ship_state: (item?.ship_state || item?.state || '').toString().trim(),
    ship_pincode: (item?.ship_pincode || item?.pincode || '').toString().trim(),
    ship_gstin: (item?.ship_gstin || item?.gstin || '').toString().trim(),
    is_default: item?.is_default === true || item?.is_default === 1 || item?.is_default === '1' || item?.is_default === 'true'
  }), []);

  const hasShipToValues = useCallback((shipTo) => [
    shipTo?.ship_name,
    shipTo?.ship_contact_number,
    shipTo?.ship_address1,
    shipTo?.ship_address2,
    shipTo?.ship_city,
    shipTo?.ship_state,
    shipTo?.ship_pincode,
    shipTo?.ship_gstin
  ].some((value) => (value || '').toString().trim() !== ''), []);

  const parseShipToAddresses = useCallback((rawValue) => {
    if (!rawValue) return [];

    let parsed = rawValue;
    if (typeof rawValue === 'string') {
      try {
        parsed = JSON.parse(rawValue);
      } catch (e) {
        return [];
      }
    }

    if (!Array.isArray(parsed)) {
      parsed = [parsed];
    }

    return parsed
      .map((item) => normalizeShipToAddress(item))
      .filter((item) => hasShipToValues(item));
  }, [normalizeShipToAddress, hasShipToValues]);

  const routeShipToChoices = parseShipToAddresses(
    invoiceState.shipToAddressJson ||
    invoiceState.ship_to_address_json ||
    invoiceState.shiptoaddressjson ||
    invoiceState.shipaddressjson ||
    invoiceState.shipping ||
    invoiceState.shipToAddresses ||
    invoiceState.shipAddresses ||
    invoiceState.ship_address
  );
  const selectedShipToFromState = routeShipToChoices.find((address) => address.is_default) || routeShipToChoices[0] || invoiceState.shipToAddress || {
    ship_name: invoiceState.ship_name || '',
    ship_contact_number: invoiceState.ship_contact_number || '',
    ship_address1: invoiceState.ship_address1 || '',
    ship_address2: invoiceState.ship_address2 || '',
    ship_city: invoiceState.ship_city || '',
    ship_state: invoiceState.ship_state || '',
    ship_pincode: invoiceState.ship_pincode || '',
    ship_gstin: invoiceState.ship_gstin || ''
  };

  const initialShipToFromState = normalizeShipToAddress(selectedShipToFromState);
  const hasShipToFromRouteState = hasShipToValues(initialShipToFromState);
  const initialShipToChoices = routeShipToChoices;

  if (hasShipToValues(initialShipToFromState)) {
    const sameAddressExists = initialShipToChoices.some((address) =>
      address.ship_name === initialShipToFromState.ship_name &&
      address.ship_contact_number === initialShipToFromState.ship_contact_number &&
      address.ship_address1 === initialShipToFromState.ship_address1 &&
      address.ship_address2 === initialShipToFromState.ship_address2 &&
      address.ship_city === initialShipToFromState.ship_city &&
      address.ship_state === initialShipToFromState.ship_state &&
      address.ship_pincode === initialShipToFromState.ship_pincode &&
      address.ship_gstin === initialShipToFromState.ship_gstin
    );

    if (!sameAddressExists) {
      initialShipToChoices.unshift(initialShipToFromState);
    }
  }

  const initialDefaultShipToIndex = initialShipToChoices.findIndex((address) => address.is_default);
  const initialSelectedShipToIndex = initialDefaultShipToIndex >= 0 ? initialDefaultShipToIndex : 0;
  const [shipToChoices, setShipToChoices] = useState(initialShipToChoices);
  const [selectedShipToIndex, setSelectedShipToIndex] = useState(initialSelectedShipToIndex);
  const [shipToDetails, setShipToDetails] = useState(
    shipToChoices[initialSelectedShipToIndex] || initialShipToFromState
  );

  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNo: stateInvoiceNo || '',
    invoiceDate: invoiceState.invoiceDate || new Date().toISOString().slice(0, 10),
    referenceNo: invoiceState.referenceNo || '',
    totalDiscount: invoiceState.totalDiscount || 0,
    financialYear: invoiceState.financialYear || '',
    customer: invoiceState.customer || '',
    customerid: stateCustomerId || ''
  });

  // Buyer Details, QR Code, IRN, ACK State
  const [buyerDetails, setBuyerDetails] = useState({
    name: '',
    address: '',
    gstin: '',
    contact: ''
  });

  useEffect(() => {
    const selectedShipTo = shipToChoices[selectedShipToIndex];
    if (selectedShipTo) {
      setShipToDetails(selectedShipTo);
    }
  }, [shipToChoices, selectedShipToIndex]);

  // Company Details (Hardcoded)
  const companyInfo = {
    name: 'SRI SHIVA DESIGNS',
    address: 'PLOT NO . G3, 4TH CROSS,SIPCOT INDUSTRIAL GROWTH CENTRE,PERUNDURAI,TAMILNADU,INDIA - 638052',
    gstin: '33AMEPP2435Q2ZP',
    contact: '9443029027'
   
  };

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!stateInvoiceNo || (invoiceState.items && invoiceState.items.length > 0)) {
        setExistingChecked(true);
        return;
      }

      setLoadingDetails(true);
      try {
        const resp = await axios.post(`${API_URL}/getInvEditDetails`, [stateInvoiceNo]);
        if (resp && resp.data) {
          const invoiceData = Array.isArray(resp.data) ? resp.data[0] || resp.data : resp.data;
          if (invoiceData) {
            const fetchedCustomerId = invoiceData.customerid || invoiceData.customerId || invoiceData.customer_id || invoiceData.customerID || '';
            setInvoiceDetails((prev) => ({
              ...prev,
              invoiceNo: invoiceData.invoiceNo || invoiceState.invoiceNo,
              invoiceDate: invoiceData.invoiceDate || invoiceState.invoiceDate || prev.invoiceDate,
              referenceNo: invoiceData.referenceNo || invoiceState.referenceNo || prev.referenceNo,
              totalDiscount: invoiceData.totalDiscount || invoiceState.totalDiscount || prev.totalDiscount,
              financialYear: invoiceData.financialYear || prev.financialYear,
              customer: invoiceData.customer || invoiceState.customer || prev.customer,
              customerid: fetchedCustomerId || stateCustomerId || prev.customerid
            }));
            setLineItems(
              (Array.isArray(invoiceData.items) ? invoiceData.items : []).map((item) => ({
                ...item,
                description: item.description || item.itemDescription || '',
                color: item.color || '',
                quantity: item.quantity || 0,
                unit: item.unit || 'KG',
                rate: item.rate || 0,
                tax: item.tax || 0,
                amount: item.amount || 0
              }))
            );
          }
        }
      } catch (err) {
        console.warn('Unable to load full invoice details from backend', err);
      } finally {
        setLoadingDetails(false);
        setExistingChecked(true);
      }
    };

    fetchInvoiceDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const customerName =
    invoiceDetails.customer ||
    invoiceState.customer ||
    (initialItems[0] && initialItems[0].customer) ||
    '';

  useEffect(() => {
    let isActive = true;

    const fetchTaxStatus = async () => {
      if (!customerName?.trim()) {
        if (isActive) {
          setTaxStatus(getTaxStatusFromStateCode(null));
        }
        return;
      }

      try {
        setTaxStatusLoading(true);
        const responseData = await readInvoices(customerName);
        const stateCode =
          responseData?.stateCode ??
          responseData?.statecode ??
          responseData?.customerStateCode ??
          responseData?.customer_state_code ??
          responseData?.state_code ??
          responseData?.data?.stateCode ??
          responseData?.data?.statecode ??
          responseData?.data?.customerStateCode;

        if (isActive) {
          setTaxStatus(getTaxStatusFromStateCode(stateCode));
        }
      } catch (e) {
        console.warn('Failed to resolve customer tax status', e);
        if (isActive) {
          setTaxStatus(getTaxStatusFromStateCode(null));
        }
      } finally {
        if (isActive) {
          setTaxStatusLoading(false);
        }
      }
    };

    fetchTaxStatus();
    return () => {
      isActive = false;
    };
  }, [customerName]);

  // Fetch buyer details from backend
  useEffect(() => {
    let isActive = true;

    const fetchBuyerDetails = async () => {
      const customerId = invoiceDetails.customerid || stateCustomerId;
      if (!customerId?.trim()) {
        if (isActive) {
          setBuyerDetails({
            name: customerName || 'Not Specified',
            address: '-',
            gstin: '-',
            contact: '-'
          });
        }
        return;
      }

      try {
        const resp = await axios.post(`${API_URL}/getCustomerDetails`, { customerId });
        if (resp && resp.data) {
          const details = resp.data;
          if (isActive) {
            setBuyerDetails({
              name: details.name || details.customerName || customerName || 'Not Specified',
              address: details.address || details.customerAddress || '-',
              gstin: details.gstin || details.customerGstin || '-',
              contact: details.contact || details.phone || details.contactNo || '-'
            });

            const parsedShipTo = parseShipToAddresses(
              details.ship_address ||
              details.shipAddress ||
              details.ship_to_addresses ||
              details.shipToAddresses
            );

            if (parsedShipTo.length > 0 && !hasShipToFromRouteState) {
              const defaultIndex = parsedShipTo.findIndex((address) => address.is_default);
              const effectiveIndex = defaultIndex >= 0 ? defaultIndex : 0;
              const defaultShipTo = parsedShipTo[effectiveIndex];

              setShipToChoices(parsedShipTo);
              setSelectedShipToIndex(effectiveIndex);
              setShipToDetails((prev) => (hasShipToValues(prev) ? prev : defaultShipTo));
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch buyer details', err);
        if (isActive) {
          setBuyerDetails({
            name: customerName || 'Not Specified',
            address: '-',
            gstin: '-',
            contact: '-'
          });
        }
      }
    };

    fetchBuyerDetails();
    return () => {
      isActive = false;
    };
  }, [invoiceDetails.customerid, stateCustomerId, customerName, parseShipToAddresses, hasShipToValues, hasShipToFromRouteState]);

  const [lineItems, setLineItems] = useState(() =>
    initialItems.map((item) => {
      const qty = Number(item.quantity || 0);
      const rate = Number(item.rate || 0);
      const base = qty * rate;
      const taxPercent = Number(item.tax || 0);
      const taxAmount = (taxPercent / 100) * base;
      const total = base + taxAmount;

      let cgst = '0.00';
      let sgst = '0.00';
      let igst = '0.00';

      const initialTaxStatus = getTaxStatusFromStateCode(null);
      if (initialTaxStatus.type === 'cgst_sgst') {
        cgst = (taxAmount / 2).toFixed(2);
        sgst = (taxAmount / 2).toFixed(2);
      } else {
        igst = taxAmount.toFixed(2);
      }

      return {
        ...item,
        description: item.description || item.itemDescription || '',
        color: item.color || '',
        quantity: item.quantity || 0,
        unit: item.unit || 'KG',
        rate: item.rate || 0,
        tax: item.tax || 0,
        amount: total.toFixed(2),
        cgst,
        sgst,
        igst
      };
    })
  );

  const vehicleNos = useMemo(() => {
    const fromState = (invoiceState.vehicleNos || '').toString();
    const fromItems = lineItems
      .flatMap((item) => (item.vchno || '').toString().split(','))
      .map((value) => value.trim())
      .filter(Boolean);

    return Array.from(
      new Set([
        ...fromState.split(',').map((value) => value.trim()).filter(Boolean),
        ...fromItems
      ])
    ).join(', ');
  }, [invoiceState.vehicleNos, lineItems]);

  useEffect(() => {
    if (!existingChecked) return;
    if (stateInvoiceNo || invoiceDetails.invoiceNo) return;
    (async () => {
      try {
        const generated = await generateInvoiceNo();
        setInvoiceDetails((prev) => ({ ...prev, invoiceNo: generated, financialYear: getFinancialYear(prev.invoiceDate) }));
      } catch (e) {
        console.warn('Failed to generate invoice number', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingChecked, stateInvoiceNo, invoiceDetails.invoiceNo]);

  const STORAGE_KEY = 'invoices_v1';
  const API_URL = 'https://www.wynstarcreations.com/seyal/api';

  async function readInvoices(customerName = '') {
    try {
      const payload = customerName ? { customerName } : {};
      const resp = await axios.post(`${API_URL}/getInvoiceNo`, payload);

      if (resp && resp.data) {
        console.log('Invoice number response:', resp.data);
        return resp.data;
      }
    } catch (e) {
      // fallback to localStorage
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  async function generateInvoiceNo() {
    const invoices = await readInvoices(invoiceDetails.customer || customerName || '');
    const countValue = Number(
      invoices?.message ??
      invoices?.count ??
      invoices?.invoiceNo ??
      invoices?.invoiceNumber ??
      invoices?.invNo ??
      0
    );
    const count = Number.isFinite(countValue) && countValue > 0 ? countValue + 1 : 1;
    const date = new Date(invoiceDetails.invoiceDate || Date.now());
    const fy = getFinancialYearShort(date);
    return `SSD/${fy}/${count}`;
  }

  function getFinancialYearShort(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1-12
    if (month >= 4) {
      return `${String(year).slice(-2)}-${String(year + 1).slice(-2)}`;
    }
    return `${String(year - 1).slice(-2)}-${String(year).slice(-2)}`;
  }

  function getFinancialYear(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1-12
    // Assuming financial year starts on April 1
    if (month >= 4) {
      return `${year}-${String(year + 1).slice(-2)}`;
    }
    return `${year - 1}-${String(year).slice(-2)}`;
  }

  function formatDateForPrint(dateValue) {
    if (!dateValue) return '-';
    const raw = String(dateValue).trim();
    const directMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (directMatch) {
      return `${directMatch[3]}-${directMatch[2]}-${directMatch[1]}`;
    }

    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) {
      return raw;
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const syncLineItemTaxBreakdown = (lineItem) => {
    const qty = Number(lineItem.quantity || 0);
    const rate = Number(lineItem.rate || 0);
    const base = qty * rate;
    const taxPercent = Number(lineItem.tax || 0);
    const taxAmount = (taxPercent / 100) * base;
    const total = base + taxAmount;

    let cgst = '0.00';
    let sgst = '0.00';
    let igst = '0.00';

    if (taxStatus.type === 'cgst_sgst') {
      // Split tax equally for CGST and SGST
      cgst = (taxAmount / 2).toFixed(2);
      sgst = (taxAmount / 2).toFixed(2);
    } else {
      // All tax goes to IGST
      igst = taxAmount.toFixed(2);
    }

    return {
      ...lineItem,
      amount: total.toFixed(2),
      cgst: cgst,
      sgst: sgst,
      igst: igst
    };
  };

  const invoiceTotals = useMemo(() => {
    let totalTax = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    lineItems.forEach((item) => {
      const qty = Number(item.quantity || 0);
      const rate = Number(item.rate || 0);
      const base = qty * rate;
      const tax = (Number(item.tax || 0) / 100) * base;
      totalTax += tax;
      totalCgst += Number(item.cgst || 0);
      totalSgst += Number(item.sgst || 0);
      totalIgst += Number(item.igst || 0);
    });

    const discountValue = Number(invoiceDetails.totalDiscount || 0);
    const subTotal = lineItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0), 0);
    const total = subTotal + totalTax - discountValue;
    const taxBreakdown = getTaxBreakdown(totalTax, taxStatus.type);
    return {
      subTotal: subTotal.toFixed(2),
      totalDiscount: discountValue.toFixed(2),
      totalTax: taxBreakdown.totalTax,
      totalAmount: total.toFixed(2),
      cgst: taxStatus.type === 'cgst_sgst' ? totalCgst.toFixed(2) : taxBreakdown.cgst,
      sgst: taxStatus.type === 'cgst_sgst' ? totalSgst.toFixed(2) : taxBreakdown.sgst,
      igst: taxStatus.type === 'igst' ? totalIgst.toFixed(2) : taxBreakdown.igst
    };
  }, [lineItems, invoiceDetails.totalDiscount, taxStatus.type]);

  if (!isAuthenticated) {
    return null;
  }

  if (loadingDetails) {
    return (
      <div className="main-content">
        <Container fluid className="py-5 text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <div>Loading invoice details...</div>
        </Container>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/delivery');
  };

  const handlePrint = async () => {
    if (!lineItems.length) {
      alert('No invoice items found. Please select line items from Delivery.');
      return;
    }

    // persist invoice before printing
    try {
      saveInvoice();
    } catch (e) {
      // continue even if save fails
      console.warn('Failed to save invoice', e);
    }

    // Fetch buyer details before printing
    let currentBuyerDetails = { ...buyerDetails };
    let currentShipToDetails = {
      name: shipToDetails.ship_name || '',
      address1: shipToDetails.ship_address1 || '',
      address2: shipToDetails.ship_address2 || '',
      city: shipToDetails.ship_city || '',
      pincode: shipToDetails.ship_pincode || '',
      state: shipToDetails.ship_state || '',
      gstin: shipToDetails.ship_gstin || '',
      contact: shipToDetails.ship_contact_number || ''
    };
    const customerId = invoiceDetails.customerid || stateCustomerId;
    const searchParam = customerId ? { customerId } : (customerName ? { customerName } : {});
    console.log('Customer ID:', customerId);
    console.log('Customer Name:', customerName);
    console.log('Search Param:', searchParam);
    console.log('Invoice Details:', invoiceDetails);
    
    if ((customerId && String(customerId).trim()) || (customerName && String(customerName).trim())) {
      try {
        console.log('Fetching buyer details from:', `${API_URL}/getCustomerDetails`);
        console.log('Payload:', searchParam);
        const resp = await axios.post(`${API_URL}/getCustomerDetails`, searchParam);
        console.log('Buyer details response:', resp.data);
        if (resp && resp.data) {
          const details = resp.data;
          currentBuyerDetails = {
            name: details.name || 'Not Specified',
            address1: details.address1 || '-',
            address2: details.address2 || '-',
            city: details.city || '-',
            pincode: details.pincode || '-',
            state: details.state || '-',
            gstin: details.gstin || '-',
            contact: details.contact_number || '-'
          };
          setBuyerDetails(currentBuyerDetails);
          console.log('Updated buyer details:', currentBuyerDetails);
        }
      } catch (err) {
        console.error('Failed to fetch buyer details:', err);
        currentBuyerDetails = {
          name: customerName || 'Not Specified',
           address1: '-',
           address2: '-',
            city: '-',
            pincode: '-',
            state: '-',
            gstin:  '-',
            contact:  '-'
        };
      }
    } else {
      console.log('No customer ID or name found, using fallback');
      currentBuyerDetails = {
        name: customerName || 'Not Specified',
        address: '-',
        gstin: '-',
        contact: '-'
      };
    }

    const hasShipToOverride = [
      currentShipToDetails.name,
      currentShipToDetails.address1,
      currentShipToDetails.address2,
      currentShipToDetails.city,
      currentShipToDetails.state,
      currentShipToDetails.pincode,
      currentShipToDetails.gstin,
      currentShipToDetails.contact
    ].some((value) => (value || '').toString().trim() !== '');

    if (!hasShipToOverride) {
      currentShipToDetails = {
        ...currentBuyerDetails
      };
    }

    // Fetch QR Code, IRN, and ACK data before printing
    let qrLink = '';
    let irn = '';
    let ackNo = '';
    let ackDto = '';

    try {
      const invoiceNo = invoiceDetails.invoiceNo;
      const resp = await axios.post(`${API_URL}/generateQRCode`, {
        invoiceNo: invoiceNo,
        subtotal: invoiceTotals.subTotal,
        tax: invoiceTotals.totalTax,
        totalAmount: invoiceTotals.totalAmount
      });

      if (resp && resp.data) {
        qrLink = resp.data.qr_code_url || '';
        irn = resp.data.irn || '';
        ackNo = resp.data.ack_no || '';
        ackDto = resp.data.ack_date || '';
      }
    } catch (err) {
      console.warn('Failed to fetch QR code data', err);
    }

    const financialYear = invoiceDetails.financialYear || getFinancialYear(invoiceDetails.invoiceDate);
    const formattedInvoiceDate = formatDateForPrint(invoiceDetails.invoiceDate);
    const rowsHtml = lineItems
      .map((item, index) => {
        const qty = Number(item.quantity || 0);
        const rate = Number(item.rate || 0);
        const amount = Number(item.amount || 0);
        return `
        <tr>
          <td style="padding:8px;border:1px solid #000;text-align:center;font-size:12px;">${index + 1}</td>
          <td style="padding:8px;border:1px solid #000;font-size:12px;">${item.dcNo || '-'}</td>
          <td style="padding:8px;border:1px solid #000;font-size:12px;">${item.description || ''}</td>
          <td style="padding:8px;border:1px solid #000;font-size:12px;text-align:center;">${item.color || '-'}</td>
          <td style="padding:8px;border:1px solid #000;text-align:center;font-size:12px;">${qty.toFixed(2)}</td>
          <td style="padding:8px;border:1px solid #000;text-align:center;font-size:12px;">${item.unit || 'KG'}</td>
          <td style="padding:8px;border:1px solid #000;text-align:right;font-size:12px;">${rate.toFixed(2)}</td>
          <td style="padding:8px;border:1px solid #000;text-align:right;font-size:12px;">${item.tax || 0}%</td>
          <td style="padding:8px;border:1px solid #000;text-align:right;font-size:12px;">${amount.toFixed(2)}</td>
        </tr>
      `;
      })
      .join('');

    const amountInWords = convertAmountToWords(Number(invoiceTotals.totalAmount));

    // Calculate tax rates and amounts based on actual line item tax percentages
    const subtotal = Number(invoiceTotals.subTotal);
    let totalTaxAmount = 0;
    let cgstRate = 0, sgstRate = 0, igstRate = 0;
    let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;

    // Calculate total tax from line items
    lineItems.forEach((item) => {
      const qty = Number(item.quantity || 0);
      const rate = Number(item.rate || 0);
      const base = qty * rate;
      const tax = (Number(item.tax || 0) / 100) * base;
      totalTaxAmount += tax;
    });

    if (taxStatus.type === 'cgst_sgst') {
      // For CGST/SGST, split the tax amount equally
      cgstAmount = totalTaxAmount / 2;
      sgstAmount = totalTaxAmount / 2;
      cgstRate = subtotal > 0 ? (cgstAmount / subtotal) * 100 : 0;
      sgstRate = subtotal > 0 ? (sgstAmount / subtotal) * 100 : 0;
    } else {
      // For IGST, all tax goes to IGST
      igstAmount = totalTaxAmount;
      igstRate = subtotal > 0 ? (igstAmount / subtotal) * 100 : 0;
    }

    const invoiceCopyLabels = [
      'Original for Recipient',
      'Original for Supplier',      
      'Duplicate for Supplier'  
    ];

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Tax Invoice - ${invoiceDetails.invoiceNo}</title>
        <style>
          * { margin: 0; padding: 0; }
          body { font-family: 'Arial', sans-serif; font-size: 12px; line-height: 1.3; color: #000; }
          .page { width: 210mm; height: 297mm; padding: 10mm; background: white; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .company-block { display: flex; align-items: flex-start; gap: 12px; flex: 1; }
          .company-logo { width: 190px; height: 190px; border: 1px solid #ccc; object-fit: contain; }
          .company-info { flex: 1; }
          .company-name { font-size: 25px; font-weight: bold; margin-bottom: 3px; }
          .company-details { font-size: 12px; line-height: 1.5; }
          .header-right { text-align: right; min-width: 166px; }
          .invoice-type { font-size: 14px; font-weight: bold; text-align: center; margin-bottom: 8px; }
          .qr-section { text-align: right; width: auto; }
          .qr-placeholder { width: 190px; height: 190px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; }
          
          .invoice-details { display: flex; justify-content: space-between; margin: 10px 0; font-size: 12px; }
          .details-column { flex: 1; }
          .detail-row { margin: 3px 0; display: flex; }
          .detail-label { font-weight: bold; min-width: 100px; }
          .detail-value { flex: 1; }
          
          .parties { display: flex; gap: 20px; margin: 15px 0; font-size: 12px; }
          .party { flex: 1; border: 1px solid #000; padding: 8px; }
          .party-title { font-weight: bold; margin-bottom: 5px; text-decoration: underline; }
          .party-line { margin: 2px 0; }
          
          .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .items-table th { border: 1px solid #000; padding: 6px; background: #f5f5f5; font-weight: bold; font-size: 12px; text-align: center; }
          .items-table td { border: 1px solid #000; padding: 6px; font-size: 12px; }
          
          .totals-section { display: flex; gap: 20px; margin: 15px 0; }
          .totals-left { flex: 2; }
          .totals-right { flex: 1; border: 1px solid #000; padding: 8px; }
          .totals-right-row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 12px; }
          .total-amount { font-weight: bold; border-top: 2px solid #000; padding-top: 4px; margin-top: 4px; }
          
          .amount-words { font-size: 12px; margin: 10px 0; padding: 8px; border: 1px solid #000; }
          .amount-label { font-weight: bold; }
          
          .tax-breakdown { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .tax-breakdown th, .tax-breakdown td { border: 1px solid #000; padding: 6px; font-size: 12px; text-align: right; }
          .tax-breakdown th { background: #f5f5f5; font-weight: bold; }
          
          .footer-section { display: flex; gap: 15px; margin: 15px 0; font-size: 12px; }
          .footer-col { flex: 1; border: 1px solid #000; padding: 8px; }
          .footer-col-title { font-weight: bold; margin-bottom: 5px; }
          
          .signature-section { display: flex; justify-content: space-between; margin-top: 20px; text-align: center; font-size: 12px; }
          .signature-block { width: 150px; }
          .signature-line { border-top: 1px solid #000; margin-top: 30px; padding-top: 5px; }
          .invoice-copy { page-break-after: always; break-after: page; }
          .invoice-copy:last-of-type { page-break-after: auto; break-after: auto; }
          
          @media print {
            body { margin: 0; padding: 0; }
            .page { margin: 0; padding: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <!-- Header -->
          <div class="header">
            <div class="company-block">
              <img src="${logo}" alt="Company Logo" class="company-logo" />
              <div class="company-info">
                <div class="company-name">${companyInfo.name}</div>
                <div class="company-details">
                  <div>${companyInfo.address}</div>
                  <div>GSTIN/UIN: ${companyInfo.gstin}</div>
                  <div>Contact: ${companyInfo.contact}</div>
                  ${irn ? `<div style="font-size: 12px; margin-top: 4px;"><strong>IRN:</strong> ${irn}</div>` : ''}
                  ${ackNo ? `<div style="font-size: 12px; margin-top: 2px;"><strong>ACK No:</strong> ${ackNo}</div>` : ''}
                  ${ackDto ? `<div style="font-size: 12px; margin-top: 2px;"><strong>ACK Date:</strong> ${ackDto}</div>` : ''}
                </div>
              </div>
            </div>
            <div class="header-right">
              <div class="invoice-type">
                TAX INVOICE<br/>
                <span class="copy-label">(Original for Supplier)</span>
              </div>
              <div class="qr-section">
                ${qrLink ? `<img src="${qrLink}" alt="QR Code" style="width: 158px; height: 151px; border: 1px solid #ccc;" />` : `<div class="qr-placeholder">[QR Code]</div>`}
              </div>
            </div>
          </div>

          <!-- Invoice Meta Details -->
          <div class="invoice-details">
            <div class="details-column">
              <div class="detail-row">
                <div class="detail-label">Invoice No.:</div>
                <div class="detail-value">${invoiceDetails.invoiceNo}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Dated:</div>
                <div class="detail-value">${formattedInvoiceDate}</div>
              </div>
            </div>
            <div class="details-column">
              <div class="detail-row">
                <div class="detail-label">Reference No:</div>
                <div class="detail-value">${invoiceDetails.referenceNo || '-'}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Financial Year:</div>
                <div class="detail-value">${financialYear}</div>
              </div>
               <div class="detail-row">
                <div class="detail-label">Vehicle No:</div>
                <div class="detail-value">${vehicleNos || '-'}</div>
              </div>

            </div>
          </div>

          <!-- Parties Section -->
          <div class="parties">
            <div class="party">
              <div class="party-title">Buyer (Bill To)</div>
              <div class="party-line"><strong>${currentBuyerDetails.name}</strong></div>
              <div class="party-line">${currentBuyerDetails.address1}</div>
               <div class="party-line">${currentBuyerDetails.address2}</div>
               <div class="party-line">${currentBuyerDetails.city} - ${currentBuyerDetails.pincode}</div>
               <div class="party-line">${currentBuyerDetails.state}</div>
              <div class="party-line">GSTIN/UIN: ${currentBuyerDetails.gstin}</div>
              <div class="party-line">Contact: ${currentBuyerDetails.contact}</div>
            </div>
            <div class="party">
              <div class="party-title">Consignee (Ship To) </div>
              <div class="party-line"><strong>${currentShipToDetails.name}</strong></div>
              <div class="party-line">${currentShipToDetails.address1}</div>
               <div class="party-line">${currentShipToDetails.address2}</div>
               <div class="party-line">${currentShipToDetails.city} - ${currentShipToDetails.pincode}</div>
               <div class="party-line">${currentShipToDetails.state}</div>
              <div class="party-line">GSTIN/UIN: ${currentShipToDetails.gstin}</div>
              <div class="party-line">Contact: ${currentShipToDetails.contact}</div>
            </div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 3%;">S.No</th>
                <th style="width: 7%;">DC No</th>
                <th style="width: 37%;">Description of Services</th>
                <th style="width: 8%;">Color</th>
                <th style="width: 8%;">Qty</th>
                <th style="width: 6%;">Unit</th>
                <th style="width: 10%;">Rate</th>
                <th style="width: 8%;">Tax %</th>
                <th style="width: 12%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
         

          <!-- Totals Section -->
          <div class="totals-section">
            <div class="totals-left">
              <div class="amount-words">
                <span class="amount-label">Amount Chargeable (in words):</span>
                <div style="margin-top: 3px;">${amountInWords}</div>
              </div>
            </div>
            <div class="totals-right">
              <div class="totals-right-row">
                <span>Subtotal:</span>
                <span>₹ ${invoiceTotals.subTotal}</span>
              </div>
              <div class="totals-right-row">
                <span>Discount:</span>
                <span>₹ ${invoiceTotals.totalDiscount}</span>
              </div>
              <div class="totals-right-row">
                <span>Tax:</span>
                <span>₹ ${invoiceTotals.totalTax}</span>
              </div>
              <div class="totals-right-row total-amount">
                <span>Total Amount:</span>
                <span>₹ ${invoiceTotals.totalAmount}</span>
              </div>
            </div>
          </div>

          <!-- Tax Breakdown -->
          <table class="tax-breakdown">
            <thead>
              <tr>
                <th style="text-align: left; width: 30%;">HSN/SAC</th>
                <th style="width: 15%;">Taxable Value</th>
                ${taxStatus.type === 'cgst_sgst' ? `
                  <th style="width: 15%;">CGST Rate</th>
                  <th style="width: 15%;">CGST Amount</th>
                  <th style="width: 15%;">SGST Rate</th>
                  <th style="width: 15%;">SGST Amount</th>
                ` : `
                  <th style="width: 15%;">IGST Rate</th>
                  <th style="width: 15%;">IGST Amount</th>
                `}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align: left;">998821</td>
                <td>₹ ${subtotal.toFixed(2)}</td>
                ${taxStatus.type === 'cgst_sgst' ? `
                  <td>${cgstRate}%</td>
                  <td>₹ ${cgstAmount.toFixed(2)}</td>
                  <td>${sgstRate}%</td>
                  <td>₹ ${sgstAmount.toFixed(2)}</td>
                ` : `
                  <td>${igstRate}%</td>
                  <td>₹ ${igstAmount.toFixed(2)}</td>
                `}
              </tr>
            </tbody>
          </table>

          <!-- Footer Sections -->
          <div class="footer-section">
            <div class="footer-col">
              <div class="footer-col-title">Declaration</div>
              <div style="font-size: 12px;">1) Customers must inspect the goods at the time of delivery Once goods are delivered, company will not be liable for any quality claim.

2) Payment accept A/C payee Cheque/RTGS/NEFT only.

3) Payment made after the due date will attract interest @ 18% PA

4) GST and any other applicable taxes/duties will be charged extra as per govt norms.</div>
            </div>
          
            <div class="footer-col" style="line-height:25px">
              <div class="footer-col-title">Company's Bank Details</div>
              <div>Bank Name: - Dhanlaxmi Bank- CC A/c</div>
              <div>Account Number: - 012510100001612</div>
              <div>IFSC Code: - V.Chatram Erode & DLXB0000125</div>
            </div>
            
            </div>

          <!-- Signature Section -->
          <div class="signature-section">
            <div class="signature-block" style="width:300px">
              <div>SUBJECT TO ERODE JURISDICTION</div>
              <div>This is a Computer Generated Invoice</div>
            </div>
            <div class="signature-block">
              <div>For Sri Shiva Designs</div>
              <div class="signature-line"></div>
              <div>Authorized Signatory</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
      newWindow.focus();

      const basePage = newWindow.document.querySelector('.page');
      if (basePage) {
        const docBody = newWindow.document.body;
        docBody.innerHTML = '';

        invoiceCopyLabels.forEach((label, index) => {
          const pageCopy = basePage.cloneNode(true);
          pageCopy.classList.add('invoice-copy');

          const copyLabelNode = pageCopy.querySelector('.copy-label');
          if (copyLabelNode) {
            copyLabelNode.textContent = `(${label})`;
          }

          if (index === invoiceCopyLabels.length - 1) {
            pageCopy.classList.remove('invoice-copy');
          }

          docBody.appendChild(pageCopy);
        });
      }

      setTimeout(() => {
        newWindow.print();
      }, 500);
    } else {
      alert('Unable to open print window.');
    }
  };

  const convertAmountToWords = (amount) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertGroup = (num) => {
      if (num === 0) return '';
      if (num < 10) return ones[num];
      if (num < 20) return teens[num - 10];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
      return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convertGroup(num % 100) : '');
    };

    const roundedAmount = Math.round(amount);
    if (roundedAmount === 0) return 'Zero Only';

    const crores = Math.floor(roundedAmount / 10000000);
    const lakhs = Math.floor((roundedAmount % 10000000) / 100000);
    const thousands = Math.floor((roundedAmount % 100000) / 1000);
    const remainder = roundedAmount % 1000;

    let words = '';
    if (crores) words += convertGroup(crores) + ' Crore ';
    if (lakhs) words += convertGroup(lakhs) + ' Lakh ';
    if (thousands) words += convertGroup(thousands) + ' Thousand ';
    if (remainder) words += convertGroup(remainder);

    return (words.trim() + ' Only').replace(/\s+/g, ' ');
  };

  const saveInvoice = () => {
    const invoice = {
      invoiceNo: invoiceDetails.invoiceNo,
      invoiceDate: invoiceDetails.invoiceDate,
      financialYear: invoiceDetails.financialYear || getFinancialYear(invoiceDetails.invoiceDate),
      referenceNo: invoiceDetails.referenceNo,
      customer: customerName,
      customerid: invoiceDetails.customerid || stateCustomerId || invoiceState.customerid || invoiceState.customerId || invoiceState.customer_id || '',
      vehicleNos,
      items: lineItems,
      subtotal: invoiceTotals.subTotal,
      totalDiscount: invoiceTotals.totalDiscount,
      totalTax: invoiceTotals.totalTax,
      totalAmount: invoiceTotals.totalAmount,
      cgst: invoiceTotals.cgst,
      sgst: invoiceTotals.sgst,
      igst: invoiceTotals.igst,
      taxStatus: taxStatus.label,
      taxType: taxStatus.type,
      shipToAddress: shipToDetails,
      ship_name: shipToDetails.ship_name || '',
      ship_contact_number: shipToDetails.ship_contact_number || '',
      ship_address1: shipToDetails.ship_address1 || '',
      ship_address2: shipToDetails.ship_address2 || '',
      ship_city: shipToDetails.ship_city || '',
      ship_state: shipToDetails.ship_state || '',
      ship_pincode: shipToDetails.ship_pincode || '',
      ship_gstin: shipToDetails.ship_gstin || ''
    };
    
    return invoice;
  };

  const hasInvalidRate = lineItems.some((item) => Number(item.rate || 0) <= 0);

  const handleSave = async () => {
    if (isSaving) return;
    if (hasInvalidRate) {
      alert('Invoice cannot be saved when rate is 0. Please enter a valid rate for all line items.');
      return;
    }
    const invoice = saveInvoice();
    const apiPath = isEditMode ? 'updateInvoice' : 'addInvoice';
    setIsSaving(true);
    try {
      const response = await axios.post(`${API_URL}/${apiPath}`, invoice);
      if (response && response.data) {
        alert(isEditMode ? 'Invoice updated successfully.' : 'Invoice created successfully.');
        setHasSavedInvoice(true);
        setShowPrintPrompt(true);
      } else {
        alert('Invoice saved locally but no server response');
      }
    } catch (err) {
      console.error('Save invoice error', err);
      alert('Failed to save invoice to server. Saved locally.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelInvoice = async () => {
    if (!isEditMode) return;

    const invoiceNo = (invoiceDetails.invoiceNo || '').toString().trim();
    if (!invoiceNo) {
      alert('Invoice number is required to cancel invoice.');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to cancel invoice ${invoiceNo}?`);
    if (!confirmed) return;

    setIsCancelling(true);
    try {
      const response = await axios.post(`${API_URL}/cancelInvoice`, { invoiceNo });
      if (response && response.data.message === 'y') {
        alert('Invoice cancelled successfully.');
        navigate('/invoices');
      } else {
        alert('Invocie not cancelled.');
      }
    } catch (err) {
      console.error('Cancel invoice error', err);
      alert('Failed to cancel invoice.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePrintPromptYes = async () => {
    setShowPrintPrompt(false);
    await handlePrint();
  };

  const handlePrintPromptNo = () => {
    setShowPrintPrompt(false);
    navigate('/invoices');
  };

  const pageTitle = isEditMode ? 'Edit Invoice' : 'Create Invoice';
  const pageSubtitle = isEditMode ? 'Update invoice details.' : 'Create a new invoice from selected delivery line items.';

  return (
    <div className="main-content">
      {isSaving && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)', zIndex: 2000 }}
        >
          <Spinner animation="border" variant="light" role="status" className="mb-3">
            <span className="visually-hidden">Saving...</span>
          </Spinner>
          <div className="text-white fw-semibold">Saving invoice...</div>
        </div>
      )}
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
            <p className="text-gray-600">{pageSubtitle}</p>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Invoice No</Form.Label>
              <Form.Control
                type="text"
                value={invoiceDetails.invoiceNo}
                onChange={(e) => setInvoiceDetails((prev) => ({ ...prev, invoiceNo: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Invoice Date</Form.Label>
              <Form.Control
                type="date"
                value={invoiceDetails.invoiceDate}
                onChange={(e) => setInvoiceDetails((prev) => ({ ...prev, invoiceDate: e.target.value, financialYear: getFinancialYear(e.target.value) }))}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Reference No</Form.Label>
              <Form.Control
                type="text"
                value={invoiceDetails.referenceNo}
                onChange={(e) => setInvoiceDetails((prev) => ({ ...prev, referenceNo: e.target.value }))}
              />
            </Form.Group>
          </Col>
          <Col md={3} className="flex items-end">
            <Button variant="secondary" className="mr-2" onClick={handleBack}>
              Back to Delivery
            </Button>
            <Button variant="primary" onClick={handlePrint} disabled={!hasSavedInvoice || isSaving}>
              Print Invoice
            </Button>
          </Col>
        </Row>

        <Row>
          <Col>
            <div className="overflow-auto border rounded bg-white p-4">
              <div className="mb-4">
                <p>
                  <strong>Customer:</strong> {customerName || 'No customer selected'}
                </p>
                <p>
                  <strong>Line items selected:</strong> {lineItems.length}
                </p>
                <p>
                  <strong>Vehicle No:</strong> {vehicleNos || '-'}
                </p>
                <p>
                  <strong>Tax Status:</strong> {taxStatusLoading ? 'Checking...' : taxStatus.label}
                </p>
              </div>

              <div className="mb-4 rounded border bg-light p-3">
                <h6 className="mb-3">Ship To Address</h6>
               

                <Row className="g-3">
                  <Col md={4}>
                    <p>{shipToDetails.ship_name || ''} , {shipToDetails.ship_address1 || ''} </p>                  
                    <p>{shipToDetails.ship_address2 || ''} , {shipToDetails.ship_city || ''}</p>
                    <p>{shipToDetails.ship_state || ''} - {shipToDetails.ship_pincode || ''}</p>
                       <p>{shipToDetails.contact_number || ''}</p>
                  </Col>
                 
                </Row>
              </div>

              <Table bordered responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>DC No</th>
                    <th>Description</th>
                    <th>Color</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Rate</th>
                    <th>{taxStatus.taxColumns.length > 1 ? 'CGST/SGST %' : 'IGST %'}</th>
                    {taxStatus.type === 'cgst_sgst' ? (
                      <>
                        <th>CGST</th>
                        <th>SGST</th>
                      </>
                    ) : (
                      <th>IGST</th>
                    )}
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length === 0 && (
                    <tr>
                      <td colSpan={taxStatus.type === 'cgst_sgst' ? '11' : '10'} className="text-center py-4">
                        No selected items. Go back to Delivery and choose delivery line items first.
                      </td>
                    </tr>
                  )}
                  {lineItems.map((item, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.dcNo}</td>
                        <td>{item.description}</td>
                        <td>{item.color}</td>
                        <td>
                          <Form.Control
                            size="sm"
                            value={item.quantity}
                            onChange={(e) => {
                              const copy = JSON.parse(JSON.stringify(lineItems));
                              copy[index].quantity = e.target.value;
                              copy[index] = syncLineItemTaxBreakdown(copy[index]);
                              setLineItems(copy);
                            }}
                          />
                        </td>
                        <td>{item.unit}</td>
                        <td>
                          <Form.Control
                            size="sm"
                            value={item.rate}
                            onChange={(e) => {
                              const copy = JSON.parse(JSON.stringify(lineItems));
                              copy[index].rate = e.target.value;
                              copy[index] = syncLineItemTaxBreakdown(copy[index]);
                              setLineItems(copy);
                            }}
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            value={item.tax || 0}
                            onChange={(e) => {
                              const copy = JSON.parse(JSON.stringify(lineItems));
                              copy[index].tax = e.target.value;
                              copy[index] = syncLineItemTaxBreakdown(copy[index]);
                              setLineItems(copy);
                            }}
                          />
                        </td>
                        {taxStatus.type === 'cgst_sgst' ? (
                          <>
                            <td>{item.cgst || '0.00'}</td>
                            <td>{item.sgst || '0.00'}</td>
                          </>
                        ) : (
                          <td>{item.igst || '0.00'}</td>
                        )}
                        <td>{item.amount}</td>
                      </tr>
                  ))}
                </tbody>
              </Table>

              <div className="mt-4 rounded border bg-gray-50 p-4">
                <Row className="mb-2">
                  <Col md={9}><strong>Subtotal</strong></Col>
                  <Col md={3} className="text-end">{invoiceTotals.subTotal}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={9}><strong>Total Discount</strong></Col>
                  <Col md={3} className="text-end">
                    <Form.Control
                      size="sm"
                      type="number"
                      className="text-end"
                      value={invoiceDetails.totalDiscount}
                      onChange={(e) => setInvoiceDetails((prev) => ({ ...prev, totalDiscount: e.target.value }))}
                    />
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col md={9}><strong>Total Tax</strong></Col>
                  <Col md={3} className="text-end">{invoiceTotals.totalTax}</Col>
                </Row>
                {taxStatus.type === 'cgst_sgst' ? (
                  <>
                    <Row className="mb-2">
                      <Col md={9}>CGST (2.5%)</Col>
                      <Col md={3} className="text-end">{invoiceTotals.cgst}</Col>
                    </Row>
                    <Row className="mb-2">
                      <Col md={9}>SGST (2.5%)</Col>
                      <Col md={3} className="text-end">{invoiceTotals.sgst}</Col>
                    </Row>
                  </>
                ) : (
                  <Row className="mb-2">
                    <Col md={9}>IGST (5%)</Col>
                    <Col md={3} className="text-end">{invoiceTotals.igst}</Col>
                  </Row>
                )}
                <Row>
                  <Col md={9}><strong>Total Amount</strong></Col>
                  <Col md={3} className="text-end"><strong>{invoiceTotals.totalAmount}</strong></Col>
                </Row>

                <Row className="mt-3">
                  <Col className="d-flex justify-content-end">
                    {isEditMode && (
                      <Button variant="danger" className="me-2" onClick={handleCancelInvoice} disabled={isCancelling || isSaving}>
                        {isCancelling ? 'Cancelling...' : 'Cancel Invoice'}
                      </Button>
                    )}
                    {!isEditMode && (
                      <Button variant="success" onClick={handleSave} disabled={isSaving || hasInvalidRate}>
                        {isSaving ? 'Saving...' : 'Save Invoice'}
                      </Button>
                    )}
                  </Col>
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <Modal show={showPrintPrompt} onHide={handlePrintPromptNo} centered>
        <Modal.Header closeButton>
          <Modal.Title>Print Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>Do you want to print the invoice now?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handlePrintPromptNo}>
            No
          </Button>
          <Button variant="primary" onClick={handlePrintPromptYes}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Invoice;

import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';

function Invoice() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const invoiceState = location.state || {};
  const stateInvoiceNo = invoiceState.invoiceNo || invoiceState.invNo || invoiceState.invoice_number || '';
  const isEditMode = Boolean(stateInvoiceNo);
  const initialItems = Array.isArray(invoiceState.items) ? invoiceState.items : [];
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [existingChecked, setExistingChecked] = useState(false);

  const stateCustomerId = invoiceState.customerid || invoiceState.customerId || invoiceState.customer_id || invoiceState.customerID || invoiceState.customerID || '';

  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNo: stateInvoiceNo || '',
    invoiceDate: invoiceState.invoiceDate || new Date().toISOString().slice(0, 10),
    referenceNo: invoiceState.referenceNo || '',
    totalDiscount: invoiceState.totalDiscount || 0,
    financialYear: invoiceState.financialYear || '',
    customer: invoiceState.customer || '',
    customerid: stateCustomerId || ''
  });

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

  const [lineItems, setLineItems] = useState(() =>
    initialItems.map((item) => ({
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

  async function readInvoices() {
    // Try backend first
    try {
      const resp = await axios.get(`${API_URL}/getInvoiceNo`);
      
      if (resp && resp.data) {
        console.log('Form Submitted with Data:', resp.data);
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
    const invoices = await readInvoices();
    const count = invoices.message ? invoices.message + 1 : 1;
    const date = new Date(invoiceDetails.invoiceDate || Date.now());
    const fy = getFinancialYear(date);
    return `INV-${fy}-${String(count).padStart(4, '0')}`;
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

  const recalcLineAmount = (line) => {
    const qty = Number(line.quantity || 0);
    const rate = Number(line.rate || 0);
    const base = qty * rate;
    const tax = (Number(line.tax || 0) / 100) * base;
    const total = base + tax;
    return { base, tax, total };
  };

  const invoiceTotals = useMemo(() => {
    let totalTax = 0;
    lineItems.forEach((item) => {
      const qty = Number(item.quantity || 0);
      const rate = Number(item.rate || 0);
      const base = qty * rate;
      const tax = (Number(item.tax || 0) / 100) * base;
      totalTax += tax;
    });
    const discountValue = Number(invoiceDetails.totalDiscount || 0);
    const subTotal = lineItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0), 0);
    const total = subTotal + totalTax - discountValue;
    return {
      subTotal: subTotal.toFixed(2),
      totalDiscount: discountValue.toFixed(2),
      totalTax: totalTax.toFixed(2),
      totalAmount: total.toFixed(2)
    };
  }, [lineItems, invoiceDetails.totalDiscount]);

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

  const handlePrint = () => {
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

    const rowsHtml = lineItems
      .map((item, index) => `
        <tr>
          <td style="padding:8px;border:1px solid #ccc;">${index + 1}</td>
          <td style="padding:8px;border:1px solid #ccc;">${item.dcNo || ''}</td>
          <td style="padding:8px;border:1px solid #ccc;">${item.description}</td>
          <td style="padding:8px;border:1px solid #ccc;">${item.color || ''}</td>
          <td style="padding:8px;border:1px solid #ccc;">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #ccc;">${item.unit}</td>
          <td style="padding:8px;border:1px solid #ccc;">${item.rate}</td>
          <td style="padding:8px;border:1px solid #ccc;">${item.tax || 0}</td>
          <td style="padding:8px;border:1px solid #ccc;">${item.amount}</td>
        </tr>
      `)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #222; }
          h1, h2, h3, h4 { margin: 0; }
          .invoice-header { margin-bottom: 20px; }
          .invoice-header p { margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #f4f4f4; }
          .footer { margin-top: 24px; }
          .summary { margin-top: 20px; width: 100%; max-width: 480px; }
          .summary td { padding: 8px; }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <h1>Invoice</h1>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Invoice No:</strong> ${invoiceDetails.invoiceNo}</p>
          <p><strong>Invoice Date:</strong> ${invoiceDetails.invoiceDate}</p>
          <p><strong>Financial Year:</strong> ${invoiceDetails.financialYear || getFinancialYear(invoiceDetails.invoiceDate)}</p>
          <p><strong>Reference No:</strong> ${invoiceDetails.referenceNo}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>DC No</th>
              <th>Description</th>              <th>Color</th>              <th>Color</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Rate</th>
              <th>Tax %</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <table class="summary">
          <tbody>
            <tr>
              <td><strong>Subtotal</strong></td>
              <td>${invoiceTotals.subTotal}</td>
            </tr>
            <tr>
              <td><strong>Total Discount</strong></td>
              <td>${invoiceTotals.totalDiscount}</td>
            </tr>
            <tr>
              <td><strong>Total Tax</strong></td>
              <td>${invoiceTotals.totalTax}</td>
            </tr>
            <tr>
              <td><strong>Total Amount</strong></td>
              <td>${invoiceTotals.totalAmount}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p><strong>Total Items:</strong> ${lineItems.length}</p>
        </div>
      </body>
      </html>
    `;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
      newWindow.focus();
      newWindow.print();
    } else {
      alert('Unable to open print window.');
    }
  };

  const saveInvoice = () => {
    const invoice = {
      invoiceNo: invoiceDetails.invoiceNo,
      invoiceDate: invoiceDetails.invoiceDate,
      financialYear: invoiceDetails.financialYear || getFinancialYear(invoiceDetails.invoiceDate),
      referenceNo: invoiceDetails.referenceNo,
      customer: customerName,
      customerid: invoiceDetails.customerid || stateCustomerId || invoiceState.customerid || invoiceState.customerId || invoiceState.customer_id || '',
      items: lineItems,
      subtotal: invoiceTotals.subTotal,
      totalDiscount: invoiceTotals.totalDiscount,
      totalTax: invoiceTotals.totalTax,
      totalAmount: invoiceTotals.totalAmount
    };
    
    return invoice;
  };

  const handleSave = async () => {
    const invoice = saveInvoice();
    const apiPath = isEditMode ? 'updateInvoice' : 'addInvoice';
    try {
      const response = await axios.post(`${API_URL}/${apiPath}`, invoice);
      if (response && response.data) {
        alert(isEditMode ? 'Invoice updated successfully' : 'Invoice created successfully');
        navigate('/invoices');
      } else {
        alert('Invoice saved locally but no server response');
      }
    } catch (err) {
      console.error('Save invoice error', err);
      alert('Failed to save invoice to server. Saved locally.');
    }
  };

  const pageTitle = isEditMode ? 'Edit Invoice' : 'Create Invoice';
  const pageSubtitle = isEditMode ? 'Update invoice details.' : 'Create a new invoice from selected delivery line items.';

  return (
    <div className="main-content">
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
            <Button variant="primary" onClick={handlePrint}>
              
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
                    <th>Tax %</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length === 0 && (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
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
                              const { total } = recalcLineAmount(copy[index]);
                              copy[index].amount = total.toFixed(2);
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
                              const { total } = recalcLineAmount(copy[index]);
                              copy[index].amount = total.toFixed(2);
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
                              const { total } = recalcLineAmount(copy[index]);
                              copy[index].amount = total.toFixed(2);
                              setLineItems(copy);
                            }}
                          />
                        </td>
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
                <Row>
                  <Col md={9}><strong>Total Amount</strong></Col>
                  <Col md={3} className="text-end"><strong>{invoiceTotals.totalAmount}</strong></Col>
                </Row>

                <Row className="mt-3">
                  <Col className="d-flex justify-content-end">
                    <Button variant="success" onClick={handleSave}>{isEditMode ? 'Update Invoice' : 'Save Invoice'}</Button>
                  </Col>
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Invoice;

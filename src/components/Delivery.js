import React, { useState,  useRef ,useEffect} from 'react';
import { Container, Button, Row, Dropdown, Modal, Form, } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../css/Styles.css';
import '../css/DataTable.css';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import Select from 'datatables.net-select-dt';
import FixedHeader from 'datatables.net-fixedcolumns-dt';
import Responsive from 'datatables.net-responsive-dt';
import DT from 'datatables.net-dt';
import logo from '../img/slogo.png'
import $ from 'jquery';
//import PrintDataTable from '../components/PrintDataTable';

const API_URL = 'https://www.wynstarcreations.com/seyal/api';

DataTable.use(Responsive); DataTable.use(Select);
DataTable.use(FixedHeader); DataTable.use(DT);

function Delivery() {
  const table = useRef();
  const submittedFiltersRef = useRef({});
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Filter state
    const [filters, setFilters] = useState({
      fromDate: '',
      toDate: '',
      customer: '',
      machine: '',
      fabric: '',
      shade: '',
      construction: ''
    });
  
    // Options state
    const [options, setOptions] = useState({
      customers: [],
      machines: [],
      fabrics: [],
      shades: [],
      constructions: []
    });

    const mapCustomerMasterRow = (row) => ({
      id: row[0],
      name: row[1],
      contact_number: row[2],
      email: row[3],
      address1: row[4],
      address2: row[5],
      city: row[6],
      state: row[7],
      pincode: row[8],
      gstin: row[9],
      ship_contact_number: row[10],
      ship_address1: row[11],
      ship_address2: row[12],
      ship_state: row[13],
      ship_pincode: row[14],
      ship_gstin: row[15],
      ship_name: row[17],
      shipToRaw: row[18]
    });

    const normalizeDefaultFlag = (value) => (
      value === true ||
      value === 1 ||
      value === '1' ||
      String(value).toLowerCase() === 'true'
    );

    const normalizeShipToAddress = (item, index) => ({
      ship_name: (item?.ship_name || item?.name || '').toString().trim(),
      ship_contact_number: (item?.ship_contact_number || item?.contact_number || '').toString().trim(),
      ship_address1: (item?.ship_address1 || item?.address1 || '').toString().trim(),
      ship_address2: (item?.ship_address2 || item?.address2 || '').toString().trim(),
      ship_city: (item?.ship_city || item?.city || '').toString().trim(),
      ship_state: (item?.ship_state || item?.state || '').toString().trim(),
      ship_pincode: (item?.ship_pincode || item?.pincode || '').toString().trim(),
      ship_gstin: (item?.ship_gstin || item?.gstin || '').toString().trim(),
      is_default: normalizeDefaultFlag(item?.is_default)
    });

    const parseShipToPayload = (rawValue) => {
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

      const normalized = parsed
        .map((item, index) => normalizeShipToAddress(item, index))
        .filter((item) => [
          item.ship_name,
          item.ship_contact_number,
          item.ship_address1,
          item.ship_address2,
          item.ship_city,
          item.ship_state,
          item.ship_pincode,
          item.ship_gstin
        ].some(Boolean));

      if (!normalized.length) return [];

      const defaultIndex = normalized.findIndex((item) => item.is_default);
      const effectiveDefaultIndex = defaultIndex >= 0 ? defaultIndex : 0;
      return normalized.map((item, index) => ({
        ...item,
        is_default: index === effectiveDefaultIndex
      }));
    };

    const getShipToChoicesForCustomer = (customerMaster) => {
      if (!customerMaster) return [];

      let parsedShipTo = [];
      if (customerMaster.shipToRaw) {
        try {
          const parsed = typeof customerMaster.shipToRaw === 'string'
            ? JSON.parse(customerMaster.shipToRaw)
            : customerMaster.shipToRaw;
          parsedShipTo = parseShipToPayload(parsed);
        } catch (e) {
          parsedShipTo = [];
        }
      }

      if (parsedShipTo.length) {
        return parsedShipTo;
      }

      const legacy = normalizeShipToAddress({
        ship_name: customerMaster.ship_name || customerMaster.name,
        ship_contact_number: customerMaster.ship_contact_number || customerMaster.contact_number,
        ship_address1: customerMaster.ship_address1 || customerMaster.address1,
        ship_address2: customerMaster.ship_address2 || customerMaster.address2,
        ship_city: customerMaster.city,
        ship_state: customerMaster.ship_state || customerMaster.state,
        ship_pincode: customerMaster.ship_pincode || customerMaster.pincode,
        ship_gstin: customerMaster.ship_gstin || customerMaster.gstin,
        is_default: true
      }, 0);

      const hasAnyValue = [
        legacy.ship_name,
        legacy.ship_address1,
        legacy.ship_address2,
        legacy.ship_city,
        legacy.ship_state,
        legacy.ship_pincode,
        legacy.ship_contact_number,
        legacy.ship_gstin
      ].some(Boolean);

      return hasAnyValue ? [legacy] : [];
    };

    const getShipToChoicesForCustomerFromApi = async (customerMaster) => {
      const localChoices = getShipToChoicesForCustomer(customerMaster);
      if (!customerMaster?.id) return localChoices;

      try {
        const response = await axios.post(`${API_URL}/getCustomerShipto`, { customerId: customerMaster.id });
        const payload = response?.data;

        const candidates = [
          payload,
          payload?.data,
          payload?.result,
          payload?.rows,
          payload?.items,
          payload?.ship_to_addresses,
          payload?.shiptoaddresses,
          payload?.ship_addresses_json,
          payload?.ship_address,
          payload?.shipAddress,
          payload?.shipToAddresses,
          payload?.data?.ship_to_addresses,
          payload?.data?.shiptoaddresses,
          payload?.data?.ship_addresses_json,
          payload?.data?.ship_address,
          payload?.data?.shipAddress,
          payload?.data?.shipToAddresses
        ].filter(Boolean);

        for (const candidate of candidates) {
          const parsedChoices = parseShipToPayload(candidate);
          if (parsedChoices.length) {
            return parsedChoices;
          }
        }
      } catch (error) {
        console.warn('Failed to fetch ship-to choices from API', error);
      }

      return localChoices;
    };


  
    // Fetch customer and machine on mount
    React.useEffect(() => {
      const fetchMasters = async () => {
        try {
          const [customers, machines, fabrics, constructions] = await Promise.all([
            fetch(`${API_URL}/getMasters?type=customer`).then(r => r.json()),
            fetch(`${API_URL}/getMasters?type=machine`).then(r => r.json()),
            fetch(`${API_URL}/getMasters?type=fabric`).then(r => r.json()),
            fetch(`${API_URL}/getMasters?type=construction`).then(r => r.json())
          ]);

          setOptions(o => ({
            ...o,
            customers: customers.map(mapCustomerMasterRow),
            machines: machines.map(row => ({ id: row[0], name: row[1] })),
            fabrics: fabrics.map(row => ({ id: row[0], name: row[1] })),
            constructions: constructions.map(row => ({ id: row[0], name: row[1] }))
          }));
       
        } catch (e) { console.error(e); }
      };
      fetchMasters();
    }, []);
  
    // Function to fetch masters (reusable)
    const fetchMastersData = async () => {
      try {
        const [customers, machines,fabrics,constructions] = await Promise.all([
          fetch(`${API_URL}/getMasters?type=customer`).then(r => r.json()),
          fetch(`${API_URL}/getMasters?type=machine`).then(r => r.json()),
          fetch(`${API_URL}/getMasters?type=fabric`).then(r => r.json()),
          fetch(`${API_URL}/getMasters?type=construction`).then(r => r.json())
        ]);
  
         setOptions(o => ({
    ...o,
    customers: customers.map(mapCustomerMasterRow),
    machines: machines.map(row => ({ id: row[0], name: row[1] })),
    fabrics: fabrics.map(row => ({ id: row[0], name: row[1] })),          
    constructions: constructions.map(row => ({ id: row[0], name: row[1] }))
  }));
       
      } catch (e) { console.error(e); }
    };
  
    // Fetch fabric, shade, construction when customer or date changes
    React.useEffect(() => {
      if (!filters.customer) {
        setOptions(o => ({ ...o, fabrics: [], shades: [], constructions: [] }));
        setFilters(f => ({ ...f, fabric: '', shade: '', construction: '' }));
        return;
      }
      const fetchDependent = async () => {
        try {
          const params = `customer=${encodeURIComponent(filters.customer)}&fromDate=${encodeURIComponent(filters.fromDate)}&toDate=${encodeURIComponent(filters.toDate)}`;
          const [fabrics, shades, constructions] = await Promise.all([
            fetch(`${API_URL}/getFilterMasters?type=fabric&${params}`).then(r => r.json()),
            fetch(`${API_URL}/getFilterMasters?type=shade&${params}`).then(r => r.json()),
            fetch(`${API_URL}/getFilterMasters?type=construction&${params}`).then(r => r.json())
          ]);
          setOptions(o => ({
            ...o,
            fabrics: fabrics.map(row => ({ id: row[0], name: row[1] })),
            shades: shades.map(row => ({ id: row[0], name: row[1] })),
            constructions: constructions.map(row => ({ id: row[0], name: row[1] }))
          }));
        } catch (e) { console.error(e); }
      };
      fetchDependent();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.customer]);
  
    // Handle filter change (do not reload table)
    const handleFilterChange = (name, value) => {
      setFilters(f => ({ ...f, [name]: value }));
      if (name === 'customer') {
        setFilters(f => ({ ...f, fabric: '', shade: '', construction: '', customer: value }));
      }
  
      
      // Do NOT reload table here
    };
  
    // Handle submit button click
    const handleSubmitFilters = () => {    
      submittedFiltersRef.current = filters;
      if (table.current && table.current.dt) {
        table.current.dt().ajax.reload();
      }
    };
  
    // Handle reset button click
    const handleResetFilters = () => {
      //const defaultDates = getDefaultDates();
      setFilters({
        fromDate: '',
        toDate: '',
        customer: '',
        machine: '',
        fabric: '',
        shade: '',
        construction: ''
      });
      submittedFiltersRef.current = {
        fromDate: '',
        toDate: '',
        customer: '',
        machine: '',
        fabric: '',
        shade: '',
        construction: ''
      };
      // Call fetchMasters to reload all options
      fetchMastersData();
      if (table.current && table.current.dt) {
        table.current.dt().ajax.reload();
      }
    };

    // Reload DataTable when tab becomes active (user returns after idle)
    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && table.current) {
          // Reload DataTable data
          const api = table.current.dt();
          api.ajax.reload();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, []);
  const [formData, setFormData] = useState({ dcno: '', vchno: '' });
  const [show, setShow] = useState(false);
  const [printShipToChoices, setPrintShipToChoices] = useState([]);
  const [selectedPrintShipToIndex, setSelectedPrintShipToIndex] = useState(0);
   const [searchState, setSearchState] = useState('');
   // At the top with other state declarations
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleteReason, setDeleteReason] = useState('');
const [selectedDC, setSelectedDC] = useState(null);

  const rowHasInvoiceStatusY = (row, node) => {
    const normalizeStatus = (value) => (value || '').toString().trim().toLowerCase();
    const hasStatusYInHtml = (value) => /data-inv-status\s*=\s*["']?y["']?/i.test((value || '').toString());

    const nodeStatus = normalizeStatus(node && node.getAttribute ? node.getAttribute('data-inv-status') : '');
    const nodeChildStatus = normalizeStatus(
      node && node.querySelector && node.querySelector('[data-inv-status]')
        ? node.querySelector('[data-inv-status]').getAttribute('data-inv-status')
        : ''
    );
    const rowStatus = Array.isArray(row)
      ? (row.some((value) => hasStatusYInHtml(value)) ? 'y' : '')
      : normalizeStatus(row && (row['data-inv-status'] || row.inv_status || row.invStatus || row.invoiceStatus));

    return nodeStatus === 'y' || nodeChildStatus === 'y' || rowStatus === 'y' || hasStatusYInHtml(JSON.stringify(row || {}));
  };
  const handleClose = () => {
    setShow(false);
    setPrintShipToChoices([]);
    setSelectedPrintShipToIndex(0);
  };
  const handleShow = (e) => {
    setShow(true);
  }

  // Remove the useEffect that was fetching tableData since we're using server-side processing

  if (!isAuthenticated) {
    return null;
  // navigate('/login');  // Avoid rendering profile if the user is not authenticated
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const selectedPrintShipTo =
      printShipToChoices[selectedPrintShipToIndex] ||
      printShipToChoices.find((item) => item.is_default) ||
      null;

    const payload = {
      ...formData,
      shipToAddress: selectedPrintShipTo,
      ship_to_address: selectedPrintShipTo,
      shipToAddressJson: selectedPrintShipTo ? JSON.stringify(selectedPrintShipTo) : '',
      ship_to_address_json: selectedPrintShipTo ? JSON.stringify(selectedPrintShipTo) : ''
    };

    axios.post(`${API_URL}/updateVechileNo`, payload)
      .then(function (response) {

        setShow(false);
        setFormData('');
        let api = table.current.dt();
        let selectedRows = api.rows({ selected: true }).data();
        DCPrint(selectedRows);
        setPrintShipToChoices([]);
        setSelectedPrintShipToIndex(0);
        console.log('Form Submitted with Data:', response.data);

      })
      .catch(function (error) {
        console.log(error);
      });

    //const userData = response.data;
    console.log('Data From Backend:', payload);

  };

  const PrintHandle = async (event) => {
    event.preventDefault();
    let api = table.current.dt();
    let selectedRows = api.rows({ selected: true }).data();

    if (selectedRows.length === 0) {
      alert('Select DC for print');
    } else if (selectedRows[0][21] !== "") {
      alert('This is deleted DC , you cannot take a print');
    } else {

      const selectedRowsArray = selectedRows.toArray ? selectedRows.toArray() : Array.from(selectedRows);
      const customerName = (selectedRowsArray[0]?.customer || selectedRowsArray[0]?.name || selectedRowsArray[0]?.[7] || '').toString().trim();
      const matchedCustomer = options.customers.find(
        (customer) => (customer.name || '').toString().trim() === customerName
      );
      const shipToList = await getShipToChoicesForCustomerFromApi(matchedCustomer);
      const defaultIndex = shipToList.findIndex((item) => item.is_default);
      setPrintShipToChoices(shipToList);
      setSelectedPrintShipToIndex(defaultIndex >= 0 ? defaultIndex : 0);

      const match = selectedRows[0][6].match(/data-vchno="([^"]*)"/);
      const vchno = match ? match[1] : null;

      formData.dcno = selectedRows[0][1];
      if (vchno === "") {

        handleShow();

      } else {
        DCPrint(selectedRows);
      }

    }

  };

  const DCPrint = (selectedRows) => {

    const selectedPrintShipTo = printShipToChoices[selectedPrintShipToIndex] || printShipToChoices.find((item) => item.is_default) || null;

    formData.dcno = selectedRows[0][1];
    setFormData(formData);
    axios.post(`${API_URL}/getDCDetails`, formData).then(function (response) {

      if (response.data) {
        const responseShipToChoices = parseShipToPayload(
          response.data['shipping'] 
        );
        //const responseShipToChoices = response.data['shipping'] || [];

        const resolvedPrintShipTo =
        responseShipToChoices[0] || response.data ||
          selectedPrintShipTo ||         
          
          null;

          console.log('Form Submitted with Shipping:', resolvedPrintShipTo);

        let pining = (response.data['gpining'] !== "0") ? parseFloat(response.data['gpining'] / 100) : "0";
        let gmetercal = (selectedRows[0][13] !== "0") ? parseFloat(selectedRows[0][13] * pining) : selectedRows[0][13];
        let caglm = parseFloat(selectedRows[0][12] / gmetercal).toFixed(2);

        const printableContent = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"><style>

        html, body, div, span, applet, object, iframe,
 h3,h2,h4,h5, h6,blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, font, img, ins, kbd, q, s, samp,
small, strike,sub, sup, tt, var,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td, textarea, input {
   margin: 0;
   padding: 0;
   border: 0;
   outline: 0;
   font-weight: inherit;
   font-style: inherit;
   font-size: 100%;
   font-family: Arial, sans-serif;
   vertical-align: baseline;
   text-decoration:none;overflow:hidden;


}
        body{
	margin: 0;
	min-width: 320px;
	padding: 0;
        font-size: 12px;font-weight: 600;color: #6F83AA;letter-spacing: 0.5px;
}
            h1 {text-align: center;}
 pre {
white-space: normal !important;
}
        .hr {
  width: 100%;
  height: 1px;
  background: #fff;
        border-top:1px solid #000;
}

        p {
  color: #181E29;
  font-size: 12px;
  line-height: 18px;
  font-weight: normal;
  margin-bottom: 5px;
}

        .table{border: 0px solid #364159;border-collapse: separate !important;border-style: solid;border-radius: 10px;box-shadow: 0 0 0 0px #364159;margin: 1rem; table-layout: fixed;border-spacing: 0px;}
	.table thead th{font-size: 12px;font-weight: 600;color: #6F83AA;letter-spacing: 0.5px;background: #E6EBF7;text-transform: none;padding: 0.5rem;text-align: center;vertical-align: middle;border-bottom: 0px solid #364159;}
	.table thead tr th:first-child{border-top-left-radius: 10px;border-top: 0px solid #364159;}
	.table thead tr th:last-child{border-top-right-radius: 10px}
	.table td, .table th{font-size: 12px;border-top: 0px solid #364159;padding: 0.9rem 0.75rem;color: #364159;font-weight: 600;}

 .card {
  background: linear-gradient(0deg, #FFFFFF, #FFFFFF), #C4C4C4;
  box-shadow: 0px 0px 7px rgba(196, 196, 196, 0.35);
  border-radius: 0px;
  width: 100%;
  border-bottom: 11px solid #F8BD02;
}

.table {
    border: 1px solid #364159;
    -moz-border-radius: 10px;
    -webkit-border-radius: 10px;
    border-radius: 10px;
}
.table td, .table th {
    border-left: 0px solid #364159;
    border-top: 1px solid #364159;
    padding: 10px;
    text-align: left;
}
.table tr th:first-child{border-top: 1px solid #364159;border-radius: 0px}
.table th {
    background-color: transparent;
    border-top: none;
}
.table td:first-child, .table th:first-child {
    border-left: none;
}
.table th:first-child {
    -moz-border-radius: 10px 0 0 0;
    -webkit-border-radius: 10px 0 0 0;
    border-radius: 10px 0 0 0;
}
.table th:last-child {
    -moz-border-radius: 0 10px 0 0;
    -webkit-border-radius: 0 10px 0 0;
    border-radius: 0 10px 0 0;
}
.table th:only-child{
    -moz-border-radius: 10px 10px 0 0;
    -webkit-border-radius: 10px 10px 0 0;
    border-radius: 10px 10px 0 0;
}
.table tr:last-child td:first-child {
    -moz-border-radius: 0 0 0 10px;
    -webkit-border-radius: 0 0 0 10px;
    border-radius: 0 0 0 10px;
}
.table tr:last-child td:last-child {
    -moz-border-radius: 0 0 10px 0;
    -webkit-border-radius: 0 0 10px 0;
    border-radius: 0 0 10px 0;
} 
	
	.table td.totalfee {font-weight: bold;font-size: 16px;color: #D63333;}
	.table td.totalamt {font-weight: bold;font-size: 12px;color: #6F83AA;letter-spacing: 0.5px;text-transform: uppercase;text-align: right !important}
	.table tr:last-child td{text-align: center}
	.table tr td:last-child,.table tr th:last-child{text-align: center}
	.table tr:last-child td:last-child{font-weight: bold;text-align: center}
	.table tr:last-child{text-align: center}
	
	main{max-width: 100%;margin: auto}
          </style></head>
<body><main><div class="mb-0 p-0 card" style="border:0px;padding:0px !important">
           <div class="row">
             <div class="col-2 col-sm-2">
             <img src="${logo}" style="width:100px">
             </div>
             <div class="col-10 col-sm-10"><div class="row ">
               <div class="col-12 col-sm-12" style="text-align: center;font-size: 25px;"><strong>SRI SHIVA DESIGNS</strong></div>
              <div class="col-12 col-sm-12 mt-2" style="text-align: center;font-size: 14px;">PLOT NO . G3, 4TH CROSS,SIPCOT INDUSTRIAL GROWTH CENTRE,PERUNDURAI,TAMILNADU,INDIA - 638052</div>
              </div><div class="row mt-4"><div class="col-4 col-sm-4" style="text-align: center;font-size: 12px;">Email : admin@srishivadesigns.com</div>
              <div class="col-4 col-sm-4" style="text-align: center;font-size: 12px;">Mobile No: 9443029027</div><div class="col-4 col-sm-4" style="text-align: center;font-size: 12px;">GSTIN: 33AMEPP2435Q2ZP</div></div>
             </div></div><div class="hr mt-1 mb-2"></div>
<div class="row">
<div class="col-12 col-md-12" style="text-align:center"> <h3 class="px-2">JOB WORK DELIVERY</h3></div>
</div>
        <div class="hr mt-1 mb-0"></div>
        <div class="row">
<div class="col-8 col-md-8" style="text-align:left;border-right:1px solid #000"> 
        <p><strong>To:</strong></p>
        <p>${response.data['name']}</p>
        <p>${response.data['address1']}</p>
           <p>${response.data['address2']}</p>
            <p>${response.data['city']} - ${response.data['pincode']}</p>
             <p>${response.data['state']}</p>
        
        <p><strong>GSTIN:</strong> ${response.data['gstin']}</p>
         <p><strong>Contact:</strong> ${response.data['contact_number']}</p>
</div>
        <div class="col-4 col-md-4" style="text-align:left"> 
        <div class="row"><div class="col-md-4"><p>DC NO </p></div> <div class="col-md-6"><p>: ${selectedRows[0][1]}</p></div></div>
        <div class="row"><div class="col-md-4"><p>DC DATE </p></div> <div class="col-md-6"><p>: ${selectedRows[0][0]}</p></div></div>
        <div class="row"><div class="col-md-4"><p>SHADE NAME </p></div> <div class="col-md-6"><p>: ${selectedRows[0][9]}</p></div></div>
        <div class="row"><div class="col-md-4"><p>Party Dc No </p></div> <div class="col-md-6"><p>: ${selectedRows[0][5]}</p></div></div>
        <div class="row"><div class="col-md-4"><p>Lot No </p></div> <div class="col-md-6"><p>: ${selectedRows[0][4]}</p></div></div>
        <div class="row"><div class="col-md-4"><p>Batch No </p></div> <div class="col-md-6"><p>: ${selectedRows[0][3]} </p></div></div>

        </div>
</div>
        <div class="hr mt-0 mb-0"></div>
        <div class="row">
<div class="col-8 col-md-8" style="text-align:left;border-right:1px solid #000"> 
        <p><strong>Delivery To:</strong></p>
  <p>${resolvedPrintShipTo['ship_name'] || (response.data['ship_name'] === ''?response.data['name']:response.data['ship_name'])}</p>
  <p>${resolvedPrintShipTo['ship_address1'] || ((response.data['ship_address1'] !== "" ) ? response.data['ship_address1']:response.data['address1'])}</p>
  <p>${resolvedPrintShipTo['ship_address2'] || ((response.data['ship_address2'] !== "" ) ? response.data['ship_address2']:response.data['address2'])}</p>
  <p>${resolvedPrintShipTo['ship_city'] || ((response.data['ship_city'] !== "" ) ? response.data['ship_city']:response.data['city'])} - ${resolvedPrintShipTo['ship_pincode'] || ((response.data['ship_pincode'] !== "" ) ? response.data['ship_pincode']:response.data['pincode'])}</p>
  <p>${resolvedPrintShipTo['ship_state'] || ((response.data['ship_state'] !== "" ) ? response.data['ship_state']:response.data['state'])}</p>
  <p><strong>GSTIN:</strong> ${resolvedPrintShipTo['ship_gstin'] || ((response.data['ship_gstin'] !== "" ) ? response.data['ship_gstin']:response.data['gstin'])}</p>
  <p><strong>Contact:</strong> ${resolvedPrintShipTo['ship_contact_number'] || ((response.data['ship_contact_number'] !== "" ) ? response.data['ship_contact_number']:response.data['contact_number'])}</p>
</div>
        <div class="col-4 col-md-4" style="text-align:left"> 
        <div class="row"><div class="col-md-4"><p>Construction </p></div> <div class="col-md-6"><p>: ${selectedRows[0][10]}</p></div></div>
        <div class="row"><div class="col-md-4"><p>G Width </p></div> <div class="col-md-6"><p>: ${selectedRows[0][11]}</p></div></div>
        <div class="row"><div class="col-md-4"><p>Fabric </p></div> <div class="col-md-6"><p>: ${selectedRows[0][8]}</p></div></div>
        <div class="row"><div class="col-md-4"><p>Process </p></div> <div class="col-md-6"><p>: ${selectedRows[0][19]}</p></div></div>
        <div class="row"><div class="col-md-4"><p>Sale Order </p></div> <div class="col-md-6"><p>: ${response.data['sale_order_no']}</p></div></div>
        <div class="row"><div class="col-md-4"><p>Type</p></div> <div class="col-md-6"><p>: ${response.data['ptype']}</p></div></div>
        </div>
</div>
       ${(response.data['partial'] === 'N') ? `<div class="row mb-2">

		 <table class="table" style="margin-top:0px">
              <thead>
                <tr>
                    <th scope="col" width="35%">Type.</th>                   
                    <th scope="col" width="15%">Weight</th>				  
                    <th scope="col" width="10%">Meter</th>
                    <th scope="col" width="10%">Pining</th>
                    <th scope="col" width="10%">GLM</th>                  
                    <th scope="col" width="10%">Width</th>
                    <th scope="col" width="10%">No Of Pcs</th>                 
                </tr>
              </thead>
              <tbody>
               
               
                <tr>
        <td scope="row" width="35%">Grey Fabric</td>				 
				  <td width="15%">${selectedRows[0][12]}</td>
				  <td width="10%">${selectedRows[0][13]}</td>
				  <td width="10%">${response.data['gpining']}</td>
				  <td width="10%">${caglm}</td>
				  <td width="10%">${selectedRows[0][11]}</td>
				  <td width="10%">${response.data['gnoofpcs']}</td>			
        
				</tr>

              </tbody>
            </table>
            
			</div>` : ``}

         <div class="row mb-3">
		
		 <table class="table" style="margin-top:0px">
              <thead>
                <tr>
                    <th scope="col" width="35%">Type.</th>                   
                    <th scope="col" width="15%">Weight</th>				  
                    <th scope="col" width="10%">Meter</th>
                    <th scope="col" width="10%">Pining</th>
                    <th scope="col" width="10%">GLM</th>                  
                    <th scope="col" width="10%">Width</th>
                    <th scope="col" width="10%">No Of Pcs</th>          
                </tr>
              </thead>
              <tbody>
               
               
                <tr>
        <td scope="row" width="35%">Finished Fabric</td>				 
				  <td width="15%">${selectedRows[0][15]}</td>
				  <td width="10%">${selectedRows[0][16]}</td>
				  <td width="20%">${response.data['pining']}</td>
                                  <td width="20%">${selectedRows[0][17]}</td>
				  <td width="20%">${selectedRows[0][14]}</td>	
                                  <td width="20%">${response.data['noofpcs']}</td>
        
				</tr>

              </tbody>
            </table>
            
			</div>
      ${(response.data['partial_weight'] !== '') ?`<div class="row mb-3">
		
		 <table class="table" style="margin-top:0px">
              <thead>
                <tr>
                    <th scope="col" width="35%">Type.</th>                   
                    <th scope="col" width="15%">Weight</th>				  
                    <th scope="col" width="10%">Meter</th>
                    <th scope="col" width="10%">Pining</th>
                    <th scope="col" width="10%">GLM</th>                  
                    <th scope="col" width="10%">Width</th>
                    <th scope="col" width="10%">No Of Pcs</th>          
                </tr>
              </thead>
              <tbody>
               
               
                <tr>
        <td scope="row" width="35%">Sample Fabric</td>				 
				  <td width="15%">${response.data['partial_weight']}</td>
				  <td width="10%">${response.data['partial_gmeter']}</td>
				  <td width="20%">${response.data['partial_pining']}</td>
          <td width="20%">${response.data['partial_glm']}</td>
				  <td width="20%">${response.data['partial_fwidth']}</td>	
          <td width="20%">${response.data['partial_noofpcs']}</td>
        
				</tr>

              </tbody>
            </table>
            
			</div>`:``}
        <div class="row mb-2">
        <div class="col-12 col-md-12" style="text-align:left">             
           <div class="row">
                <div class="col-12 col-md-6"><p>Vehicle No :${response.data['vehicleno']}</p></div> 
                 <div class="col-12 col-md-6"><p>Remarks :${response.data['remarks']}</p></div> 
            </div>
       
        </div>
        </div>
        <div class="row mt-5" style="text-align:center">
       
                <div class="col-md-4"><p>Prepared by </p></div>             
                <div class="col-md-4"><p>Checked by</p></div> 
                <div class="col-md-4"><p>Received by</p></div>
            </div>
       
        
</div></main></body>
      </html>
    `;

        const newWindow = window.open("", "_blank");
        newWindow.document.write(`<pre>${printableContent}</pre>`);
        newWindow.print();
      } else {
        alert("DC not available");
      }

    })
      .catch(function (error) {
        console.log(error);
      });

  }

       const PrintIndvHandle =  (event) => {
      event.preventDefault();
      let api = table.current.dt();
      let selectedRows = api.rows({ selected: true }).data();
  console.log(selectedRows);
      const printableContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            table, th, td {
              border: 1px solid black;
            }
            th, td {
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            h1 {
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>Delivery Challans</h1>
          <table>
            <thead>
              <tr>
                      <th>Date</th>
                      <th>DC No</th>
                      <th>Partial</th> 
                      <th>Batch No</th>      
                      <th>Inward No</th>                           
                      <th>Cust Dc</th>
                      <th>Machine</th>
                      <th>Customer</th>
                      <th>Fabric</th>
                      <th>Shade</th>
                      <th>Construction</th>
                      <th>Grey Width</th>
                      <th>Grey Weight</th>
                      <th>Grey Meter</th> 
                      <th>Final Width</th>
                      <th>FInal Weight</th>   
                      <th>FInal Meter</th>                
                      <th>GLM</th>
                      <th>AGLM</th>
                      <th>Process</th>
                      <th>Finishing</th>
                       <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              ${selectedRows
                .map(
                  (row) => `
                    <tr>
                      <td>${row[0]}</td>
                      <td>${row[1]}</td>
                      <td>${row[2]}</td>
                      <td>${row[3]}</td>
                      <td>${row[4]}</td>
                      <td>${row[5]}</td>
                      <td>${row[6]}</td>
                      <td>${row[7]}</td>
                      <td>${row[8]}</td>
                      <td>${row[9]}</td>
                      <td>${row[10]}</td>
                      <td>${row[11]}</td>
                      <td>${row[12]}</td>
                      <td>${row[13]}</td>
                      <td>${row[14]}</td>
                      <td>${row[15]}</td>
                      <td>${row[16]}</td>
                      <td>${row[17]}</td>
                      <td>${row[18]}</td>
                      <td>${row[19]}</td>
                      <td>${row[20]}</td>
                       <td>${row[21]}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
  
      const newWindow = window.open("", "_blank");
      newWindow.document.write(`<pre>${printableContent}</pre>`);
      newWindow.print();
         
    };

const deleteHandle = (event) => {
  event.preventDefault();
  let api = table.current.dt();
  let rows = api.rows({ selected: true }).data().toArray();
  
  if (rows.length === 0) {
    alert('Select DC for delete');
    return;
  }

  setSelectedDC(rows[0][1]); // Store the DC number
  setShowDeleteModal(true); // Show delete confirmation modal
};

const handleCreateInvoice = async (event) => {
  if (event) {
    event.preventDefault();
  }
  let api = table.current.dt();
  let selectedRowsApi = api.rows({ selected: true }).data();
  let selectedRows = selectedRowsApi.toArray ? selectedRowsApi.toArray() : Array.from(selectedRowsApi);
  let selectedNodes = api.rows({ selected: true }).nodes().toArray ? api.rows({ selected: true }).nodes().toArray() : Array.from(api.rows({ selected: true }).nodes());

  if (selectedRows.length === 0) {
    alert('Select line items to create invoice');
    return;
  }

  const hasInvoicedRows = selectedRows.some((row, index) => rowHasInvoiceStatusY(row, selectedNodes[index] || null));
  if (hasInvoicedRows) {
    alert('Selected row is already invoiced. Create Invoice is disabled for invoiced rows.');
    return;
  }

  const getCustomer = (row) => {
    if (!row) return '';
    return row.customer || row.name || row[7] || '';
  };

  const getInvoiceParam = (row, node) => {
    const fromRow = row.invoiceParameter || row.invparams || row.invParam || row.inv_param || row['invoiceParameter'];
    let fromNode = null;
    if (node) {
      fromNode = node.getAttribute ? node.getAttribute('data-inv') : null;
      if (!fromNode && node.querySelector) {
        const child = node.querySelector('[data-inv]');
        fromNode = child ? child.getAttribute('data-inv') : null;
      }
      if (!fromNode && node.dataset) {
        fromNode = node.dataset.invparams || null;
      }
    }
    return (fromRow || fromNode || '').toString().trim().toLowerCase();
  };

  const getQuantityAndUnit = (row, invParam) => {
    switch (invParam) {
      case 'gw':
        return { quantity: Number(row[12] || 0), unit: 'g wt' };
      case 'gm':
        return { quantity: Number(row[13] || 0), unit: 'g mtr' };
      case 'fw':
        return { quantity: Number(row[15] || 0), unit: 'f wt' };
      case 'fm':
        return { quantity: Number(row[16] || 0), unit: 'f mtr' };
      default:
        return { quantity: Number(row[15] || row[12] || 0), unit: 'KG' };
    }
  };

  const getWidthByInvoiceParam = (row, invParam) => {
    switch (invParam) {
      case 'gw':
      case 'gm':
        return (row[11] || '').toString().trim();
      case 'fw':
      case 'fm':
      default:
        return ( row[11] || '').toString().trim();
    }
  };

  const buildInvoiceDescription = (process, quantity, unit, construction, width, fabric) => {
    
    const safeProcess = (process || '').toString().trim();
    const safeConstruction = (construction || '-').toString().trim() || '-';
    const safeWidth = (width || '-').toString().trim() || '-';
    const safeFabric = (fabric || '-').toString().trim() || '-';
    return `${safeProcess} - ${safeConstruction} -  ${safeFabric} - ${safeWidth}`;
  };

  const customerName = getCustomer(selectedRows[0]).toString().trim();
  const differentCustomer = selectedRows.some((row) => getCustomer(row).toString().trim() !== customerName);

  if (differentCustomer) {
    alert('All selected line items must be for the same customer');
    return;
  }

  const matchedCustomer = options.customers.find(
    (customer) => (customer.name || '').toString().trim() === customerName
  );

  const extractVehicleNo = (row) => {
    const machineCell = (row[6] || '').toString();
    const match = machineCell.match(/data-vchno="([^"]*)"/i);
    return match && match[1] ? match[1].toString().trim() : '';
  };

  const invoiceItems = selectedRows.reduce((acc, row, index) => {
    const process = row[19] || '';
    const color = (row[9] || row[10] || '').toString().trim();
    const construction = (row[10] || '').toString().trim();
    const fabric = (row[8] || '').toString().trim();
    const node = selectedNodes[index] || null;
    const invParam = getInvoiceParam(row, node);
    const { quantity, unit } = getQuantityAndUnit(row, invParam);
    const width = getWidthByInvoiceParam(row, invParam);
    const dcNo = (row[1] || '').toString().trim();
    const vchno = extractVehicleNo(row);
    const key = `${process.toString().trim().toLowerCase()}||${color.toLowerCase()}||${unit}||${construction.toLowerCase()}||${width.toLowerCase()}||${fabric.toLowerCase()}`;
    
    const existing = acc.find((item) => item.key === key);
    if (existing) {
      existing.quantity = Number(existing.quantity || 0) + quantity;
      if (dcNo && !existing.dcNo.split(',').map((v) => v.trim()).includes(dcNo)) {
        existing.dcNo = existing.dcNo ? `${existing.dcNo}, ${dcNo}` : dcNo;
      }
      if (vchno) {
        const existingVehicles = (existing.vchno || '').split(',').map((v) => v.trim()).filter(Boolean);
        if (!existingVehicles.includes(vchno)) {
          existing.vchno = existingVehicles.length ? `${existing.vchno}, ${vchno}` : vchno;
        }
      }
      existing.description = buildInvoiceDescription(
        process,
        existing.quantity,
        unit,
        construction,
        width,
        fabric
      );
      existing.amount = '';
      return acc;
    }

    acc.push({
      key,
      dcNo,
      vchno,
      date: row[0] || '',
      customer: customerName,
      description: buildInvoiceDescription(process, quantity, unit, construction, width, fabric),
      color,
      quantity,
      unit,
      rate: '',
      tax: 5,
      amount: ''
    });
    return acc;
  }, []).map(({ key, ...item }) => item);

  const referenceNo = Array.from(
    new Set(
      selectedRows
        .map((row) => (row[5] || '').toString().trim())
        .filter(Boolean)
    )
  ).join(', ');

  const vehicleNos = Array.from(
    new Set(
      selectedRows
        .map((row) => extractVehicleNo(row))
        .filter(Boolean)
    )
  ).join(', ');

  const invoiceStateBase = {
    customer: customerName,
    customerid: matchedCustomer?.id || '',
    referenceNo,
    vehicleNos,
    items: invoiceItems
  };

  let shipToList = [];
 let  selectedShipTo = [];
  try {
    const dcDetailsResponse = await axios.post(`${API_URL}/getDCDetails`, {
      dcno: (selectedRows[0]?.[1] || '').toString().trim(),
      vchno: ''
    });

    const dcDetails = dcDetailsResponse?.data;
     console.log('DC Details:', dcDetails);
    if (dcDetails['shipping'] !== "null" ) {
      shipToList = parseShipToPayload(dcDetails['shipping']);
      selectedShipTo = shipToList[0] || null;
    } else {
      
      selectedShipTo = dcDetails || null;
    }
  } catch (error) {
    console.warn('Failed to fetch ship-to details from getDCDetails for invoice', error);
  }


  navigate('/invoice', {
    state: {
      ...invoiceStateBase,
      shipToAddress: selectedShipTo,
      ship_name: selectedShipTo?.ship_name || '',
      ship_contact_number: selectedShipTo?.ship_contact_number || '',
      ship_address1: selectedShipTo?.ship_address1 || '',
      ship_address2: selectedShipTo?.ship_address2 || '',
      ship_city: selectedShipTo?.ship_city || '',
      ship_state: selectedShipTo?.ship_state || '',
      ship_pincode: selectedShipTo?.ship_pincode || '',
      ship_gstin: selectedShipTo?.ship_gstin || ''
    }
  });
};

const handleDeleteConfirm = async () => {
  if (!deleteReason.trim()) {
    alert('Please enter a reason for deletion');
    return;
  }

  try {
    const response = await axios.post(`${API_URL}/deleteDC`, {
      dcNo: selectedDC,
      reason: deleteReason
    });

    if (response.data.status === 'success') {
      let api = table.current.dt();
      api.ajax.reload();
      setShowDeleteModal(false);
      setDeleteReason('');
      setSelectedDC(null);
    }
  } catch (error) {
    console.error('Delete failed:', error);
    alert('Failed to delete DC');
  }
};

  const ExportHandle = (event) => {
    event.preventDefault();
    let api = table.current.dt();
    let selectedRows = api.rows({ selected: true }).data();
    console.log(selectedRows);

    let csv = [];
    let bdata = [];

    bdata = [];
    bdata.push("Date");
    bdata.push("DC No");
    bdata.push("Batch.No"); bdata.push("Inward No");
    bdata.push("Cust Dc"); bdata.push("Machine");
    bdata.push("Customer"); bdata.push("Fabric");
    bdata.push("Shade"); bdata.push("Construction");
    bdata.push("Grey Width"); bdata.push("Grey Weight");
    bdata.push("Grey Meter"); bdata.push("Final Width");
    bdata.push("Final Weight"); bdata.push("Final Meter");
    bdata.push("GLM"); bdata.push("AGLM");
    bdata.push("Process"); bdata.push("Finishing");bdata.push("Reason");

    csv.push(bdata.join(","));

    const rt = selectedRows.map((row) => {
      let rowData = [];
      const match = row[6].match(/>(.*?)</);
      const machine = match ? match[1] : null;
      rowData.push(row[0]); rowData.push(row[1]); rowData.push(row[3]);
      rowData.push(row[4]); rowData.push(row[5]); rowData.push(machine);
      rowData.push(row[7]); rowData.push(row[8]); rowData.push(row[9]);
      rowData.push(row[10]); rowData.push(row[11]); rowData.push(row[12]);
      rowData.push(row[13]); rowData.push(row[14]); rowData.push(row[15]);
      rowData.push(row[16]); rowData.push(row[17]); rowData.push(row[18]);
      rowData.push(row[19]); rowData.push(row[20]);rowData.push(row[21]);
      csv.push(rowData.join(","));
      return true;
    })

    console.log(rt);

    let csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(csvFile);
    link.download = `dc_data.csv`;;
    link.click();

  };

  const InvExcelHandle = (selectedRows) => {


    let csv = [];
    let bdata = [];

    bdata = [];
    bdata.push("VCH TYPE");
    bdata.push("INVOICE NO");
    bdata.push("INVOICE DATE"); bdata.push("Reference No");
    bdata.push("Reference Date"); bdata.push("Ledger Name");
    bdata.push("Addr Ln1"); bdata.push("Addr Ln2");
    bdata.push("Pincode"); bdata.push("State");
    bdata.push("Place of Supply"); bdata.push("GSTIN");
    bdata.push("Item Name"); bdata.push("HSN");
    bdata.push("TAX"); bdata.push("QTY"); bdata.push("Unit");
    bdata.push("Rate"); bdata.push("Amount");
    bdata.push("Freight Charges"); bdata.push("Packing Charges"); bdata.push("Discount (-)");
    bdata.push("CGST"); bdata.push("SGST"); bdata.push("IGST"); bdata.push("CESS");
    bdata.push("TCS"); bdata.push("Rounded off"); bdata.push("Total Amount");

    csv.push(bdata.join(","));

    const rt = selectedRows.map((row) => {
      let rowData = [];
      rowData.push('Sales'); rowData.push(row['invno']); rowData.push(row['invdate']);
      rowData.push(''); rowData.push(''); rowData.push(row['name']);
      rowData.push(row['address1']); rowData.push(row['address2']); rowData.push(row['pincode']);
      rowData.push(row['state']); rowData.push(row['state']); rowData.push(row['gstin']);
      rowData.push(row['itemname']); rowData.push("998821"); rowData.push('5%');
      rowData.push(row['weight']); rowData.push('KG'); rowData.push(''); rowData.push(''); rowData.push(''); rowData.push(''); rowData.push('');
      rowData.push(''); rowData.push(''); rowData.push(''); rowData.push(''); rowData.push(''); rowData.push(''); rowData.push('');
      const escapedData = rowData.map(field => {
        if (typeof field === 'string') {
          // Replace " with "" and wrap in quotes
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      });
      csv.push(escapedData.join(","));
      return true;
    })

 console.log(rt);
    let csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(csvFile);
    link.download = `inv_data.csv`;;
    link.click();

  };


  const InvExport = () => {

    let api = table.current.dt(); let dataArr = [];
    let selectedRows = api.rows({ selected: true }).data();
    if (selectedRows.length === 0) {
      alert('Select DC for print');
    } else {

      selectedRows.map(value => (
        dataArr.push(value[1])
      ));
      axios.post(`${API_URL}/getInvDetails`, dataArr).then(function (response) {

        if (response.data) {
          InvExcelHandle(response.data);
          console.log(response.data);


        }
      })
        .catch(function (error) {

          console.log(error);
        });
    }
  };


    const handleColumnChange = (e) => {
    setSearchState(e.target.value);
   
  };

  return (
    <div className="main-content" >
      <Container fluid className="relative">
        <Row className="mb-6">
          <div className="col-10 col-sm-10">
            <h1 className="text-2xl font-bold text-gray-800">Delivery</h1>
            <p className="text-gray-600">Welcome, {user.user}!</p>
          </div>
        </Row>
        {/* Filter Row */}
                <div className="row mb-3">
                  <div className="col-md-2">
                    <Form.Group>
                      <Form.Label>From Date</Form.Label>
                      <Form.Control type="date" value={filters.fromDate} onChange={e => handleFilterChange('fromDate', e.target.value)} />
                    </Form.Group>
                  </div>
                  <div className="col-md-2">
                    <Form.Group>
                      <Form.Label>To Date</Form.Label>
                      <Form.Control type="date" value={filters.toDate} onChange={e => handleFilterChange('toDate', e.target.value)} />
                    </Form.Group>
                  </div>
                  </div>
                  <div className="row mb-3">
                  <div className="col-md-2">
                    <Form.Group>
                      <Form.Label>Customer</Form.Label>
                      <Form.Select value={filters.customer} onChange={e => handleFilterChange('customer', e.target.value)}>
                        <option value="">All</option>
                        {options.customers.map(opt => (
                          <option key={opt.id || opt.name} value={opt.name}>{opt.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-2">
                    <Form.Group>
                      <Form.Label>Machine</Form.Label>
                      <Form.Select value={filters.machine} onChange={e => handleFilterChange('machine', e.target.value)}>
                        <option value="">All</option>
                        {options.machines.map(opt => (
                          <option key={opt.id || opt.name} value={opt.name}>{opt.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-2">
                    <Form.Group>
                      <Form.Label>Fabric</Form.Label>
                      <Form.Select value={filters.fabric} onChange={e => handleFilterChange('fabric', e.target.value)} >
                        <option value="">All</option>
                        {options.fabrics.map(opt => (
                          <option key={opt.id || opt.name} value={opt.name}>{opt.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-2">
                    <Form.Group>
                      <Form.Label>Shade</Form.Label>
                      <Form.Select value={filters.shade} onChange={e => handleFilterChange('shade', e.target.value)} >
                        <option value="">All</option>
                        {options.shades.map(opt => (
                          <option key={opt.id || opt.name} value={opt.name}>{opt.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-2">
                    <Form.Group>
                      <Form.Label>Construction</Form.Label>
                      <Form.Select value={filters.construction} onChange={e => handleFilterChange('construction', e.target.value)}>
                        <option value="">All</option>
                        {options.constructions.map(opt => (
                          <option key={opt.id || opt.name} value={opt.name}>{opt.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                </div>
                <div className="col-md-2 mb-5">
                 <button className="btn btn-primary mr-3" onClick={handleSubmitFilters}>
            Submit
          </button>
          <button className="btn btn-secondary mr-3" onClick={handleResetFilters}>
            Reset
          </button>
                </div>
                {/* Submit button and ...existing code for actions/search... */}

        <div className="flex justify-end mb-4">
          <div className="col-2 col-sm-2">
            <Dropdown className="">
              <Dropdown.Toggle variant="primary" id="dropdown-basic" 
                className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                Actions
              </Dropdown.Toggle>

              <Dropdown.Menu className="mt-2">
                <Dropdown.Item href="#" onClick={PrintHandle}>DC Print</Dropdown.Item>
                <Dropdown.Item href="#" onClick={PrintIndvHandle}>Print</Dropdown.Item>    
                {user && (user.role === "admin") && 
                  <Dropdown.Item href="#" onClick={deleteHandle}>Delete</Dropdown.Item>}
                {user && ((user.role === "admin") || (user.role === "SP1") || (user.role === "delivery") || (user.role==="PA" )) && 
                  <Dropdown.Item href="#" onClick={ExportHandle}>Export</Dropdown.Item>}
                {user && ((user.role === "admin") || (user.role === "SP1") || (user.role === "delivery") || (user.role==="PA" )) && 
                  <Dropdown.Item href="#" onClick={handleCreateInvoice}>Create Invoice</Dropdown.Item>}
                {user && ((user.role === "admin") || (user.role === "SP1") || (user.role === "delivery") || (user.role==="PA" )) && 
                  <Dropdown.Item href="#" onClick={InvExport}>Invoice Export</Dropdown.Item>}
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="ml-auto w-1/5">
                      <Form.Select
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 tsearch"
                        value={searchState}
                        onChange={handleColumnChange}
                      >
                        <option value="ide">DC No</option>
                        <option value="batchid">Batch No</option>
                        <option value="greyid">Grey Entry No</option>
                        <option value="customer">Customer</option>
                      </Form.Select>
                    </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 relative bg-white">
          <DataTable 
            ref={table}
            options={{
              scrollX: true,
              scrollY: '60vh',
              scrollCollapse: true,
              fixedColumns: {
                left: 2
              },
              order: [[1, 'desc']],
              paging: true,
              processing: true,
              serverSide: true,
              select: { style: 'multi' },
              ajax: {
                url: `${API_URL}/delivery1`,
                type: 'POST',
                data: function (d) {
                  d.searchcol = $(".tsearch").val();
                  d.user = user.user; // send email
             console.log('Data sent to server:', submittedFiltersRef.current);
             // Use submitted filters from ref
             d.fromDate = submittedFiltersRef.current.fromDate || '';
             d.toDate = submittedFiltersRef.current.toDate || '';
             d.customer = submittedFiltersRef.current.customer || '';
             d.machine = submittedFiltersRef.current.machine || '';
             d.fabric = submittedFiltersRef.current.fabric || '';
             d.shade = submittedFiltersRef.current.shade || '';
             d.construction = submittedFiltersRef.current.construction || '';
            if (d.length === -1) {
                d.length = 25; // Set default page length
              }
              return d;
                }
              },
              pageLength: 25,
              columns: [
                { data: "0" }, // Date
                { data: "1" ,
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  }}, // DC.No
                { data: "2",
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  } }, // Partial
                { data: "3",
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  } }, // Batch No
                { data: "4",
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  } }, // Inward No
                { data: "5",
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  } }, // Cust Dc
                { data: "6" ,
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  }}, // Machine
                { data: "7" ,
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  }}, // Customer
                { data: "8" ,
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  }}, // Fabric
                { data: "9" ,
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  }}, // Shade
                { data: "10" ,
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  }}, // Construction
                { data: "11" ,
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  }}, // Grey Width
                { data: "12" ,
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  }}, // Grey Weight
                { data: "13",
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  } }, // Grey Meter
                { data: "14",
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  } }, // Final Width
                { data: "15",
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  } }, // Final Weight
                { data: "16",
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  } }, // Final Meter
                { data: "17",
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  } }, // GLM
                { data: "18",
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  } }, // AGLM
                { data: "19",
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  } }, // Process
                { data: "20",
                  render: function(data, type, row) {
                    // If reason exists (row[21]), apply strike-through
                    return (row[21] !=="") ? 
                      `<span style="text-decoration: line-through;">${data}</span>` : 
                      data;
                  } }, // Finishing
                { data: "21" }  // Reason
              ],
              createdRow: function (row, data) {
                const normalizeStatus = (value) => (value || '').toString().trim().toLowerCase();
                const hasStatusYInHtml = (value) => /data-inv-status\s*=\s*["']?y["']?/i.test((value || '').toString());

                const rowStatus = normalizeStatus(row.getAttribute('data-inv-status'));
                const cellWithStatus = row.querySelector('[data-inv-status]');
                const cellStatus = normalizeStatus(cellWithStatus ? cellWithStatus.getAttribute('data-inv-status') : '');
                const dataHasStatusY = Array.isArray(data)
                  ? data.some((value) => hasStatusYInHtml(value))
                  : hasStatusYInHtml(JSON.stringify(data || {}));

                if (rowStatus === 'y' || cellStatus === 'y' || dataHasStatusY) {
                  row.style.backgroundColor = '#d1fae5';
                  
                }
              },
              dom: '<"flex items-center justify-between mb-4"l<"ml-2"f>>rtip',
              language: {
                search: "Search:",
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                paginate: {
                  first: "First",
                  last: "Last",
                  next: "Next",
                  previous: "Previous"
                }
              },
              className: "w-full text-sm text-left text-gray-500"
            }}
          >
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">DC.No</th>
              <th className="px-6 py-3">Partial</th>
              <th className="px-6 py-3">Batch No</th>
              <th className="px-6 py-3">Inward No</th>
              <th className="px-6 py-3">Cust Dc</th>
              <th className="px-6 py-3">Machine</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Fabric</th>
              <th className="px-6 py-3">Shade</th>
              <th className="px-6 py-3">Construction</th>
              <th className="px-6 py-3">Grey Width</th>
              <th className="px-6 py-3">Grey Weight</th>
              <th className="px-6 py-3">Grey Meter</th>
              <th className="px-6 py-3">Final Width</th>
              <th className="px-6 py-3">Final Weight</th>
              <th className="px-6 py-3">Final Meter</th>
              <th className="px-6 py-3">GLM</th>
              <th className="px-6 py-3">AGLM</th>
              <th className="px-6 py-3">Process</th>
              <th className="px-6 py-3">Finishing</th>
              <th className="px-6 py-3">Reason</th>
            </tr>
          </thead>
        </DataTable>
        </div>

        <Modal size="lg" show={show} onHide={handleClose} className="rounded-lg">
          <Modal.Header closeButton className="bg-gray-50 border-b border-gray-200">
            <Modal.Title className="text-xl font-semibold text-gray-800">
              Enter Vehicle No
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-6">
            <Form className="space-y-4">
              <Row className="flex items-center space-x-4">
                <Form.Group className="col-6 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    DC No
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="dcno"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.dcno}
                    onChange={(e) => setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value
                    }))}
                    disabled
                    required
                  />
                </Form.Group>
                <Form.Group className="col-6 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    Vehicle No
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="vchno"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.vchno}
                    onChange={(e) => setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value
                    }))}
                    required
                  />
                </Form.Group>

                {printShipToChoices.length > 1 && (
                  <Form.Group className="col-12 mb-3">
                    <Form.Label className="block text-sm font-medium text-gray-700">
                      Ship-To Address
                    </Form.Label>
                    <Form.Select
                      value={selectedPrintShipToIndex}
                      onChange={(e) => setSelectedPrintShipToIndex(Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {printShipToChoices.map((address, index) => (
                        <option key={`${address.ship_name}-${index}`} value={index}>
                          {(address.ship_name || 'Ship-To')}
                          {address.ship_city ? ` - ${address.ship_city}` : ''}
                          {address.ship_state ? `, ${address.ship_state}` : ''}
                          {address.is_default ? ' (Default)' : ''}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                )}

              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer className="bg-gray-50 border-t border-gray-200">
            <Button 
              variant="secondary" 
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} className="rounded-lg">
  <Modal.Header closeButton className="bg-gray-50 border-b border-gray-200">
    <Modal.Title className="text-xl font-semibold text-gray-800">
      Confirm Delete
    </Modal.Title>
  </Modal.Header>
  <Modal.Body className="p-6">
    <Form.Group className="mb-3">
      <Form.Label className="block text-sm font-medium text-gray-700">
        Please enter reason for deletion
      </Form.Label>
      <Form.Control
        as="textarea"
        rows={3}
        value={deleteReason}
        onChange={(e) => setDeleteReason(e.target.value)}
        placeholder="Enter deletion reason"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required
      />
    </Form.Group>
  </Modal.Body>
  <Modal.Footer className="bg-gray-50 border-t border-gray-200">
    <Button 
      variant="secondary" 
      onClick={() => setShowDeleteModal(false)}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
    >
      Cancel
    </Button>
    <Button 
      variant="danger" 
      onClick={handleDeleteConfirm}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
    >
      Delete
    </Button>
  </Modal.Footer>
</Modal>
      </Container>
    </div>


  );
}

export default Delivery;
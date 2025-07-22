import React, { useState,  useRef } from 'react';
import { Container, Button, Row, Dropdown, Modal, Form, } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
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
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ dcno: '', vchno: '' });
  const [show, setShow] = useState(false);
   const [searchState, setSearchState] = useState('');
  const handleClose = () => setShow(false);
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

    axios.post(`${API_URL}/updateVechileNo`, formData)
      .then(function (response) {

        setShow(false);
        setFormData('');
        let api = table.current.dt();
        let selectedRows = api.rows({ selected: true }).data();
        DCPrint(selectedRows);
        console.log('Form Submitted with Data:', response.data);

      })
      .catch(function (error) {
        console.log(error);
      });

    //const userData = response.data;
    console.log('Data From Backend:', formData);

  };

  const PrintHandle = (event) => {
    event.preventDefault();
    let api = table.current.dt();
    let selectedRows = api.rows({ selected: true }).data();

    if (selectedRows.length === 0) {
      alert('Select DC for print');
    } else {

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

    formData.dcno = selectedRows[0][1];
    setFormData(formData);
    axios.post(`${API_URL}/getDCDetails`, formData).then(function (response) {

      if (response.data) {

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
        <p>${response.data['pincode']}</p>
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
         <p>${response.data['name']}</p>
        <p>${response.data['address1']}</p>
           <p>${response.data['address2']}</p>
        <p>${response.data['pincode']}</p>
        <p><strong>GSTIN:</strong> ${response.data['gstin']}</p>
           <p><strong>Contact:</strong> ${response.data['contact_number']}</p>
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
    if (window.confirm("Delete this item?")) {
      let api = table.current.dt();
      let rows = api.rows({ selected: true }).data().toArray();
      let dataArr = []; let dataArr1 = [];
      rows.map(value => (
        dataArr.push(value)
      ));
      if (dataArr.length === 0) {
        alert('Select DC for delete');
      } else {

        const value = dataArr[0][1];
        dataArr1.push(value);
        axios.post(`${API_URL}/deleteDC`, dataArr1)
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
        console.log(dataArr);
        api.rows({ selected: true }).remove().draw();
      }
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
    bdata.push("Process"); bdata.push("Finishing");

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
      rowData.push(row[19]); rowData.push(row[20]);
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
                {user && ((user.role === "admin") || (user.role === "SP1") || (user.role === "delivery")) && 
                  <Dropdown.Item href="#" onClick={ExportHandle}>Export</Dropdown.Item>}
                {user && ((user.role === "admin") || (user.role === "SP1") || (user.role === "delivery")) && 
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
                  if (d.length === -1) {
                    d.length = 25;
                  }
                  return d;
                }
              },
              pageLength: 25,
              columns: [
                { data: "0" }, // Date
                { data: "1" }, // DC.No
                { data: "2" }, // Partial
                { data: "3" }, // Batch No
                { data: "4" }, // Inward No
                { data: "5" }, // Cust Dc
                { data: "6" }, // Machine
                { data: "7" }, // Customer
                { data: "8" }, // Fabric
                { data: "9" }, // Shade
                { data: "10" }, // Construction
                { data: "11" }, // Grey Width
                { data: "12" }, // Grey Weight
                { data: "13" }, // Grey Meter
                { data: "14" }, // Final Width
                { data: "15" }, // Final Weight
                { data: "16" }, // Final Meter
                { data: "17" }, // GLM
                { data: "18" }, // AGLM
                { data: "19" }, // Process
                { data: "20" }  // Finishing
              ],
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
      </Container>
    </div>


  );
}

export default Delivery;
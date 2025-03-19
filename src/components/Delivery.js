import React, { useState, useEffect,useRef} from 'react';
import { Container, Row, Dropdown } from 'react-bootstrap';
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
//import PrintDataTable from '../components/PrintDataTable';

const API_URL = 'https://www.wynstarcreations.com/seyal/api';

DataTable.use(Responsive);DataTable.use(Select);
DataTable.use(FixedHeader);DataTable.use(DT);
function Delivery() {
  const table = useRef();
  const [tableData, setTableData] = useState([ ]);
  const { user , isAuthenticated } = useAuth();
 

     // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/delivery`);
        setTableData(response.data);
      } catch (error) {
        console.log(error);
      } 
    };
    user && fetchData();
  }, [user]);

      
      if (!isAuthenticated) {
        return null;
      // navigate('/login');  // Avoid rendering profile if the user is not authenticated
     }
   
     const PrintHandle =  (event) => {
      event.preventDefault();
      let api = table.current.dt();
      let selectedRows = api.rows({ selected: true }).data();
  console.log(selectedRows);
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
	.table thead th{font-size: 12px;font-weight: 600;color: #6F83AA;letter-spacing: 0.5px;background: #E6EBF7;text-transform: none;padding: 0.5rem;text-align: left;vertical-align: middle;border-bottom: 0px solid #364159;}
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
        <p>${selectedRows[0][4]}</p>
        <p>51, KALAIGNER NAGAR,, KARUNGALPALAYAM, ERODE</p>
        <p>TAMILNADU, INDIA</p>
        <p>GSTIN: 33AAFCS3659F1ZD</p>
</div>
        <div class="col-4 col-md-4" style="text-align:left"> 
        <div class="row"><div class="col-md-4"><p>DC NO </p></div> <div class="col-md-6"><p>: </p></div></div>
        <div class="row"><div class="col-md-4"><p>DC DATE </p></div> <div class="col-md-6"><p>: ${selectedRows[0][2]}</p></div></div>
        <div class="row"><div class="col-md-4"><p>SHADE NAME </p></div> <div class="col-md-6"><p>: ${selectedRows[0][6]}</p></div></div>
        <div class="row"><div class="col-md-4"><p>Party Dc No </p></div> <div class="col-md-6"><p>: </p></div></div>
        <div class="row"><div class="col-md-4"><p>ProcessName </p></div> <div class="col-md-6"><p>: </p></div></div>

        </div>
</div>
        <div class="hr mt-0 mb-0"></div>
        <div class="row">
<div class="col-8 col-md-8" style="text-align:left;border-right:1px solid #000"> 
        <p><strong>Delivery To:</strong></p>
        <p>${selectedRows[0][4]}</p>
        <p>51, KALAIGNER NAGAR,, KARUNGALPALAYAM, ERODE</p>
        <p>TAMILNADU, INDIA</p>
        <p>GSTIN: 33AAFCS3659F1ZD</p>
</div>
        <div class="col-4 col-md-4" style="text-align:left"> 
        <div class="row"><div class="col-md-4"><p>Design Name </p></div> <div class="col-md-6"><p>: </p></div></div>
        <div class="row"><div class="col-md-4"><p>Count </p></div> <div class="col-md-6"><p>: ${selectedRows[0][7]}</p></div></div>
        <div class="row"><div class="col-md-4"><p>Reed Pick</p></div> <div class="col-md-6"><p>: ${selectedRows[0][6]}</p></div></div>
        <div class="row"><div class="col-md-4"><p>G Width </p></div> <div class="col-md-6"><p>: ${selectedRows[0][8]}</p></div></div>
        <div class="row"><div class="col-md-4"><p>Weave </p></div> <div class="col-md-6"><p>: </p></div></div>

        </div>
</div>

        <div class="row mb-2">
		
		 <table class="table" style="margin-top:0px">
              <thead>
                <tr>
                    <th scope="col" width="5%">Sl. no.</th>
                    <th scope="col" width="10%">Packing No</th>				  
                    <th scope="col" width="10%">Workorderno</th>
                    <th scope="col" width="5%">Piece No</th>
                    <th scope="col" width="5%">Grey Qty</th>                  
                    <th scope="col" width="10%">Qty UOM</th>
                    <th scope="col" width="10%">Qty in Kgs</th>
                    <th scope="col" width="10%">Mill F Width</th>
                    <th scope="col" width="10%">Mill lot No</th>
                    <th scope="col" width="5%">GLM</th>
                    <th scope="col" width="10%">Dispatch Qty</th>
                    <th scope="col" width="10%">Dispatch Kgs</th>
                </tr>
              </thead>
              <tbody>
               
                
                <tr>
				  <th scope="row" width="2%">1.</th>
				  <td width="10%">${selectedRows[0][1]}</td>
				  <td width="10%">${selectedRows[0][1]}</td>
				  <td width="5%">89.00</td>
				  <td width="8%">3,${selectedRows[0][10]}</td>
				  <td width="10%">MTR</td>
				  <td width="10%">${selectedRows[0][9]}</td>
				  <td width="10%">${selectedRows[0][8]}</td>
				  <td width="10%"></td>
				  <td width="10%">${selectedRows[0][11]}</td>
                                  <td width="10%">${selectedRows[0][10]}</td>
                                  <td width="10%">${selectedRows[0][9]}</td>
        
				</tr>

              </tbody>
            </table>
            
			</div>
        <div class="row mb-2">
        <div class="col-12 col-md-12" style="text-align:left"> 
            <div class="row">
                <div class="col-md-2"><p>Process Flow </p></div> 
                <div class="col-md-9"><p>${selectedRows[0][13]}</p></div>
            </div>
           <div class="row">
                <div class="col-md-2"><p>Vehicle No </p></div> 
                <div class="col-md-9"><p></p></div>
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
      //setSelectedData(dataArr);
      //console.log(dataArr);  
         
    };
  
  

  return (
    <div className="data-wrapper">
   
        <Container>
        <Row>
          <div className="col-10 col-sm-10">
          <h1>Delivery</h1>
          <p>Welcome, {user.email}!</p>
          </div>
          <div className="col-2 col-sm-2">
          <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        Actions
      </Dropdown.Toggle>

      <Dropdown.Menu>
         <Dropdown.Item href="#" onClick={PrintHandle}>Print</Dropdown.Item>     
      </Dropdown.Menu>
    </Dropdown>
          
            </div>
       </Row>
                
    <DataTable ref={table} data={tableData} 
    options={{
            order: [[0, 'desc']],
            fixedColumns: {
              start: 2
          },
            paging: false,
            scrollCollapse: true,
            scrollX: true,
            scrollY: 400,
            select: {
                style: 'multi'
            }
              
            } }  className="display table sortable stripe row-border order-column nowrap dataTable" style={{width:"100%"}}>
            <thead>
                <tr>                   
                    <th>DC.No</th>
                    <th>Inward No</th>
                    <th>Batch Date</th>
                    <th>Machine</th>
                    <th>Customer</th>
                    <th>Fabric</th>
                    <th>Shade</th>
                    <th>Construction</th>
                    <th>Width</th>
                    <th>Weight</th>
                    <th>GMeter</th>                   
                    <th>GLM</th>
                    <th>AGLM</th>
                    <th>Process</th>
                    <th>Finishing</th>
                </tr>
            </thead>
        </DataTable>   
       
        </Container> 
           
        </div>
        
       
  );
}

export default Delivery;
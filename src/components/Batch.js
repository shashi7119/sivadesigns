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
//import PrintDataTable from '../components/PrintDataTable';

const API_URL = 'https://www.wynstarcreations.com/seyal/api';

DataTable.use(Responsive);DataTable.use(Select);
DataTable.use(FixedHeader);DataTable.use(DT);
function Batch() {
  const table = useRef();
  const [tableData, setTableData] = useState([ ]);
  const { user , isAuthenticated } = useAuth();
     // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/batches`);
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
          <h1>Plans</h1>
          <table>
            <thead>
              <tr>
                <th>Batch.No</th>
                      <th>Date</th>
                      <th>Inward No</th>
                      <th>Cust Dc</th>
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
      //setSelectedData(dataArr);
      //console.log(dataArr);  
         
    };

  const deleteHandle =  (event) => {

    event.preventDefault();
    if (window.confirm("Delete this item?")) {
    let api = table.current.dt();
    let rows = api.rows({ selected: true }).data().toArray();
    let dataArr = [];
    rows.map(value => (
      dataArr.push(value)
    ));    
    axios.post(`${API_URL}/deleteBatch`, dataArr)
    .then(function (response) {      
      console.log(response);
    })
  .catch(function (error) {
    console.log(error);
  });
    console.log(dataArr);
    api.rows({ selected: true }).remove().draw();
  }
  };

  const completeHandle =  (event) => {

    event.preventDefault();
    if (window.confirm("Complete this batch?")) {
    let api = table.current.dt();
    let rows = api.rows({ selected: true }).data().toArray();
    let dataArr = [];let dataArr1 = [];
    rows.map(value => (
      dataArr.push(value)
    ));
    
    const match = dataArr[0][3].match(/data-pide="([^"]*)"/);
      const value = match ? match[1] : null;
      dataArr1.push(value);
    
    if(dataArr.length === 0) {
      alert('Select batch for complete');
    }else if(dataArr.length > 1) {
      alert('Not allowed multiple plans for complete batch');
    } else {
    axios.post(`${API_URL}/completeBatch`, dataArr1)
    .then(function (response) {      
      alert("Batch Completed");
      api.rows({ selected: true }).remove().draw();
    })
  .catch(function (error) {
    alert("Please generate MRS before complete this batch!");
  });
}
  }
  };

  return (
    <div className="data-wrapper">
   
        <Container>
        <Row>
          <div className="col-10 col-sm-10">
          <h1>Batch</h1>
          <p>Welcome, {user.email}!</p>
          </div>
          <div className="col-2 col-sm-2">
          <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        Actions
      </Dropdown.Toggle>

      <Dropdown.Menu>
         <Dropdown.Item href="#" onClick={PrintHandle}>Print</Dropdown.Item>         
        <Dropdown.Item href="#" onClick={deleteHandle}>Delete</Dropdown.Item>
        <Dropdown.Item href="#" onClick={completeHandle}>Complete</Dropdown.Item>
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
          rowGroup: {
        dataSrc: 0
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
                    <th>Batch.No</th>
                    <th>Batch Date</th>
                    <th>Inward No</th><th>Cust Dc</th>
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

export default Batch;
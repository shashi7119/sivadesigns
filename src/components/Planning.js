import React, { useState, useRef} from 'react';
//import { useNavigate } from 'react-router-dom';
import { Container,Button, Row,Modal, Form,Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import '../css/DataTable.css';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import Select from 'datatables.net-select-dt';
import FixedHeader from 'datatables.net-fixedcolumns-dt';
import Responsive from 'datatables.net-responsive-dt';
import DT from 'datatables.net-dt';
import $ from 'jquery';

const API_URL = 'https://www.wynstarcreations.com/seyal/api';

DataTable.use(Responsive);DataTable.use(Select);
DataTable.use(FixedHeader);DataTable.use(DT);
function Planning() {
  
  const table = useRef();
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState([{
    planid: '', customer:'', width:'',construction:'',inwardno:'',
    planned_weight: '',planned_gmeter: '',actual_weight: '',actual_gmeter: '',noofpcs:''
  }]);  
  const [searchState, setSearchState] = useState('');
  let [selData, setselData] = useState([ ]);
  

  const { user , isAuthenticated } = useAuth();
   
          
  if (!isAuthenticated) {
    //  return null;
     console.log("not logged in")
     return null;  // Avoid rendering profile if the user is not authenticated
   }

  const PrintHandle =  (event) => {
    event.preventDefault();  
    let api = table.current.dt();
    api.rows().deselect();
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
              <th>Plan.No</th>
        <th>Inward.No</th>
        <th>Cust.Dc</th>
                    <th>Date</th>
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
            ${selData
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
    selData.length=0;       
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

    if(dataArr.length === 0) {
      alert('Select entry for delete');
    } else {
      axios.post(`${API_URL}/deletePlan`, dataArr)
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
 
  const handleClose = () =>{ setShow(false);setFormData([]); }
  const handleShow = (e) => { 
    setShow(true);    
  }
  
  const handleColumnChange = (e) => {
    setSearchState(e.target.value);
   
  };
  
  const addRow = (dataArr) => {  
      
       const newRow = { planid: dataArr[0], customer:dataArr[5], width:dataArr[9],construction:dataArr[8],inwardno:dataArr[1],
    planned_weight: dataArr[10],planned_gmeter: dataArr[11],actual_weight: '',actual_gmeter: ''};
        setFormData(formData=>[...formData, newRow]);    
      
  }

  const batchHandle =  (event) => {
    event.preventDefault();    
    setFormData([]);
    let api = table.current.dt();
    let rows = api.rows({ selected: true }).data().toArray(); 
    handleShow();
    rows.map(value => (
     addRow(value)     
    ));    
          
  };



   const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Form Submitted with Data:', formData);
    //table.current.dt().ajax.reload(null, false);
 
    axios.post(`${API_URL}/addBatch1`, formData)
  .then(function (response) {
      console.log(response);   
    setShow(false);
    setFormData([]);
    alert("Batch Created!!");
    let api = table.current.dt();
    api.rows({ selected: true }).remove().draw();
  })
  .catch(function (error) {
    console.log(error);
  });


  };


  const rowClick = (e) => {
      
    e.preventDefault();
    let api = table.current.dt();
    let rows = api.rows({ selected: true }).data().toArray();
    rows.map(value => (
      selData.push(value)         
    ));  
    selData = [...new Set(selData)];  
    setselData(selData); 
  }
  
  return (
    <div className="data-wrapper">
   
        <Container>
        <Row>
          <div className="col-10 col-sm-10">
          <h1>Planning</h1>
          <p>Welcome, {user.user}!</p>
          </div>
          <div className="col-2 col-sm-2">
          <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        Actions
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {user && user.role !=="SP2" && user.role !=="SP1" &&<Dropdown.Item href="/profile">Add</Dropdown.Item>}
         {user && user.role !=="SP2" &&<Dropdown.Item href="#" onClick={PrintHandle}>Print</Dropdown.Item>   }
         {user && user.role !=="SP2" &&<Dropdown.Item href="#" onClick={batchHandle}>Create batch</Dropdown.Item>}
        {user && user.role ==="admin" &&<Dropdown.Item href="#" onClick={deleteHandle}>Delete</Dropdown.Item> }
      </Dropdown.Menu>
    </Dropdown>
          
            </div>
       </Row>
        <Row style={{float:"right",marginRight:"81px",marginBottom:"10px"}}>
        <Form.Select
        className="form-control tsearch"
              value={searchState}
              onChange={handleColumnChange} 
             style={{width:"150px",fontSize:"14px"}}
            >
              <option  value="greyid">Grey Entry No</option>
              <option  value="customer">Customer</option>
   
        </Form.Select> 
    </Row>
    <DataTable onSelect={rowClick} ref={table} 
    options={{
                order: [[0, 'desc']],
            fixedColumns: {
              start: 2
          },
            paging: true,
            scrollCollapse: true,
            scrollX: true,
            scrollY: 400,
            processing: true,
      serverSide: true,
            select: {
                style: 'multi'
            },
            ajax: {
        url: `${API_URL}/plans1`,
        type: 'POST',
        data: function (d) {
             d.searchcol = $(".tsearch").val();
            if (d.length === -1) {
                d.length = 25; // Set default page length
              }
              return d;
         // d.customSearch = searchText; // send custom filter to server
        },
      },
       pageLength: 25,
            columns: [
                {
                    className: "", // Add a class for the toggle button                    
                    data: "0",
                    defaultContent: ""
                },
                { data: "1" },
                { data: "2" },
                { data: "3" },
                { data: "4" },
                { data: "5" },
                { data: "6" },
                { data: "7" },
                { data: "8" },
                { data: "9" },
                { data: "10" },
                { data: "11" },
                { data: "12" },
                { data: "13" },
                { data: "14" },
                { data: "15" },
                
            ],
              
            } }  className="display table sortable stripe row-border order-column nowrap dataTable" style={{width:"100%"}}>
            <thead>
                <tr>                   
                    <th>Plan.No</th>
                    <th>Inward.No</th>
                    <th>Cust Dc</th>
                    <th>Date</th>
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
        <Modal size="xl" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Batch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>       
          {formData.map((row) => ( 
          <Row >
          <Form.Group className="col-6 col-sm-1 mb-3" controlId="formBasicWeight">           
          <Form.Label>{row.planid} </Form.Label>
          </Form.Group>
          <Form.Group className="col-6 col-sm-1 mb-3" controlId="formBasicWeight">           
            <Form.Label>{row.inwardno} </Form.Label>     
          </Form.Group>        
         
           <Form.Group className="col-6 col-sm-2 mb-3" controlId="formBasicGmeter">           
           <Form.Label>{row.construction} </Form.Label>       
          </Form.Group>
          <Form.Group className="col-6 col-sm-1 mb-3" controlId="formBasicGmeter">  
          <Form.Label>{row.planned_weight} </Form.Label>                 
          </Form.Group>
           <Form.Group className="col-6 col-sm-2 mb-3" controlId="formBasicGmeter">           
            <Form.Control
              type="text"
              placeholder="Batch Weight"
              name="actual_weight"               
              value={row.actual_weight}               
              onChange={(e) =>  setFormData((prevRows) =>
                prevRows.map((row1) =>
                  row1.planid === row.planid ? { ...row1, actual_weight:e.target.value} : row1
                )
              )
            } 
              required 
              
            />       
          </Form.Group>
          <Form.Group className="col-6 col-sm-1 mb-3" controlId="formBasicGmeter">   
           <Form.Label>{row.planned_gmeter} </Form.Label>
          </Form.Group>
         
          <Form.Group className="col-6 col-sm-2 mb-3" controlId="formBasicGmeter">           
            <Form.Control
              type="text"
              placeholder="Batch Gmeter"
             name="actual_gmeter"               
              value={row.actual_gmeter}               
              onChange={(e) =>  setFormData((prevRows) =>
                prevRows.map((row1) =>
                  row1.planid === row.planid ? { ...row1, actual_gmeter:e.target.value} : row1
                )
              )
            } 
              required
            />       
          </Form.Group>
          <Form.Group className="col-6 col-sm-2 mb-3" controlId="formBasicGmeter">           
            <Form.Control
              type="text"
             name="noofpcs"    
             placeholder="No of pcs"
              value={row.noofpcs}               
              onChange={(e) =>  setFormData((prevRows) =>
                prevRows.map((row1) =>
                  row1.planid === row.planid ? { ...row1, noofpcs:e.target.value} : row1
                )
              )
            } 
              required
            />       
          </Form.Group>
          </Row>
          ))}          

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save 
          </Button>
        </Modal.Footer>
      </Modal> 
        </Container> 
           
        </div>
        
       
  );
}

export default Planning;
import React, { useState, useRef, useEffect } from 'react';
import { Container, Button, Row, Modal, Form, Dropdown } from 'react-bootstrap';
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
    planned_weight: '',planned_gmeter: '',actual_weight: '',actual_gmeter: '',noofpcs:'',sono:''
  }]);
  const [searchState, setSearchState] = useState('');
  const [selData, setSelData] = useState([]); // Changed from setselData to setSelData
  const { user, isAuthenticated } = useAuth();

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

  if (!isAuthenticated) {
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
    let newSelData = [...selData];

    rows.forEach(value => {
      if (!newSelData.some(existing => existing[0] === value[0])) {
        newSelData.push(value);
      }
    });

    setSelData(newSelData); // Now this matches the state setter name
  }
  
  return (
    <div className="main-content" >
      <Container fluid className="relative">
        <Row className="mb-6">
          <div className="col-10 col-sm-10">
            <h1 className="text-2xl font-bold text-gray-800">Planning</h1>
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
                {user && user.role !=="SP2" && user.role !=="SP1" &&<Dropdown.Item href="/profile">Add</Dropdown.Item>}
                 {user && user.role !=="SP2" &&<Dropdown.Item href="#" onClick={PrintHandle}>Print</Dropdown.Item>   }
                 {user && user.role !=="SP2" &&<Dropdown.Item href="#" onClick={batchHandle}>Create batch</Dropdown.Item>}
                {user && user.role ==="admin" &&<Dropdown.Item href="#" onClick={deleteHandle}>Delete</Dropdown.Item> }
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="ml-auto w-1/5"> {/* This creates 20% width and right alignment */}
            <Form.Select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 tsearch"
              value={searchState}
              onChange={handleColumnChange}
            >
              <option value="greyid">Grey Entry No</option>
              <option value="customer">Customer</option>
            </Form.Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 relative bg-white">
          <DataTable 
            onSelect={rowClick} 
            ref={table}
            options={{
              scrollX: true,
              scrollY: '60vh',
              scrollCollapse: true,
              fixedColumns: {
                left: 2
              },
              order: [[0, 'desc']],
              paging: true,
              processing: true,
              serverSide: true,
              select: { style: 'multi' },
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
              // Add custom styling
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
              // Add custom classes
              className: "w-full text-sm text-left text-gray-500",
              // Add container class
              containerClassName: "relative z-10"
            }}
          >
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Plan.No</th>
                <th className="px-6 py-3">Inward.No</th>
                <th className="px-6 py-3">Cust Dc</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Machine</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Fabric</th>
                <th className="px-6 py-3">Shade</th>
                <th className="px-6 py-3">Construction</th>
                <th className="px-6 py-3">Width</th>
                <th className="px-6 py-3">Weight</th>
                <th className="px-6 py-3">GMeter</th>                   
                <th className="px-6 py-3">GLM</th>
                <th className="px-6 py-3">AGLM</th>
                <th className="px-6 py-3">Process</th>
                <th className="px-6 py-3">Finishing</th>
              </tr>
            </thead>
          </DataTable>
        </div>

        {/* Modal with updated styling */}
        <Modal size="xl" show={show} onHide={handleClose} className="rounded-lg">
          <Modal.Header closeButton className="bg-gray-50 border-b border-gray-200">
            <Modal.Title className="text-xl font-semibold text-gray-800">
              Create Batch
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-6">
            <Form className="space-y-4">
              {formData.map((row, index) => (
                <Row key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Form.Group className="flex-1">
                    <Form.Label className="block text-sm font-medium text-gray-700">
                      {row.planid}
                    </Form.Label>
                  </Form.Group>
                  <Form.Group className="flex-1">
                    <Form.Label className="block text-sm font-medium text-gray-700">
                      {row.inwardno}
                    </Form.Label>     
                  </Form.Group>        
         
           <Form.Group className="flex-1">
           <Form.Label className="block text-sm font-medium text-gray-700">
             {row.construction}
           </Form.Label>       
          </Form.Group>
          <Form.Group className="flex-1">  
          <Form.Label className="block text-sm font-medium text-gray-700">
            {row.planned_weight}
          </Form.Label>                 
          </Form.Group>
           <Form.Group className="flex-1">
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
          <Form.Group className="flex-1">   
           <Form.Label className="block text-sm font-medium text-gray-700">
             {row.planned_gmeter}
           </Form.Label>
          </Form.Group>
         
          <Form.Group className="flex-1">
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
          <Form.Group className="flex-1">
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
           <Form.Group className="flex-1">
            <Form.Control
              type="text"
             name="sono"    
             placeholder="Sale Order"
              value={row.sono}               
              onChange={(e) =>  setFormData((prevRows) =>
                prevRows.map((row1) =>
                  row1.planid === row.planid ? { ...row1, sono:e.target.value} : row1
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

export default Planning;
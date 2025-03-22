import React, { useState, useEffect,useRef} from 'react';
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
//import PrintDataTable from '../components/PrintDataTable';

const API_URL = 'https://www.wynstarcreations.com/seyal/api';

DataTable.use(Responsive);DataTable.use(Select);
DataTable.use(FixedHeader);DataTable.use(DT);
function Planning() {
  
  const table = useRef();
  const [show, setShow] = useState(false);
  const [tableData, setTableData] = useState([ ]);
  const [formData, setFormData] = useState({
    planid: '', stock_weight: '0',  stock_gmeter: '0', 
    planned_weight: '',planned_gmeter: '',actual_weight: '',actual_gmeter: '',
  });  
  let [selData, setselData] = useState([ ]);
  //const navigate = useNavigate();
  
  const regexPatterns = {
    stock_weight: /^[0-9.]*$/,          // Only numbers for input1
    stock_gmeter: /^[0-9.]*$/,              // Only letters for input2
    planned_weight: /^[0-9. ]*$/,       // Alphanumeric and underscores for input3
    planned_gmeter: /^[0-9. ]*$/,
    actual_weight: /^[0-9.]*$/,       // Alphanumeric and underscores for input3
    actual_gmeter: /^[0-9.]*$/
  };

  const { user , isAuthenticated } = useAuth();
  // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/plans`);
        setTableData(response.data);
      } catch (error) {
        console.log(error);
      } 
    };    
    user && fetchData();
  }, [user]);
   
 
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
 
  const handleClose = () => setShow(false);
  const handleShow = (e) => { 
    setShow(true);    
  }

  const batchHandle =  (event) => {
    event.preventDefault();    
    let api = table.current.dt();
    let rows = api.rows({ selected: true }).data().toArray();
    let dataArr = [];
    rows.map(value => (
      dataArr.push(value)
    ));    
    if(dataArr.length === 0) {
      alert('Select plan for create batch');
    }else if(dataArr.length > 1) {
      alert('Not allowed multiple plans for create batch');
    } else {
      const planid = dataArr[0][0];

         axios.get(`${API_URL}/getStock`,{
          params: {
              planid: planid
            }
        }).then(function (response) {      
          setFormData(response.data);
          handleShow();       
        })
      .catch(function (error) {
        console.log(error);
      });;
      console.log(dataArr);              
  }    
  };

  const handleKeyUp = (event) => {
    const { name, value } = event.target; // Destructure name and value from the event
    
    // Step 4: Validate the input value based on the regex pattern
    const isValid = regexPatterns[name].test(value);

    // Step 5: If valid, update the state, otherwise you can show an error or just keep it unchanged
    if (isValid) {

      
      setFormData((prevData) => ({
        ...prevData,
        [name]: value // Update the value of the specific input field
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: '' // Reset the field to empty
      }));
    }

    //alert(formData.machine);
    
   };

   const handleSubmit = async (event) => {
    event.preventDefault();

    console.log('Form Submitted with Data:', formData);
    if((formData.stock_weight === 0) || (formData.stock_weight === "")){
      alert("Grey Stock weight needed to create the batch");
      return;
    }

    if((formData.stock_gmeter === 0) || (formData.stock_gmeter === "")){
      alert("Grey Stock gmeter needed to create the batch");
      return;
    }
    axios.post(`${API_URL}/addBatch`, formData)
  .then(function (response) {

    setShow(false);
    setFormData('');
    alert("Batch Created!!");
    let api = table.current.dt();
    api.rows({ selected: true }).remove().draw();
  })
  .catch(function (error) {
    console.log(error);
  });
    //const userData = response.data;
   // console.log('Data From Backend:', userData);

  };

  const checkStock = (event) => {
    const { name, value } = event.target;
    let stock = 0;    
    if(name ==="actual_weight"){
      stock = formData.stock_weight;      
    }else if(name ==="actual_gmeter"){
      stock = formData.stock_gmeter;  
    }
   
    if(parseFloat(stock) < parseFloat(value)){
      alert("Stock value should be greater than actual value");
      event.target.value=0;
    }
  }

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
        <Dropdown.Item href="/profile">Add</Dropdown.Item>
         <Dropdown.Item href="#" onClick={PrintHandle}>Print</Dropdown.Item>   
         <Dropdown.Item href="#" onClick={batchHandle}>Create batch</Dropdown.Item>    
        <Dropdown.Item href="#" onClick={deleteHandle}>Delete</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
          
            </div>
       </Row>
                
    <DataTable onSelect={rowClick} ref={table} data={tableData} 
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
            },
            columns: [
                {
                    className: "dt-control", // Add a class for the toggle button
                    orderable: false,
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
        <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create Batch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>          
          <Row>
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicWeight">
            <Form.Label>Stock Weight </Form.Label>
            <Form.Control
              type="text"
              name="stock_weight"             
              value={formData.stock_weight}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))} 
              required 
              disabled
            />       
          </Form.Group>
         
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicGmeter">
            <Form.Label>Stock Gmeter </Form.Label>
            <Form.Control
              type="text"
              name="stock_gmeter"             
              value={formData.stock_gmeter}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}  
              required 
              disabled
            />       
          </Form.Group>
          </Row>
          <Row>
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicAWeight">
            <Form.Label>Planned Weight </Form.Label>
            <Form.Control
              type="text"
              name="planned_weight"
             
              value={formData.planned_weight}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  {setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }));

              

            }
          } 
              required 
            />       
          </Form.Group>
         
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicAGmeter">
            <Form.Label>Planned Gmeter </Form.Label>
            <Form.Control
              type="text"
              name="planned_gmeter"
             
              value={formData.planned_gmeter}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}  
                
            />       
          </Form.Group>
          </Row>
          <Row>
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicAWeight">
            <Form.Label>Actual Weight </Form.Label>
            <Form.Control
              type="text"
              name="actual_weight"
             
              value={formData.actual_weight}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  {setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }));
              checkStock(e);
            }
            } 
              required 
            />       
          </Form.Group>
         
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicAGmeter">
            <Form.Label>Actual Gmeter </Form.Label>
            <Form.Control
              type="text"
              name="actual_gmeter"
             
              value={formData.actual_gmeter}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  {setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }));
              checkStock(e);
            }
            }  
                
            />       
          </Form.Group>
          </Row>
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
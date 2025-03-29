import React, { useState, useEffect,useRef} from 'react';
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
function Batchfinishing() {
  const table = useRef();
  const [tableData, setTableData] = useState([ ]);
  const { user , isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
      bid: '', batch_weight: '0', batch_gmeter: '0', 
      final_weight: '',final_gmeter: '',finishing: '',final_width: '',partial:'',pide:''
    });  
    const [fetch, setFetch] = useState(false);
     const [show, setShow] = useState(false);
     const handleClose = () => setShow(false);
    const handleShow = (e) => { 
      setShow(true);    
    }
    const regexPatterns = {
      batch_weight: /^[0-9.]*$/,          // Only numbers for input1
      batch_gmeter: /^[0-9.]*$/,              // Only letters for input2
      final_weight: /^[0-9. ]*$/,       // Alphanumeric and underscores for input3
      final_gmeter: /^[0-9. ]*$/,
    };
     // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/finishing`);
        setTableData(response.data);
      } catch (error) {
        console.log(error);
      } 
    };
    user && fetchData();
  }, [user,fetch]);

      
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
  

  const completeHandle =  (event) => {
    event.preventDefault();    
    let api = table.current.dt();
    let rows = api.rows({ selected: true }).data().toArray();
    let dataArr = [];
    rows.map(value => (
      dataArr.push(value)
    ));    
    if(dataArr.length === 0) {
      alert('Select batch for delivery');
    }else if(dataArr.length > 1) {
      alert('Not allowed multiple batches for complete');
    } else {

      const match = dataArr[0][0].match(/data-pide="([^"]*)"/);
      const value = match ? match[1] : null;

      formData.bid = dataArr[0][0];
      formData.batch_weight = dataArr[0][10];
      formData.batch_gmeter = dataArr[0][11];
      formData.finishing    = dataArr[0][15];
      formData.pide    = value;
      formData.final_weight = "";
      formData.final_gmeter = "";
      setFormData(formData);
          handleShow();

       
      console.log(formData);              
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
    if((formData.final_weight === 0) || (formData.final_weight === "")){
      alert("Final weight needed to complete");
      return;
    }

    if((formData.final_gmeter === 0) || (formData.final_gmeter === "")){
      alert("Final gmeter needed to complete");
      return;
    }
   axios.post(`${API_URL}/addDelivery`, formData)
  .then(function (response) {

    setShow(false);
    setFormData('');
    setFetch(true);
    alert("Batch Completed!!");   
  })
  .catch(function (error) {
    console.log(error);
  });
    //const userData = response.data;
    console.log('Data From Backend:', formData);

  };

  const checkStock = (event) => {
    const { name, value } = event.target;
    let stock = 0;    
    if(name ==="final_weight"){
      stock = formData.batch_weight;      
    }else if(name ==="final_gmeter"){
      stock = formData.batch_gmeter;  
    }
   
    if(parseFloat(stock) < parseFloat(value)){
      alert("Fianl value should be lesser than stock value");
      event.target.value=0;
    }
  }
  
  const handleCheckboxChange = (event) => {
    const target = event.target;
    const checked = target.checked;
    formData.partial = checked;   
  }

  return (
    <div className="data-wrapper">
   
        <Container>
        <Row>
          <div className="col-10 col-sm-10">
          <h1>Finishing</h1>
          <p>Welcome, {user.email}!</p>
          </div>
          <div className="col-2 col-sm-2">
          <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        Actions
      </Dropdown.Toggle>

      <Dropdown.Menu>
         <Dropdown.Item href="#" onClick={PrintHandle}>Print</Dropdown.Item>  
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
                    <th>Inward.No</th>
                    <th>Cust.Dc</th>
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
          <Modal.Title>Complete Finishing</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>          
          <Row>
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicWeight">
            <Form.Label>Batch Weight </Form.Label>
            <Form.Control
              type="text"
              name="batch_weight"             
              value={formData.batch_weight}
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
            <Form.Label>Batch Gmeter </Form.Label>
            <Form.Control
              type="text"
              name="batch_gmeter"             
              value={formData.batch_gmeter}
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
            <Form.Label>Final Weight </Form.Label>
            <Form.Control
              type="text"
              name="final_weight"
             
              value={formData.final_weight}
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
            <Form.Label>Final Gmeter </Form.Label>
            <Form.Control
              type="text"
              name="final_gmeter"
             
              value={formData.final_gmeter}
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
          <Row>
           <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicAGmeter">
            <Form.Label>Final Width </Form.Label>
            <Form.Control
              type="text"
              name="final_width"             
              value={formData.final_width}             
              onChange={(e) =>  {setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }));
              
            }
            }  
                
            />       
          </Form.Group>
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicAGmeter">
            <Form.Label>Partial Delivery </Form.Label>
            <Form.Check
              type="switch"
              name="partial"             
              value={formData.partial}             
               onClick={handleCheckboxChange} 
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

export default Batchfinishing;
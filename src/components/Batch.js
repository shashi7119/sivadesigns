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
function Batch() {
  const table = useRef();
  const [show, setShow] = useState(false);
  const [tableData, setTableData] = useState([ ]);
  
 
 
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
    fetchData();
  }, []);

      const { user , isAuthenticated } = useAuth();
      if (!isAuthenticated) {
        return null;
      // navigate('/login');  // Avoid rendering profile if the user is not authenticated
     }
   
  const PrintHandle =  (event) => {
    event.preventDefault();
    let api = table.current.dt();
    let rows = api.rows({ selected: true }).data().toArray();
    let dataArr = [];
    rows.map(value => (
      dataArr.push(value)
    ));    
    //setSelectedData(dataArr);
    console.log(dataArr);  
       
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

 
  const handleClose = () => setShow(false);
  const handleShow = (e) => { 
    setShow(true);    
  }

  const mrsHandle =  (event) => {
    event.preventDefault();    
    let api = table.current.dt();
    let rows = api.rows({ selected: true }).data().toArray();
    let dataArr = [];
    rows.map(value => (
      dataArr.push(value)
    ));    
    if(dataArr.length === 0) {
      alert('Select batch for MRS');
    } else {
      //const planid = dataArr[0][0];
      handleShow();  
       /*  axios.get(`${API_URL}/getStock`,{
          params: {
              planid: planid
            }
        }).then(function (response) {      
          setFormData(response.data);
          handleShow();       
        })
      .catch(function (error) {
        console.log(error);
      });;*/
      console.log(dataArr);              
  }    
  };


   const handleSubmit = async (event) => {
    event.preventDefault();

    /*console.log('Form Submitted with Data:', formData);
    if((formData.stock_weight === "0") || (formData.stock_weight === "")){
      alert("Grey Stock weight needed to create the batch");
      return;
    }

    if((formData.stock_gmeter === "0") || (formData.stock_gmeter === "")){
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
  });*/
    //const userData = response.data;
   // console.log('Data From Backend:', userData);

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
         <Dropdown.Item href="#" onClick={mrsHandle}>Create MRS</Dropdown.Item>    
        <Dropdown.Item href="#" onClick={deleteHandle}>Delete</Dropdown.Item>
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
                    <th>Planned Date</th>
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
          <Modal.Title>Create MRS</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>          
          
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

export default Batch;
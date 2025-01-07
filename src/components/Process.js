import React, { useState, useEffect, useRef} from 'react';
import { Container,Button, Row,Modal, Form, Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import '../css/DataTable.css';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import FixedHeader from 'datatables.net-fixedcolumns-dt';

import DT from 'datatables.net-dt';
const API_URL = 'https://www.wynstarcreations.com/seyal/api';

DataTable.use(DT);DataTable.use(FixedHeader);
function Process() {
    const table = useRef();
    const [formData, setFormData] = useState({
        mname: '',ptime: '',type:'process',ide:''
      });

      const regexPatterns = {
        mname: /^[a-zA-Z0-9_@./#&+\-, ]*$/,ptime: /^[0-9]*$/,
      };

    const [tableData, setTableData] = useState([ ]);
    const [show, setShow] = useState(false);
   const [fetch, setFetch] = useState(false);
   const [isEdit, setIsEdit] = useState(false);
   const { user , isAuthenticated } = useAuth();
 
  const handleClose = () => {
    setShow(false);
    setFormData('');   
  }
  const handleShow = () => {
    setShow(true);
    setIsEdit(false);
  }

     // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/getMasters?type=process`);
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
    
        
       };

       const edithandle =  (event) => {
        setIsEdit(true);
        event.preventDefault();       
        let api = table.current.dt();
        let rows = api.rows({ selected: true }).data().toArray();
        let dataArr = [];
        rows.map(value => (
          dataArr.push(value)
        ));    

        if(dataArr.length === 0) {
          alert('Select entry for edit');
        }else if(dataArr.length > 1) {
          alert('Not allowed multiple entries for edit');
        } else {
          console.log(dataArr); 
          
           setFormData({ mname:dataArr[0][4],ide:dataArr[0][3],
            ptime:dataArr[0][2],type:'process'});  
             
          setShow(true);
        }
      };

      const handleSubmit = async (event) => {
        event.preventDefault();
        
        console.log('Form Submitted with Data:', formData);
        
        if(!isEdit) {               
          axios.post(`${API_URL}/addMaster`, formData)
        .then(function (response) {        
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
        if(fetch){setFetch(false);} else {setFetch(true);}
      } else {
          console.log(formData);    
          axios.post(`${API_URL}/editMaster`, formData)
          .then(function (response) {        
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });   
          if(fetch){setFetch(false);} else {setFetch(true);} 
      }
      setShow(false);
      setFormData('');
      
      };

  return (
    <div className="data-wrapper">   
        <Container>
        <Row>
          <div class="col-10 col-sm-10">
          <h3>Process Master</h3>
          <p>Welcome, {user.email}!</p>
          </div>
          <div class="col-2 col-sm-2">
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Actions
            </Dropdown.Toggle>
            <Dropdown.Menu>
               <Dropdown.Item href="#" onClick={handleShow}>Add</Dropdown.Item>
               <Dropdown.Item href="#" onClick={edithandle}>Edit</Dropdown.Item>              
            </Dropdown.Menu>
        </Dropdown>
            </div>
       </Row>
    <DataTable ref={table} data={tableData} options={{
                responsive: true,
                select: true,
                iDisplayLength:25,
                fixedHeader: true,  
   
            }} className="display table sortable">
            <thead>
                <tr>
                    <th style={{maxWidth:'10%'}}>S.No</th>
                    <th>Process</th> 
                    <th>Process Time</th>                                      
                </tr>
            </thead>
        </DataTable>
        <Modal size="md" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Process</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form><Row>
            <Form.Group className="col-12 col-sm-12 " >
              <Form.Control
              type="text"
              placeholder='Enter Process'
              name="mname"              
              value={formData.mname}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            />
            </Form.Group>             
            </Row>            
            <Row className="mt-2">  
            <Form.Group className="col-12 col-sm-12 mt-2" >  
              <Form.Control
              type="text"
              name="ptime"    
              placeholder='Process Time'          
              value={formData.ptime}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}   
            required
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


export default Process;
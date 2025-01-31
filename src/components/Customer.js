import React, { useState, useEffect} from 'react';
import { Container,Button, Row,Modal, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import '../css/DataTable.css';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
const API_URL = 'https://www.wynstarcreations.com/seyal/api/getMasters?type=customer';
const API_URL1 = 'https://www.wynstarcreations.com/seyal/api/addMaster';

DataTable.use(DT);
function Customer() {

    const [formData, setFormData] = useState({
        mname: '',type:'customer',email:'',contact_number:''
        ,address1:'',address2:'',pincode:'',gstin:''
      });

      const regexPatterns = {
        mname: /^[a-zA-Z0-9_@./#&+\-, ]*$/,email: /^[a-zA-Z0-9_@./#&+\-, ]*$/,
        address1: /^[a-zA-Z0-9_@./#&+\-, ]*$/,contact_number: /^[0-9 ]*$/,
        address2: /^[a-zA-Z0-9_@./#&+\-, ]*$/,pincode: /^[0-9 ]*$/,
        gstin: /^[a-zA-Z0-9]*$/
      };

    const [tableData, setTableData] = useState([ ]);
    const [show, setShow] = useState(false);
    const [fetch, setFetch] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const { user , isAuthenticated } = useAuth();

     // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}`);
        setTableData(response.data);
      } catch (error) {
        console.log(error);
      } 
    };
    user && fetchData();
  }, [fetch,user]);

     
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

     const handleSubmit = async (event) => {
        event.preventDefault();
    
        console.log('Form Submitted with Data:', formData);
        formData.type="customer";
            axios.post(`${API_URL1}`, formData)
      .then(function (response) {

        setShow(false);
        setFormData('');
        setFetch(true);
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
        //const userData = response.data;
       // console.log('Data From Backend:', userData);
    
      };
     

  return (
    <div className="data-wrapper">
    <div className="data-form-container" >
        <Container>
        <h1>Customer Master</h1>
        <p>Welcome, {user.email}!</p>
        </Container>
        <Row>
          <div class="col-10 col-sm-10"></div>
          <div class="col-2 col-sm-2">
            <Button variant="primary" type="submit" className="login-button" onClick={handleShow}>
              Add
            </Button>
            </div>
       </Row>
    <DataTable data={tableData} options={{
      order: [[0, 'desc']],
                responsive: true,
                select: true,
                iDisplayLength:25,
            }} className="display table sortable">
            <thead>
                <tr>
                    <th>S.No</th>
                    <th>Customer</th> 
                    <th>Contact Number</th> 
                    <th>Email</th> 
                    <th>Address 1</th> 
                    <th>Address 2</th> 
                    <th>Pincode</th> 
                    <th>GSTIN</th>                   
                </tr>
            </thead>
        </DataTable>
        <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{
      maxHeight: '400px',
      overflowY: 'auto'
     }}>
          <Form>
            <Form.Group className="mb-2" >
              <Form.Label>Customer Name</Form.Label>
              <Form.Control
              type="text"
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
            <Form.Group className="mb-2" >
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
              type="text"
              name="contact_number"              
              value={formData.contact_number}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            />
            </Form.Group>
            <Form.Group className="mb-2" >
              <Form.Label>Email</Form.Label>
              <Form.Control
              type="text"
              name="email"              
              value={formData.email}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             
            />
            </Form.Group>
            <Form.Group className="mb-2" >
              <Form.Label>Address 1</Form.Label>
              <Form.Control
              type="text"
              name="address1"              
              value={formData.address1}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            />
            </Form.Group>
            <Form.Group className="mb-2" >
              <Form.Label>Address 2</Form.Label>
              <Form.Control
              type="text"
              name="address2"              
              value={formData.address2}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             
            />
            </Form.Group>
            <Form.Group className="mb-2" >
              <Form.Label>Pincode</Form.Label>
              <Form.Control
              type="text"
              name="pincode"              
              value={formData.pincode}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            />
            </Form.Group>
            <Form.Group className="mb-2" >
              <Form.Label>GSTIN</Form.Label>
              <Form.Control
              type="text"
              name="gstin"              
              value={formData.gstin}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            />
            </Form.Group>
            
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
        </div>
        </div>
  );
}


export default Customer;
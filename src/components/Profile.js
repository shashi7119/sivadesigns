import React, { useState,useEffect} from 'react';
import { Container, Row } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import '../css/Profile.css';
import '../css/Styles.css';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'
const API_URL = 'https://www.wynstarcreations.com/seyal/api/planning';
const API_URL1 = 'https://www.wynstarcreations.com/seyal/api/getAllMasters';


function Profile() {

  const navigate = useNavigate();
  const [machineData, setMachineData] = useState([ ]);
  const [customerData, setCusotmerData] = useState([ ]);
  const [widthData, setWidthData] = useState([ ]);
  const [processData, setProcessData] = useState([ ]);
  const [fabricData, setFabricData] = useState([ ]);
  const [constructionData, setConstructionData] = useState([ ]);
 
      // Fetch data from backend API
      useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await axios.get(`${API_URL1}`);
            setMachineData(response.data['machine']);
            setCusotmerData(response.data['customer']);
            setWidthData(response.data['width']);
            setProcessData(response.data['process']);
            setFabricData(response.data['fabric']);
            setConstructionData(response.data['construction']);
            
          } catch (error) {
            console.log(error);
          } 
        };
        fetchData();
      }, []);

  // Step 1: Declare state for storing values of all text inputs
  const [formData, setFormData] = useState({
    date:null,machine: '', customer: '', fabric: '', 
    shade: '', construction: '', width: '',
    weight: '',  gmeter: 0, glm: '',aglm: '',process: '',
  });

  // Step 2: Declare regex patterns for each input
  const regexPatterns = {
    machine: /^[0-9]*$/,          // Only numbers for input1
    customer: /^[a-zA-Z ]*$/,              // Only letters for input2
    fabric: /^[a-zA-Z0-9_ ]*$/,       // Alphanumeric and underscores for input3
    shade: /^[a-zA-Z0-9_ ]*$/,construction: /^[a-zA-Z0-9_x/ ]*$/,
    width: /^[0-9"]*$/,gmeter: /^[0-9]*$/,
    weight: /^[0-9]*$/,glm: /^[0-9]*$/,
    aglm: /^[a-zA-Z0-9_. ]*$/,process: /^[a-zA-Z0-9_ ]*$/,
  };

  const { user , isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return null;
  // navigate('/login');  // Avoid rendering profile if the user is not authenticated
 }

       
  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log('Form Submitted with Data:', formData);
    //integrate data validate and backend

       /*const response = await axios.post(`${API_URL}`, formData,
        {
          headers: {
    'Content-Type': 'multipart/form-data'
  }
        });*/

        axios.post(`${API_URL}`, formData)
  .then(function (response) {
    navigate('/planning');
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
    //const userData = response.data;
   // console.log('Data From Backend:', userData);

  };

   // Step 3: Define the onKeyUp handler
   const handleKeyUp = (event) => {
    const { name, value } = event.target; // Destructure name and value from the event

    
    // Step 4: Validate the input value based on the regex pattern
    const isValid = regexPatterns[name].test(value);

    // Step 5: If valid, update the state, otherwise you can show an error or just keep it unchanged
    if (isValid) {

      if(name === "gmeter"){
        formData.aglm = parseFloat(formData.weight/value).toFixed(2);
     }

     if(name === "weight" && formData.gmeter !==0 ){
      formData.aglm = parseFloat(value/formData.gmeter).toFixed(2);
    }

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

  return (
    
    <div className="data-wrapper">
    <div className="data-form-container">
        <Container>
        <h1>Add Planning</h1>
        <p>Welcome, {user.email}!</p>
        </Container>
       
        <Form className="tooltip-label-right mb-4" onSubmit={handleSubmit}>
        <Row>
        <Form.Group className="col-12 col-sm-6 mb-3" controlId="formBasicMachine">
            <Form.Label>Date</Form.Label>
            <DatePicker
        id="date-input"
        selected={formData.date}
        onChange={(date) =>  setFormData((prevData) => ({
          ...prevData,
          date // Update the value of the specific input field
        }))}
      
        dateFormat="dd/MM/yyyy"
        placeholderText="Select a date"
        className="date-input"
      />
         
       
          </Form.Group>
          <Form.Group className="col-12 col-sm-6 mb-3" controlId="formBasicMachine">
            <Form.Label>Machine</Form.Label>
            <Form.Select             
              name="machine"              
              value={formData.machine}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Select Machine</option>
         {machineData.map(machine => (
          
  <option  value={machine}>
    {machine}
  </option>
))}
           </Form.Select>
          </Form.Group>
          <Form.Group className="col-12 col-sm-6 mb-3" controlId="formBasicCustomer">
            <Form.Label>Customer </Form.Label>
            <Form.Select             
              name="customer"              
              value={formData.customer}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Select Customer</option>
         {customerData.map(customer => (
          
  <option  value={customer}>
    {customer}
  </option>
))}
           </Form.Select>
       
          </Form.Group>
          <Form.Group className="col-12 col-sm-6 mb-3" controlId="formBasicFabric">
            <Form.Label>Fabric</Form.Label>
            <Form.Select             
              name="fabric"              
              value={formData.fabric}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Select Fabric</option>
         {fabricData.map(fabric => (
          
  <option  value={fabric}>
    {fabric}
  </option>
))}
           </Form.Select>
          </Form.Group>
          <Form.Group className="col-12 col-sm-6 mb-3" controlId="formBasicShade">
            <Form.Label>Shade</Form.Label>
            <Form.Control
              type="text"
              name="shade"
             
              value={formData.shade}
              onKeyUp={handleKeyUp}  
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}  
              required 
            />       
          </Form.Group>
          <Form.Group className="col-12 col-sm-6 mb-3" controlId="formBasicConstruction">
            <Form.Label>Construction </Form.Label>
            <Form.Select             
              name="construction"              
              value={formData.construction}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Select Construction</option>
         {constructionData.map(construction => (
          
  <option  value={construction}>
    {construction}
  </option>
))}
           </Form.Select>      
          </Form.Group>
          <Form.Group className="col-12 col-sm-6 mb-3" controlId="formBasicWidth">
            <Form.Label>Width </Form.Label>
            <Form.Select             
              name="width"              
              value={formData.width}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Select Width</option>
         {widthData.map(width => (
          
  <option  value={width}>
    {width}
  </option>
))}
           </Form.Select>       
          </Form.Group>
          <Form.Group className="col-12 col-sm-6 mb-3" controlId="formBasicWeight">
            <Form.Label>Weight </Form.Label>
            <Form.Control
              type="text"
              name="weight"
             
              value={formData.weight}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))} 
              required 
            />       
          </Form.Group>
          <Form.Group className="col-12 col-sm-6 mb-3" controlId="formBasicGmeter">
            <Form.Label>Gmeter </Form.Label>
            <Form.Control
              type="text"
              name="gmeter"
             
              value={formData.gmeter}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}  
              required  
            />       
          </Form.Group>
          <Form.Group className="col-12 col-sm-6 mb-3" controlId="formBasicFabric">
            <Form.Label>GLM </Form.Label>
            <Form.Control
              type="text"
              name="glm"
           
              value={formData.glm}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}   
              required  
            />       
          </Form.Group>
          <Form.Group className="col-12 col-sm-6 mb-3" controlId="formBasicaglm">
            <Form.Label>AGLM </Form.Label>
            <Form.Control
              type="text"
              name="aglm"
              disabled="disabled"
           
              value={formData.aglm}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}  
              required
            />       
          </Form.Group>
          <Form.Group className="col-12 col-sm-6 mb-3" controlId="formBasicProcess">
            <Form.Label>Process</Form.Label>
            <Form.Select             
              name="process"              
              value={formData.process}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Select Process</option>
         {processData.map(process => (
          
  <option  value={process}>
    {process}
  </option>
))}
           </Form.Select>      
          </Form.Group>
          <div className="d-flex">
          <div className="col-12 col-sm-6 mb-3"></div>
          <div className="col-12 col-sm-4 mb-3">
            <Button variant="primary" type="submit" className="login-button">
            Save
          </Button>
          
          </div>
          </div>
          </Row>
        </Form>
        
     </div>
  </div>
  );
}


export default Profile;
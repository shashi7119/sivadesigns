import React, { useState,useEffect} from 'react';
import { Container, Row } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate,useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import '../css/Profile.css';
import '../css/Styles.css';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'
const API_URL = 'https://www.wynstarcreations.com/seyal/api';


function Edit() {

    let { planid } = useParams();
   
  const navigate = useNavigate();
  const [machineData, setMachineData] = useState([]);
  const [customerData, setCusotmerData] = useState([ ]);
  const [widthData, setWidthData] = useState([ ]);
  const [processData, setProcessData] = useState([ ]);
  const [fabricData, setFabricData] = useState([ ]);
  const [constructionData, setConstructionData] = useState([ ]);
  const [finishingData, setFinishingData] = useState([ ]);
  const { user , isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    ide:'',date:null,machine: '', customer: '', fabric: '', 
    shade: '', construction: '', width: '',
    weight: '0',  gmeter: 0, glm: '0',aglm: '0',process: '',finishing: '',
  });
 formData.ide=planid;
      // Fetch data from backend API
      useEffect(() => {
       
        const fetchData = async () => {
          try {
            const response = await axios.get(`${API_URL}/getAllMasters`,{
                params: {
                    q: 'edit',
                    planid: planid
                  }
            });
            setMachineData(response.data['machine']);
            setCusotmerData(response.data['customer']);
            setWidthData(response.data['width']);
            setProcessData(response.data['process']);
            setFabricData(response.data['fabric']);
            setConstructionData(response.data['construction']);
            setFinishingData(response.data['finishing']);
            setFormData(response.data['edit']);
            
          } catch (error) {
            console.log(error);
          } 
        };
        user && fetchData();
      }, [planid,user]);

  // Step 1: Declare state for storing values of all text inputs
 

  const [availData, setAvailData] = useState("0");

  // Step 2: Declare regex patterns for each input
  const regexPatterns = {
    machine: /^[0-9]*$/,          // Only numbers for input1
    customer: /^[A-Za-z0-9_@./#&+\-, ]*$/,              // Only letters for input2
    fabric: /^[A-Za-z0-9_@./#&+\-, ]*$/,       // Alphanumeric and underscores for input3
    shade: /^[A-Za-z0-9_@./#&+\-, ]*$/,construction: /^[A-Za-z0-9_@./#&+\-, ]*$/,
    width: /^[0-9"]*$/,weight: /^[0-9. ]*$/, gmeter: /^[0-9. ]*$/,glm: /^[0-9. ]*$/,process: /^[a-zA-Z0-9_+ ]*$/,finishing: /^[a-zA-Z0-9_+ ]*$/,
  };

  
  if (!isAuthenticated) {
    return null;
  // navigate('/login');  // Avoid rendering profile if the user is not authenticated
 }
 
       
  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log('Form Submitted with Data:', formData);
    axios.post(`${API_URL}/updateplanning`, formData)
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

      if((name === "gmeter")&&(formData.weight !==0)){
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

   const checkMachineAvailability = (event) => {
    const { name, value } = event.target;
    const date = formData.date;
    axios.post(`${API_URL}/checkMachineAvailability`, { date, value }).then(function (response) {
     console.log(name);
      setAvailData(response.data.cnt);
    })
  .catch(function (error) {
    console.log(error);
  });
   }
  return (
    
    <div className="data-wrapper">
    <div className="data-form-container">
        <Container>
        <h1>Edit Planning on - {planid}</h1>
        <p>Welcome, {user.email}!</p>
        </Container>
       
        <Form className="tooltip-label-right mb-4" onSubmit={handleSubmit}>
        <Row>
        <Form.Group className="col-12 col-sm-6 mb-3" controlId="formBasicMachine">
            <Form.Label>Date</Form.Label>
            <DatePicker
        id="date-input"
        selected={formData.date}
        onChange={(date) => { setFormData((prevData) => ({
          ...prevData,
          date
        }));
        setFormData((prevData) => ({
          ...prevData,
          "machine": ""
        }));
        setAvailData(0);
      }
      
      }
      
        dateFormat="dd/MM/yyyy"
        placeholderText="Select a date"
        className="date-input"
      />
         
         
          </Form.Group>
         
          <Form.Group className="col-12 col-sm-6 mb-3" controlId="formBasicMachine">
            <Form.Label>Machine <span>*</span></Form.Label>
            {availData !==0 && <Form.Label style={{color:"red",marginLeft:"20px"}}>Occupied <span>{availData}</span></Form.Label> }
            
            <Form.Select             
              name="machine"              
              value={formData.machine}
              onChange={(e) =>  {setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }));
              checkMachineAvailability(e);
            }   } 
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
            <Form.Label>Customer <span>*</span></Form.Label>
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
            <Form.Label>Fabric <span>*</span></Form.Label>
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
            <Form.Label>Shade <span>*</span></Form.Label>
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
            <Form.Label>Construction <span>*</span></Form.Label>
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
            <Form.Label>Width <span>*</span></Form.Label>
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
              
            />       
          </Form.Group>
          <Form.Group className="col-12 col-sm-6 mb-3" controlId="formBasicProcess">
            <Form.Label>Process <span>*</span></Form.Label>
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
          <Form.Group className="col-12 col-sm-6 mb-3" controlId="formBasicProcess">
            <Form.Label>Finishing <span>*</span></Form.Label>
            <Form.Select             
              name="finishing"              
              value={formData.finishing}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Select Finishing</option>
         {finishingData.map(finishing => (
          
  <option  value={finishing}>
    {finishing}
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

export default Edit;
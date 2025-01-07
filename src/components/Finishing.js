import React, { useState, useEffect} from 'react';
import { Container,Button, Row,Modal, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import '../css/DataTable.css';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
const API_URL = 'https://www.wynstarcreations.com/seyal/api/getMasters?type=finishing';
const API_URL1 = 'https://www.wynstarcreations.com/seyal/api/addMaster';

DataTable.use(DT);
function Finishing() {

    const [formData, setFormData] = useState({
        mname: '',type:'finishing'
      });

      const regexPatterns = {
        mname: /^[a-zA-Z_+ ]*$/,          // Only numbers for input1
      };

    const [tableData, setTableData] = useState([ ]);
    const [show, setShow] = useState(false);
    const [fetch, setFetch] = useState(false);
    const { user , isAuthenticated } = useAuth();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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
        formData.type="finishing";
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
        <h1>Finishing Master</h1>
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
                responsive: true,
                select: true,
                iDisplayLength:25,
            }} className="display table sortable">
            <thead>
                <tr>
                    <th>S.No</th>
                    <th>Finishing</th> 
                    <th>Created_at</th>                   
                </tr>
            </thead>
        </DataTable>
        <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Finishing</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" >
              <Form.Label>Finishing</Form.Label>
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


export default Finishing;
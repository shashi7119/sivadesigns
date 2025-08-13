import React, { useState, useEffect,useRef} from 'react';
import { Container,Button, Row,Modal, Form,Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import '../css/DataTable.css';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import FixedHeader from 'datatables.net-fixedcolumns-dt';

import DT from 'datatables.net-dt';
const API_URL = 'https://www.wynstarcreations.com/seyal/api/getMasters?type=store';
const API_URL1 = 'https://www.wynstarcreations.com/seyal/api/addStock';
const API_URL2 = 'https://www.wynstarcreations.com/seyal/api/updateStock';

DataTable.use(DT);DataTable.use(FixedHeader);
function Storeentry() {

  const table = useRef();
    const [formData, setFormData] = useState({
        mname: '',unit:'',price:''
      });

      const [formData1, setFormData1] = useState({
        mname: '',unit:'',price:'',ide:''
      });

      const regexPatterns = {
        mname: /^[a-zA-Z0-9_@./#&+\-, ]*$/,price: /^[0-9.]*$/,unit: /^[a-zA-Z ]*$/
      };

    const [tableData, setTableData] = useState([ ]);
    const [show, setShow] = useState(false);
    const [show1, setShow1] = useState(false);
    const [fetch, setFetch] = useState(false);
     const [unitData] = useState([ 'KG','ML','LITRE','BOX','GRAM','METER','PIECE','BOTTLE','CUP','PACKET','ROLL','SET','BAG','TONNE']);
    const { user , isAuthenticated } = useAuth();
  const handleClose = () => {
    setShow(false);
    setFormData('');
  }

  const handleClose1 = () => {
    setShow1(false);
    setFormData1('');
  }
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

      const rowClick = (e) => {
    
        e.preventDefault();
        let api = table.current.dt();
    let rows = api.rows({ selected: true }).data().toArray();
    let dataArr = [];
    rows.map(value => (
      dataArr.push(value)
    )); 

    if(dataArr.length === 0) {
      alert('Select material for update');
    }else if(dataArr.length > 1) {
      alert('Not allowed multiple material for edit');
    } else {

       formData1.ide = dataArr[0][0];
      formData1.mname = dataArr[0][1];
      formData1.price = dataArr[0][2];
      formData1.unit = dataArr[0][3];

       setFormData1(formData1);
        setShow1(true);
    }
         
      }

      const handleSubmit1 = async (event) => {
        event.preventDefault();   
        console.log('Form Submitted with Data:', formData1);
        
            axios.post(`${API_URL2}`, formData1)
      .then(function (response) {

        setShow1(false);
        setFormData1('');
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
    <div className="main-content" >   
            <Container fluid className="relative">
               <Row className="mb-6">
                                            <div className="col-10 col-sm-10">
                                              <h1 className="text-2xl font-bold text-gray-800">Store Entry</h1>
                                              <p className="text-gray-600">Welcome, {user.email}!</p>
                                            </div>
                                          </Row>
                    
        <Row>
                   <div className="flex justify-end mb-4">
          <div className="col-2 col-sm-2">
          <Dropdown>
      <Dropdown.Toggle 
                            variant="primary" 
                            id="dropdown-basic" 
                            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                          >
              Actions
            </Dropdown.Toggle>

      <Dropdown.Menu>
         <Dropdown.Item href="#" onClick={handleShow}>Add</Dropdown.Item>   
       
      </Dropdown.Menu>
    </Dropdown>
           
            </div></div>
       </Row>
    <DataTable onSelect={rowClick} data={tableData} ref={table} options={{
                responsive: true,
                select: true,
                iDisplayLength:25,
                fixedHeader: true,                              
    
            }} className="display table sortable">
            <thead>
                <tr>
                    <th>S.No</th>
                    <th>Chemical</th> 
                    <th>Price</th> 
                    <th>Unit</th>
                    <th>Actions</th>                                                     
                </tr>
            </thead>
        </DataTable>
        <Modal size="lg" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Material</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form><Row>
            <Form.Group className="col-6 col-sm-6" >
              <Form.Control
              type="text"
              placeholder='Enter Material Name'
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
             <Form.Group className="col-3 col-sm-3" >
              <Form.Control
              type="text"
              placeholder='Price'
              name="price"              
              value={formData.price}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            />
            </Form.Group>          
            <Form.Group className="col-3 col-sm-3" >
             <Form.Select             
                            name="unit"              
                            value={formData.unit}
                            onChange={(e) =>  setFormData((prevData) => ({
                              ...prevData,
                              [e.target.name]: e.target.value // Update the value of the specific input field
                            }))}    
                           required
                          >
                            <option  value="">Unit</option>
                       {unitData.map(unittype => (
                        
                <option  value={unittype}>
                  {unittype}
                </option>
              ))}
                         </Form.Select> 
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

      <Modal size="lg" show={show1} onHide={handleClose1}>
        <Modal.Header >
          <Modal.Title>Edit Material</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form><Row>
            <Form.Group className="col-6 col-sm-6" >
              <Form.Control
              type="text"
              placeholder='Enter Stock Value'
              name="mname"              
              value={formData1.mname}
              disabled                       
             required
            />
            </Form.Group>             
            <Form.Group className="col-3 col-sm-3" >
              <Form.Control
              type="text"
              placeholder='Price'
              name="price"              
              value={formData1.price}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData1((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            />
            </Form.Group>
            <Form.Group className="col-3 col-sm-3" >

               <Form.Select             
                            name="unit"              
                            value={formData1.unit}
                            onChange={(e) =>  setFormData1((prevData) => ({
                              ...prevData,
                              [e.target.name]: e.target.value // Update the value of the specific input field
                            }))}    
                           required
                          >
                            <option  value="">Unit</option>
                       {unitData.map(unittype => (
                        
                <option  value={unittype}>
                  {unittype}
                </option>
              ))}
                         </Form.Select> 
            </Form.Group>
         </Row>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose1}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit1}>
            Save 
          </Button>
        </Modal.Footer>
      </Modal>
        </Container>
        </div>
  );
}


export default Storeentry;
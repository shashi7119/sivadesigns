import React, { useState, useEffect,useRef} from 'react';
import { Container,Button, Row,Modal, Form,Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import '../css/DataTable.css';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
const API_URL = 'https://www.wynstarcreations.com/seyal/api/getMasters?type=vendor';
const API_URL1 = 'https://www.wynstarcreations.com/seyal/api/addMaster';

DataTable.use(DT);
function Vendor() {
const table = useRef();
    const [formData, setFormData] = useState({
        mname: '',type:'customer',email:'',contact_number:'',ide:''
        ,address1:'',address2:'',pincode:'',gstin:'',state:''
      });

      const regexPatterns = {
        mname: /^[a-zA-Z0-9_@./#&+\-, ]*$/,state: /^[a-zA-Z0-9_@./#&+\-, ]*$/,email: /^[a-zA-Z0-9_@./#&+\-, ]*$/,
        address1: /^[a-zA-Z0-9_@./#&+\-, ]*$/,contact_number: /^[0-9 ]*$/,
        address2: /^[a-zA-Z0-9_@./#&+\-, ]*$/,pincode: /^[0-9 ]*$/,
        gstin: /^[a-zA-Z0-9]*$/
      };

    const [isEdit, setIsEdit] = useState(false);
    const [tableData, setTableData] = useState([ ]);
    const [show, setShow] = useState(false);
    const [fetch, setFetch] = useState(false);

  const handleClose = () => { setIsEdit(false);setShow(false); }
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
        formData.type="vendor";
        if(!isEdit) {
            axios.post(`${API_URL1}`, formData)
      .then(function (response) {

        setShow(false);
        setFormData('');
        if(fetch){ setFetch(false);}else {setFetch(true);}
        
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  } else {
       axios.post(`https://www.wynstarcreations.com/seyal/api/updateVendor`, formData)
        .then(function (response) {        
          setShow(false);
        setFormData('');
        if(fetch){ setFetch(false);}else {setFetch(true);}
        
        })
        .catch(function (error) {
          console.log(error);
        });    
  }
        //const userData = response.data;
       // console.log('Data From Backend:', userData);
    
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
          
           setFormData({  mname: dataArr[0][1],ide:dataArr[0][0],type:'customer',email:dataArr[0][3],contact_number:dataArr[0][2]
        ,address1:dataArr[0][4],address2:dataArr[0][5],state:dataArr[0][6],pincode:dataArr[0][7],gstin:dataArr[0][8]});   
             
          setShow(true);
        }
      };
     

  return (
    <div className="main-content" >
      <Container fluid className="relative">
        <Row className="mb-6">
          <div className="col-10 col-sm-10">
            <h1 className="text-2xl font-bold text-gray-800">Vendor Master</h1>
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
                <Dropdown.Item href="#" onClick={handleShow}>Add</Dropdown.Item>   
                <Dropdown.Item href="#" onClick={edithandle}>Edit</Dropdown.Item>    
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 relative bg-white">
          <DataTable 
            ref={table} 
            data={tableData} 
            options={{
              scrollX: true,
              scrollY: '60vh',
              scrollCollapse: true,
              fixedColumns: {
                left: 2,
                rightClip: true
              },
              order: [[0, 'desc']],
              responsive: false, // Disable responsive to force horizontal scroll
              select: true,
              paging: true,
              pageLength: 25,
              lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
              dom: '<"flex items-center justify-between mb-4"l<"ml-2"f>>rtip',
              language: {
                paginate: {
                  first: "First",
                  last: "Last", 
                  next: "Next",
                  previous: "Previous"
                },
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                infoEmpty: "Showing 0 to 0 of 0 entries",
                infoFiltered: "(filtered from _MAX_ total entries)"
              }
            }} 
            className="display nowrap w-full text-sm text-left text-gray-500"
          >
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">S.No</th>
                <th className="px-6 py-3">Vendor</th> 
                <th className="px-6 py-3">Contact Number</th> 
                <th className="px-6 py-3">Email</th> 
                <th className="px-6 py-3">Address 1</th> 
                <th className="px-6 py-3">Address 2</th> 
                <th className="px-6 py-3">State</th>
                <th className="px-6 py-3">Pincode</th> 
                <th className="px-6 py-3">GSTIN</th>                   
              </tr>
            </thead>
          </DataTable>
        </div>

        <Modal size="lg" show={show} onHide={handleClose} className="rounded-lg">
          <Modal.Header closeButton className="bg-gray-50 border-b border-gray-200">
            <Modal.Title className="text-xl font-semibold text-gray-800">
              {isEdit ? "Edit Vendor" : "Add Vendor"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-6">
            <Form className="space-y-4">
              <Row className="flex items-center space-x-4">
                <Form.Group className="col-6 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    Vendor Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="mname"              
                    value={formData.mname}
                    onKeyUp={handleKeyUp}
                    onChange={(e) => setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value
                    }))}    
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </Form.Group>
                <Form.Group className="col-5 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="contact_number"              
                    value={formData.contact_number}
                    onKeyUp={handleKeyUp}
                    onChange={(e) => setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"    
                    required
                  />
                </Form.Group>
              </Row>
              <Row className="flex items-center space-x-4">
                <Form.Group className="col-6 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    Email
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="email"              
                    value={formData.email}
                    onKeyUp={handleKeyUp}
                    onChange={(e) => setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value
                    }))}    
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </Form.Group>
                <Form.Group className="col-5 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    Address 1
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="address1"              
                    value={formData.address1}
                    onKeyUp={handleKeyUp}
                    onChange={(e) => setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value
                    }))}    
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </Form.Group>
              </Row>
              <Row className="flex items-center space-x-4">
                <Form.Group className="col-6 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    Address 2
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="address2"              
                    value={formData.address2}
                    onKeyUp={handleKeyUp}
                    onChange={(e) => setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value
                    }))}    
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </Form.Group>
                <Form.Group className="col-5 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    State
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="state"              
                    value={formData.state}
                    onKeyUp={handleKeyUp}
                    onChange={(e) => setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value
                    }))}    
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </Form.Group>
              </Row>
              <Row className="flex items-center space-x-4">
                <Form.Group className="col-6 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    Pincode
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="pincode"              
                    value={formData.pincode}
                    onKeyUp={handleKeyUp}
                    onChange={(e) => setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value
                    }))}    
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </Form.Group>
                <Form.Group className="col-5 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    GSTIN
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="gstin"              
                    value={formData.gstin}
                    onKeyUp={handleKeyUp}
                    onChange={(e) => setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value
                    }))}    
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </Form.Group>
              </Row>
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

export default Vendor;
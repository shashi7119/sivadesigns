import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Row, Modal, Form, Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import '../css/DataTable.css';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
const API_URL = 'https://www.wynstarcreations.com/seyal/api/getMasters?type=width';
const API_URL1 = 'https://www.wynstarcreations.com/seyal/api/addMaster';

DataTable.use(DT);
function Width() {
  const table = useRef();

  const [formData, setFormData] = useState({
    mname: '',type:'width'
  });

  const regexPatterns = {
    mname: /^[0-9"]*$/,          // Only numbers for input1
  };

  const [tableData, setTableData] = useState([ ]);
  const [show, setShow] = useState(false);
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
  }, [formData,user]);
     
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
    formData.type="width";
    axios.post(`${API_URL1}`, formData)
    .then(function (response) {
      setShow(false);
      setFormData('');
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
            <h1 className="text-2xl font-bold text-gray-800">Width Master</h1>
            <p className="text-gray-600">Welcome, {user.user}!</p>
          </div>
        </Row>

        <div className="flex justify-end mb-4">
          <div className="col-2 col-sm-2">
            <Dropdown className="">
              <Dropdown.Toggle 
                variant="primary" 
                id="dropdown-basic" 
                className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Actions
              </Dropdown.Toggle>

              <Dropdown.Menu className="mt-2">
                <Dropdown.Item href="#" onClick={handleShow}>Add</Dropdown.Item>   
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
              responsive: false,
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
                <th className="px-6 py-3">Width</th>
                <th className="px-6 py-3">Created_at</th>
              </tr>
            </thead>
          </DataTable>
        </div>

        <Modal size="lg" show={show} onHide={handleClose} className="rounded-lg">
          <Modal.Header closeButton className="bg-gray-50 border-b border-gray-200">
            <Modal.Title className="text-xl font-semibold text-gray-800">
              Add Width
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-6">
            <Form className="space-y-4">
              <Form.Group className="mb-3">
                <Form.Label className="block text-sm font-medium text-gray-700">
                  Width
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

export default Width;
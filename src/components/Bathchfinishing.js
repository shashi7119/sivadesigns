import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Row, Modal, Form, Dropdown } from 'react-bootstrap';
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
      final_weight: '',final_gmeter: '',finishing: '',final_width: '',partial:''
      ,pide:'',pining:'',noofpcs:'',  partial_weight: '',  partial_gmeter: '' ,  loss: '' 
      ,  shrinkage: '' 
    });  
    const [fetch, setFetch] = useState(false);
     const [show, setShow] = useState(false);
    const handleClose = () => {
  // Reset switch and related fields
  setFormData(prevData => ({
    ...prevData,
    partial: false,
    partial_weight: '',
    partial_gmeter: ''
  }));
  setShow(false);
};
    const handleShow = (e) => { 
      setShow(true);    
    }
     const [isSaving, setIsSaving] = useState(false);
    const [pintypeData] = useState([ '95','96','97','98','99','100','101','102','103','104','105']);
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
         setShow(false);
          setIsSaving(false);
      } catch (error) {
        console.log(error);
      } 
    };
    user && fetchData();
  }, [user,fetch]);

    // Reload DataTable when tab becomes active (user returns after idle)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setFetch(f => !f); // Toggle fetch to reload data
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

      
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
          <h1>Finishing</h1>
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

      const match1 = dataArr[0][0].match(/data-weight="([^"]*)"/);
      const value1 = match1 ? match1[1] : null;

      const match2 = dataArr[0][0].match(/data-meter="([^"]*)"/);
      const value2 = match2 ? match2[1] : null;
      
      formData.bid = dataArr[0][0];
      formData.batch_weight = dataArr[0][10];
      formData.batch_gmeter = dataArr[0][11];
      formData.finishing    = dataArr[0][15];
      formData.pide    = value;
      formData.final_weight = "";
      formData.final_gmeter = "";
      formData.partial_weight = value1;
      formData.partial_gmeter = value2;
      setFormData(formData);
          handleShow();           
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
      setIsSaving(true); 
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

   
  formData.bid = '';
      formData.batch_weight = '';
      formData.batch_gmeter = '';
      formData.finishing    = '';
      formData.pide    = '';
      formData.final_weight = "";
      formData.final_gmeter = "";
      formData.partial = false;
      setFormData(formData);      
     if(fetch){setFetch(false);} else {setFetch(true);}
    alert("DC Created!!");   
  })
  .catch(function (error) {
    console.log(error);
  });
    //const userData = response.data;
    console.log('Data From Backend:', formData);

  };

  const checkStock = (event) => {
    const { name, value } = event.target;
    let stock = 0;    let totweight = 0;  let diff=0;
    if(name ==="final_weight"){
      stock = formData.batch_weight;
      totweight = parseFloat(value ) + parseFloat(formData.partial_weight ); 
      diff= parseFloat(formData.batch_weight) - parseFloat(totweight);
      formData.loss = diff > 0 ? ((diff / parseFloat(formData.batch_weight)) * 100).toFixed(2) : '0';
      
     // setFormData(formData);
    }else if(name ==="final_gmeter"){
      stock = formData.batch_gmeter;  
      totweight = parseFloat(value ) + parseFloat(formData.partial_gmeter ); 
      diff= parseFloat(formData.batch_gmeter) - parseFloat(totweight);
      formData.shrinkage = diff > 0 ? ((diff / parseFloat(formData.batch_gmeter)) * 100).toFixed(2) : '0';      
      //setFormData(formData);
    }
   
    if((parseFloat(stock) < parseFloat(value)) && (formData.finishing !== "Hydro+stenter")){
      alert("Final value should be lesser than stock value");
      event.target.value=0;
    }
  }
  
  const handleCheckboxChange = (event) => {
    const target = event.target;
    const checked = target.checked;
    setFormData(prevData => ({
    ...prevData,
    partial: checked,
    partial_weight: formData.partial_weight, // Reset values when toggling
    partial_gmeter: formData.partial_gmeter  // Reset values when toggling
  }));
  }
  
    const deleteHandle =  (event) => {

    event.preventDefault();
    if (window.confirm("Delete this item?")) {
    let api = table.current.dt();
    let rows = api.rows({ selected: true }).data().toArray();
    let dataArr = [];let dataArr1 = [];
    rows.map(value => (
      dataArr.push(value)
    ));    
    
    const match = dataArr[0][0].match(/data-pide="([^"]*)"/);
      const value = match ? match[1] : null;
      dataArr1.push(value);
    axios.post(`${API_URL}/deleteFinishing`, dataArr1)
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
  
  return (
    <div className="main-content" >
      <Container fluid className="relative">
        <Row className="mb-6">
          <div className="col-10 col-sm-10">
            <h1 className="text-2xl font-bold text-gray-800">Batch Finishing</h1>
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
                <Dropdown.Item href="#" onClick={PrintHandle}>Print</Dropdown.Item>
                {user && ((user.role==="admin") || (user.role==="SP1")|| (user.role==="PA" )) && 
                  <Dropdown.Item href="#" onClick={completeHandle}>Complete</Dropdown.Item>}
                {user && (user.role==="admin") && 
                  <Dropdown.Item href="#" onClick={deleteHandle}>Delete</Dropdown.Item>}
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
                leftColumns: {
                  className: 'dtfc-fixed-left'
                }
              },
              pageLength: 25,
              lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
              order: [[0, 'desc']],
              paging: true,
              select: { style: 'multi' },
              dom: '<"flex items-center justify-between mb-4"l<"ml-2"f>>rtip',
              language: {
                search: "Search:",
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                paginate: {
                  first: "First",
                  last: "Last",
                  next: "Next",
                  previous: "Previous"
                }
              },
              className: "w-full text-sm text-left text-gray-500",
              containerClassName: "relative z-10"
            }}
          >
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Batch.No</th>
                <th className="px-6 py-3">Batch Date</th>
                <th className="px-6 py-3">Inward.No</th>
                <th className="px-6 py-3">Cust.Dc</th>
                <th className="px-6 py-3">Machine</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Fabric</th>
                <th className="px-6 py-3">Shade</th>
                <th className="px-6 py-3">Construction</th>
                <th className="px-6 py-3">Width</th>
                <th className="px-6 py-3">Weight</th>
                <th className="px-6 py-3">GMeter</th>                   
                <th className="px-6 py-3">GLM</th>
                <th className="px-6 py-3">AGLM</th>
                <th className="px-6 py-3">Process</th>
                <th className="px-6 py-3">Finishing</th>
              </tr>
            </thead>
          </DataTable>
        </div>

        <Modal size="xl" show={show} onHide={handleClose} className="rounded-lg">
          <Modal.Header closeButton className="bg-gray-50 border-b border-gray-200">
            <Modal.Title className="text-xl font-semibold text-gray-800">
              Complete Finishing
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-6">
            <Form className="space-y-4">
              <Row className="flex items-center space-x-4">
                <Form.Group className="col-5 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    Batch Weight
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="batch_weight"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.batch_weight}
                    disabled
                  />
                </Form.Group>
                <Form.Group className="col-5 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    Batch Meter
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="batch_gmeter"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.batch_gmeter}
                    disabled
                  />
                </Form.Group>
              </Row>
              {!formData.partial && (
  <Row>
    <Form.Group className="col-5 mb-3">
      <Form.Label className="block text-sm font-medium text-gray-700">
        Partial Weight
      </Form.Label>
      <Form.Control
        type="text"
        name="partial_weight"
        value={formData.partial_weight}
       disabled
      />
    </Form.Group>

    <Form.Group className="col-5 mb-3">
      <Form.Label className="block text-sm font-medium text-gray-700">
        Partial Meter
      </Form.Label>
      <Form.Control
        type="text"
        name="partial_gmeter"
        value={formData.partial_gmeter}
        disabled
      />
    </Form.Group>
  </Row>
  
)}
              <Row className="flex items-center space-x-4">
                <Form.Group className="col-5 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    Final Weight
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="final_weight"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.final_weight}
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
                <Form.Group className="col-5 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    Final Meter
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="final_gmeter"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              <Row className="flex items-center space-x-4">
                <Form.Group className="col-5 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    Final Width
                  </Form.Label>
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
                <Form.Group className="col-5 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    No of pcs
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="noofpcs"             
                    value={formData.noofpcs}             
                    onChange={(e) =>  {setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value // Update the value of the specific input field
                    }));
                    
                  }
                  }  
                      
                  />
                </Form.Group>
              </Row>
              <Row className="flex items-center space-x-4">
                <Form.Group className="col-5 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    Pining
                  </Form.Label>
                   <Form.Select             
                    name="pining"              
                    value={formData.pining}
                    onChange={(e) =>  setFormData((prevData) => ({
                      ...prevData,
                      [e.target.name]: e.target.value // Update the value of the specific input field
                    }))}    
                   required
                  >
                    <option  value="">Select</option>
               {pintypeData.map(pining => (
                
      <option  value={pining}>
        {pining}
      </option>
    ))}
               </Form.Select>       
                </Form.Group>
                <Form.Group className="col-5 mb-3">
                  <Form.Label className="block text-sm font-medium text-gray-700">
                    Partial Delivery
                  </Form.Label>
                  <Form.Check
                    type="switch"
                    name="partial"             
                    value={formData.partial}             
                     onClick={handleCheckboxChange} 
                  />       
                </Form.Group>
              </Row>
              



{!formData.partial && (
  <Row>
    <Form.Group className="col-5 mb-3">
      <Form.Label className="block text-sm font-medium text-gray-700">
        Loss (%)
      </Form.Label>
      <Form.Control
        type="text"
        name="loss"
        value={formData.loss}
       disabled
      />
    </Form.Group>

    <Form.Group className="col-5 mb-3">
      <Form.Label className="block text-sm font-medium text-gray-700">
        Shrinkage (%)
      </Form.Label>
      <Form.Control
        type="text"
        name="shrinkage"
        value={formData.shrinkage}
        disabled
      />
    </Form.Group>
  </Row>
  
)}
            </Form>
          </Modal.Body>
          <Modal.Footer className="bg-gray-50 border-t border-gray-200">
            <Button 
              variant="secondary" 
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </Button>
            <Button 
              disabled={isSaving} 
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



export default Batchfinishing;
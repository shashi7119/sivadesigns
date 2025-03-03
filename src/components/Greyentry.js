import React, { useState, useEffect,useRef} from 'react';
import { Container,Button, Row,Modal, Form,Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import '../css/DataTable.css';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'react-datepicker/dist/react-datepicker.css'
const API_URL = 'https://www.wynstarcreations.com/seyal/api/';


DataTable.use(DT);
function Greyentry() {
  const table = useRef();
    const [formData, setFormData] = useState({
        ide:"",customer:"",fabric: '',construction:'',width:'',
        weight:'',gmeter:'',customerdc:'',remarks:'',noofpcs:'',ftype:'',ptype:''
      });

      const [isEdit, setIsEdit] = useState(false);
      const [fetch, setFetch] = useState(false);
      const [customerData, setCusotmerData] = useState([ ]);
      const [widthData, setWidthData] = useState([ ]);
      const [fabricData, setFabricData] = useState([ ]);
      const [constructionData, setConstructionData] = useState([ ]);
      const [ftypeData] = useState([ 'ORGANIC','NON ORGANIC','OCS','GRS','REGENAGRI']);
      const [ptypeData] = useState([ 'REWORK','FRESH']);
      
      const regexPatterns = {
        weight: /^[0-9."]*$/,gmeter: /^[0-9."]*$/  
        ,customerdc: /^[A-Za-z0-9_@./#&+\-, "]*$/ ,remarks: /^[A-Za-z0-9_@./#&+\-, "]*$/,
        noofpcs: /^[0-9."]*$/ 
         };

         const { user , isAuthenticated } = useAuth();
       // Fetch data from backend API
       useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await axios.get(`${API_URL}/getAllMasters`);        
            setCusotmerData(response.data['customer']);
            setWidthData(response.data['width']);    
            setFabricData(response.data['fabric']);
            setConstructionData(response.data['construction']);
            
          } catch (error) {
            console.log(error);
          } 
        };
        
        user && fetchData();
      }, [user]);

    const [tableData, setTableData] = useState([ ]);
    const [show, setShow] = useState(false);


  const handleClose = (e) =>  {
    setFormData("");
    setShow(false);}
  const handleShow = (e) => { 
    setIsEdit(false);
    setShow(true);    
  }
  

     // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {        
        const response = await axios.get(`${API_URL}/inventry`);
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
        if(!isEdit) {               
        axios.post(`${API_URL}/addInventry`, formData)
      .then(function (response) {        
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    } else {
        console.log(formData);    
        axios.post(`${API_URL}/updateInventry`, formData)
        .then(function (response) {        
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });    
    }
    
    setShow(false);
    setFormData('');
    if(fetch){setFetch(false);} else {setFetch(true);}
    
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
          const [eweight] = dataArr[0][7].split("/");
          const [egmeter] = dataArr[0][8].split("/");
          
           setFormData({ customer:dataArr[0][3],ide:dataArr[0][0],
            fabric:dataArr[0][4],construction:dataArr[0][5],
            weight: eweight,width:dataArr[0][6],
            gmeter: egmeter, customerdc: dataArr[0][2], remarks: dataArr[0][9]
            , noofpcs: dataArr[0][10], ftype: dataArr[0][11], ptype: dataArr[0][12] });   
             
          setShow(true);
        }
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
          if(dataArr.length === 0) {
            alert('Select entry for delete');
          } else {
            
          axios.post(`${API_URL}/deleteInventory`, dataArr)
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
    }
  return (
    <div className="data-wrapper">
   
        <Container>
        <Row>
          <div class="col-10 col-sm-10">
          <h1>Grey Fabric Entry</h1>
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
         {user && user.role==="admin" && <Dropdown.Item href="#" onClick={deleteHandle}>Delete</Dropdown.Item>}
      </Dropdown.Menu>
    </Dropdown>
           
            </div>
       </Row>
    <DataTable ref={table} data={tableData} options={{
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
            }} className="display table sortable">
            <thead>
                <tr>    
                    <th>Entry No</th>           
                    <th>Date</th>
                    <th>Party Dc No</th>
                    <th>Customer</th>
                    <th>Fabric</th>
                    <th>Construction</th>
                    <th>Width</th>
                    <th>Weight</th>
                    <th>GMeter</th> 
                    <th>Remarks</th>     
                    <th>No Of Pcs</th>  
                    <th>Fabric Type</th>  
                    <th>Process</th>    
                                  
                </tr>
            </thead>
        </DataTable>
        <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? "Edit Grey Fabric" : "Add Grey Fabric"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>          
          <Form.Group className="col-12 col-sm-12 mb-3" controlId="formBasicCustomer">
            
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
           <Form.Group className="col-12 col-sm-12 mb-3" controlId="formBasicFabric">
           
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
          <Row>
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicConstruction">
            
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
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicWidth">
           
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
          </Row>
          <Row>
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicWeight">
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
         
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicGmeter">
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
          </Row>
          <Row>
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicDC">
            <Form.Label>Customer DC No </Form.Label>
            <Form.Control
              type="text"
              name="customerdc"
             
              value={formData.customerdc}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))} 
              required 
            />       
          </Form.Group>
         <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicRemarks">
            <Form.Label>Remarks </Form.Label>
            <Form.Control
              type="text"
              name="remarks"
             
              value={formData.remarks}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}  
                
            />       
          </Form.Group>
          </Row>          
          <Row>
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formProcess">
         <Form.Select             
              name="ptype"              
              value={formData.ptype}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Process</option>
         {ptypeData.map(ptype => (
          
  <option  value={ptype}>
    {ptype}
  </option>
))}
           </Form.Select> 
          </Form.Group>
         <Form.Group className="col-6 col-sm-6 mb-3" controlId="formFabricType">
         <Form.Select             
              name="ftype"              
              value={formData.ftype}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Fabric Type</option>
         {ftypeData.map(fabric => (
          
  <option  value={fabric}>
    {fabric}
  </option>
))}
           </Form.Select> 
          </Form.Group>
          </Row>
          <Row>         
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formNoOfPcs">
            <Form.Label>No of pcs </Form.Label>
            <Form.Control
              type="text"
              name="noofpcs"             
              value={formData.noofpcs}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))} 
              required 
            />       
          </Form.Group>
          </Row>
          <Row>
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicaglm">
                               <Button variant="secondary" onClick={handleClose}>Close</Button>
                                         </Form.Group>
                                         <Form.Group style={{textAlign:"right"}} className="col-6 col-sm-6 mb-3" controlId="formBasicaglm">
                                           <Button variant="primary" type="submit" >
                                           Save
                                           </Button>
                                           </Form.Group>
                                     
                                        
          </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          
        </Modal.Footer>
      </Modal>
      </Container>
        </div>
        
  );
}


export default Greyentry;
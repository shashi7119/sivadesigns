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
function Pstock() {
  const table = useRef();
  const [machineData, setMachineData] = useState([]);
  const [processData, setProcessData] = useState([ ]);
  const [finishingData, setFinishingData] = useState([ ]);
  const [formData, setFormData] = useState({
        ide:"",date:'',customer:"",fabric: '',construction:'',width:'',
        weight:'',gmeter:'', glm: '',aglm: '',customerdc:'',remarks:'',machine:'',process:'',finishing:'',shade:''
      });
     
      const [fetch, setFetch] = useState(false);
      const [customerData, setCusotmerData] = useState([ ]);
      const [widthData, setWidthData] = useState([ ]);
      const [fabricData, setFabricData] = useState([ ]);
      const [constructionData, setConstructionData] = useState([ ]);
      let [selData, setselData] = useState([ ]);

      const regexPatterns = {
        weight: /^[0-9."]*$/,gmeter: /^[0-9."]*$/  
        ,customerdc: /^[A-Za-z0-9_@./#&+\-, "]*$/ ,
        remarks: /^[A-Za-z0-9_@./#&+\-, "]*$/,
        shade: /^[A-Za-z0-9_@./#&+\-, ]*$/,
        machine: /^[0-9]*$/,process: /^[a-zA-Z0-9_+ ]*$/,
        finishing: /^[a-zA-Z0-9_+ ]*$/,glm: /^[0-9. ]*$/
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
            setMachineData(response.data['machine']);
            setProcessData(response.data['process']);
            setFinishingData(response.data['finishing']);
            
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
 
     // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {        
        const response = await axios.get(`${API_URL}/pinventry`);
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
        if((name === "gmeter")&&(formData.weight !==0)&&(formData.weight !=="")){
          formData.aglm = parseFloat(formData.weight/value).toFixed(2);
       }
  
       if(name === "weight" && formData.gmeter !==0 && formData.gmeter !==""){
        formData.aglm = parseFloat(value/formData.gmeter).toFixed(2);
      }
    
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
        axios.post(`${API_URL}/planning`, formData)
      .then(function (response) {        
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
     
    setShow(false);
    setFormData('');
    if(fetch){setFetch(false);} else {setFetch(true);}
    
      };
     
      const edithandle =  (event) => {       
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
          let caglm = parseFloat(dataArr[0][7]/dataArr[0][8]).toFixed(2);
           setFormData({ customer:dataArr[0][3],ide:dataArr[0][0],
            fabric:dataArr[0][4],construction:dataArr[0][5],aglm:caglm,
            weight: dataArr[0][7],width:dataArr[0][6],date:'',glm:'',
            gmeter: dataArr[0][8], customerdc: dataArr[0][2], remarks: dataArr[0][9] });   
             
          setShow(true);
        }
      };

      const rowClick = (e) => {
    
        e.preventDefault();
        let api = table.current.dt();
        let rows = api.rows({ selected: true }).data().toArray();
        rows.map(value => (
          selData.push(value)         
        ));  
        selData = [...new Set(selData)];  
        setselData(selData);  
      }

      const PrintHandle =  (event) => {
        event.preventDefault();  
        let api = table.current.dt();
        api.rows().deselect();
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
            <h1>Planning Stock</h1>
            <table>
              <thead>
                <tr>
                  <th>Entry.No</th>
                        <th>Party DC No</th>
                        <th>Machine</th>
                        <th>Customer</th>
                        <th>Fabric</th>                       
                        <th>Construction</th>
                        <th>Width</th>
                        <th>Weight</th>
                        <th>GMeter</th>                   
                        <th>Remarks</th>
                                        </tr>
              </thead>
              <tbody>
                ${selData
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
        selData.length=0;       
      };
     
  return (
    <div className="data-wrapper">
   
        <Container>
        <Row>
          <div class="col-10 col-sm-10">
          <h1>Planning Stock Entry</h1>
          <p>Welcome, {user.email}!</p>
          </div>
          <div class="col-2 col-sm-2">
          <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        Actions
      </Dropdown.Toggle>

      <Dropdown.Menu>         
         <Dropdown.Item href="#" onClick={edithandle}>Create Plan</Dropdown.Item>   
          <Dropdown.Item href="#" onClick={PrintHandle}>Print</Dropdown.Item>           
      </Dropdown.Menu>
    </Dropdown>
           
            </div>
       </Row>
    <DataTable onSelect={rowClick} ref={table} data={tableData} options={{
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
                                  
                </tr>
            </thead>
        </DataTable>
        <Modal show={show} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{"Create Plan"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>  
            <Row>        
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicCustomer">
            
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
           <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicFabric">
           
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
          </Row>
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
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formMachine">
           
            <Form.Select             
              name="machine"              
              value={formData.machine}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Select Machine *</option>
         {machineData.map(machine => (
          
  <option  value={machine}>
    {machine}
  </option>
))}
           </Form.Select>       
          </Form.Group>
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formProcess">
           
            <Form.Select             
              name="process"              
              value={formData.process}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Select Process *</option>
         {processData.map(process => (
          
  <option  value={process}>
    {process}
  </option>
))}
           </Form.Select>       
          </Form.Group>
          </Row>
          <Row>
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formFinishing">
           
            <Form.Select             
              name="finishing"              
              value={formData.finishing}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            >
              <option  value="">Select Finishing *</option>
         {finishingData.map(finishing => (
          
  <option  value={finishing}>
    {finishing}
  </option>
))}
           </Form.Select>       
          </Form.Group>
          <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicShade">
                      <Form.Control
                        type="text"
                        name="shade"
                        placeholder='Shade*'
                        value={formData.shade}
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
                      <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicFabric">
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
                                <Form.Group className="col-6 col-sm-6 mb-3" controlId="formBasicaglm">
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


export default Pstock;
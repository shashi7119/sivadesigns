import React, { useState, useEffect,useRef} from 'react';
import { Container,Button, Row,Modal, Form,Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import '../css/Styles.css';
import '../css/DataTable.css';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import FixedHeader from 'datatables.net-fixedcolumns-dt';
import RowGroup from 'datatables.net-rowgroup-dt';

import DT from 'datatables.net-dt';
const API_URL = 'https://www.wynstarcreations.com/seyal/api';
const API_URL1 = 'https://www.wynstarcreations.com/seyal/api/addProcessRoute';
const API_URL2 = 'https://www.wynstarcreations.com/seyal/api/editProcessRoute';

DataTable.use(DT);DataTable.use(FixedHeader);DataTable.use(RowGroup);
function Processroute() {

    const table = useRef();
    let { pid } = useParams();
    const [formData, setFormData] = useState({
        ide:'',mname: ''
      });

      const regexPatterns = {
        mname: /^[a-zA-Z0-9_@./#&+\-, ]*$/,callno: /^[0-9]*$/,quantity: /^[0-9.]*$/, unit: /^[a-zA-Z/%.]*$/, time: /^[0-9.]*$/,temp: /^[0-9.]*$/,
      };

    const [tableData, setTableData] = useState([ ]);
    const [show, setShow] = useState(false);
    const [eshow, setEditShow] = useState(false);
   const [fetch, setFetch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([{ process:'',id: 1,callno: 1, value: "",material:'',quantity: "", suggestions: [],materials: [],unit:"",temp:"",time:"",pid:"" }]);
  const { user , isAuthenticated } = useAuth();
  const handleClose = () => {
    setShow(false);
   // setFormData('');
    setRows([]);
  }
  const handleShow = () => {
    console.log('Form Submitted with Data:', formData);
    setShow(true);
   }

     // Fetch data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/getMasters?type=processroute&ide=${pid}`);
        setTableData(response.data['processroute']);
        setFormData(response.data['process']);
      } catch (error) {
        console.log(error);
      } 
    };
    user && fetchData();
  }, [fetch,pid,user]);

     
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
        rows.map((row) => (          
          row.process= formData.mname
        ))

        rows.map((row) => (          
            row.pid= formData.ide
          ))
        console.log('Form Submitted with Data:', rows);
        
            axios.post(`${API_URL1}`, rows)
      .then(function (response) {

        setShow(false);
        //setFormData('');
        setFetch(true);
        setRows([]);
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
        //const userData = response.data;
       // console.log('Data From Backend:', userData);
    
      };

      const fetchSuggestions = async (query,id,type) => {
        if (!query.trim()) {
          updateRowSuggestions(id, []);
          updateMaterialSuggestions(id, []);
          return;
        }
        try {
          setLoading(true);
          const response = await axios.get(`https://www.wynstarcreations.com/seyal/api/search?type=${type}&q=${query}`);
          const data = response.data;
          if(type ==="process"){
            updateRowSuggestions(id, data.results || []);
          } else {
            updateMaterialSuggestions(id, data.results || []);
          }
         
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          if(type ==="process"){
            updateRowSuggestions(id, []);
          } else {
            updateMaterialSuggestions(id, []);
          }
        } finally {
          setLoading(false);
        }
      };
    
      const updateRowSuggestions = (id, suggestions) => {
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, suggestions } : row
          )
        );
      };

      const updateMaterialSuggestions = (id, materials) => {
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, materials } : row
          )
        );
      };
      
  const handleInputChange = (id, inputValue) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, value: inputValue } : row
      )
    );

    // Fetch suggestions from the backend
    fetchSuggestions(inputValue, id,'process');
  };

  const handleMaterialInputChange = (id, inputValue) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, material: inputValue } : row
      )
    );

    // Fetch suggestions from the backend
    fetchSuggestions(inputValue, id,'chemical');
  };

  const handleSuggestionClick = (id, suggestion) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, value: suggestion, suggestions: []} : row
      )
    );
  };

  const handleMaterialSuggestionClick = (id, material) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, material: material, materials: []} : row
      )
    );
  };

  const addRow = () => {
    const newRow = { id: rows.length + 1,process:'',callno:1, value:'',suggestions: [] ,material:'',materials: [] ,quantity: "",temp: "",unit: "",time: "",pid:""};
    setRows([...rows, newRow]);
  };
  

     const handleSubmit1 = async (event) => {
        event.preventDefault();
        rows.map((row) => (          
          row.process= formData.mname
        ))

        rows.map((row) => (          
            row.pid= pid
          ))
        console.log('Form Submitted with Data:', rows);
        
            axios.post(`${API_URL2}`, rows)
      .then(function (response) {

       setEditShow(false);
        setFormData('');
        if(fetch) {setFetch(false);} else {setFetch(true);}        
        setRows([]);
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
        //const userData = response.data;
       // console.log('Data From Backend:', userData);
    
      };
      
  const addRow1 = (data) => {   
    const newRow = { id: data[0],process:data[1],callno:data[2], value:data[3],suggestions: [] ,material:data[4],materials: [] ,quantity: data[5],temp: data[7],unit: data[6],time: data[8],pid:""};
    setRows(rows=>[...rows, newRow]);
    console.log("data:", newRow);  
  };
  
  const handleClose1 = () => {
    setEditShow(false);
    setFormData('');
    setRows([]);
  }


  const handleEdit = (event) => {
    
    event.preventDefault();       
        let api = table.current.dt();
        let rows1 = api.rows({ selected: true }).data().toArray();
        let dataArr = [];
        if(rows1.length === 0) {
          alert('Select plan for lab entry');
        } else {
          setEditShow(true); 
        rows1.map(value => (
          dataArr.push(value)
        ));  

        let srows = api.rows((id,data) =>  data[1] === dataArr[0][1]
        ).data().toArray();
        setRows([]);
        setFormData((prevData) => ({
          ...prevData,
          'mname': dataArr[0][1] // Update the value of the specific input field
        }));
       
        srows.map((value) => (
          addRow1(value)
        )); 
        console.log("rows:", rows);  
      }
      } 
      
      const  handleRemove = (event,material) => { 
        event.preventDefault();
        let srows = rows.map((data,index) =>  (data.material === material ? rows.splice(index, 1) : "" ));
        console.log('removed Data:', srows);
        
        setRows((prevRows) =>
          prevRows.map((row) =>
             row
          )
        );
        
      }

  return (
    <div className="main-content" >
          <Container fluid className="relative">
            <Row className="mb-6">
                      <div className="col-10 col-sm-10">
                        <h1 className="text-2xl font-bold text-gray-800">Process Route - {formData.mname}</h1>
                        <p className="text-gray-600">Welcome, {user.email}!</p>
                      </div>
                    </Row>
      
          
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
               <Dropdown.Item href="#" onClick={handleEdit}>Edit</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
            </div></div>
      
       <div className="overflow-hidden rounded-lg border border-gray-200 relative bg-white">
    <DataTable ref={table} data={tableData} options={{
                responsive: true,
                select: true,
                iDisplayLength:25,
                fixedHeader: true,  
                            
    rowGroup: {
        dataSrc: 1
    }
            }} className="display table sortable">
            <thead>
                <tr>
                    <th>S.No</th>
                    <th>Process Route</th> 
                    <th>Call No</th>
                    <th>Chemical</th>
                    <th>Product</th>
                    <th>Dosage</th>
                    <th>Unit</th>
                    <th>Temperature</th>
                    <th>Time</th>                                   
                </tr>
            </thead>
        </DataTable>
        </div>
        <Modal size="lg" show={show} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Add Process</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form><Row>
            <Form.Group className="col-6 col-sm-6" >
              <Form.Control
              type="text"
              disabled
              name="mname"              
              value={formData.mname}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            />
            </Form.Group> <Form.Group className="col-4 col-sm-4" >
            <Button onClick={addRow}>Add Call No</Button>
            </Form.Group></Row>
            {rows.map((row) => (
            <Row className="mt-2">
              <Form.Group className="col-1 col-sm-1" >  
              <Form.Control
              type="text"
              name="callno"              
              value={row.callno}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setRows((prevRows) =>
                prevRows.map((row1) =>
                  row1.id === row.id ? { ...row1, callno:e.target.value} : row1
                )
              )
            }    
            required
            />
            </Form.Group>
            <Form.Group className="col-3 col-sm-3 px-1" >
      <input
        type="text"
        className="form-control"
        value={row.value}
        onChange={(e) => handleInputChange(row.id, e.target.value)}
        placeholder="Search Chemical..."
      />
      {loading && (
        <div className="position-absolute w-100 text-center">
          <small>Loading...</small>
        </div>
      )}
      {row.suggestions.length > 0 && (
        <ul className="list-group position-absolute w-100">
          {row.suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="w-50 list-group-item list-group-item-action col-4 col-sm-4"
              onClick={() => handleSuggestionClick(row.id,suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </Form.Group>
    <Form.Group className="col-3 col-sm-3 px-1" >
      <input
        type="text"
        className="form-control"
        value={row.material}
        onChange={(e) => handleMaterialInputChange(row.id, e.target.value)}
        placeholder="Search Product..."
      />
      {loading && (
        <div className="position-absolute w-100 text-center">
          <small>Loading...</small>
        </div>
      )}
      {row.materials.length > 0 && (
        <ul className="list-group position-absolute w-100">
          {row.materials.map((suggestion, index) => (
            <li
              key={index}
              className="w-50 list-group-item list-group-item-action col-4 col-sm-4"
              onClick={() => handleMaterialSuggestionClick(row.id,suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </Form.Group>
    <Form.Group className="col-1 col-sm-1 px-1" >
  
              <Form.Control
              type="text"
              name="quantity"  
              placeholder='Qty'            
              value={row.quantity}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setRows((prevRows) =>
                prevRows.map((row1) =>
                  row1.id === row.id ? { ...row1, quantity:e.target.value} : row1
                )
              )
            }    
             required
            />
            </Form.Group>
            <Form.Group className="col-2 col-sm-2 px-1" controlId="formBasicWidth">
                     
                        <Form.Select             
                           type="text"
                           name="unit"              
                           value={row.unit}
                           onKeyUp={handleKeyUp}
                           onChange={(e) =>  setRows((prevRows) =>
                             prevRows.map((row1) =>
                               row1.id === row.id ? { ...row1, unit:e.target.value} : row1
                             )
                           )
                         }  
                         required
                        >
                          <option  value="">Unit</option>
                          <option  value="%">%</option>
                          <option  value="GPL">GPL</option>
                          
                       </Form.Select>       
                      </Form.Group>
            <Form.Group className="col-1 col-sm-1 px-1" >  
              <Form.Control
              type="text"
              name="temp"   
              placeholder='Temp'            
              value={row.temp}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setRows((prevRows) =>
                prevRows.map((row1) =>
                  row1.id === row.id ? { ...row1, temp:e.target.value} : row1
                )
              )
            }    
            required
            />
            </Form.Group>
            <Form.Group className="col-1 col-sm-1 px-1" >  
              <Form.Control
              type="text"
              name="time"    
              placeholder='Time'          
              value={row.time}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setRows((prevRows) =>
                prevRows.map((row1) =>
                  row1.id === row.id ? { ...row1, time:e.target.value} : row1
                )
              )
            }    
            required
            />
            </Form.Group>
           
    </Row>    
))}
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
      
       <Modal size="lg" show={eshow} onHide={handleClose1} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Edit Process</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form><Row>
            <Form.Group className="col-6 col-sm-6" >
              <Form.Control
              type="text"
              disabled
              name="mname"              
              value={formData.mname}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setFormData((prevData) => ({
                ...prevData,
                [e.target.name]: e.target.value // Update the value of the specific input field
              }))}    
             required
            />
            </Form.Group> <Form.Group className="col-4 col-sm-4" >
            <Button onClick={addRow}>Add Call No</Button>
            </Form.Group></Row>
            {rows.map((row) => (
            <Row className="mt-2">
              <Form.Group className="col-1 col-sm-1" >  
              <Form.Control
              type="text"
              name="callno"              
              value={row.callno}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setRows((prevRows) =>
                prevRows.map((row1) =>
                  row1.id === row.id ? { ...row1, callno:e.target.value} : row1
                )
              )
            }    
            required
            />
            </Form.Group>
            <Form.Group className="col-2 col-sm-2 px-1" >
      <input
        type="text"
        className="form-control"
        value={row.value}
        onChange={(e) => handleInputChange(row.id, e.target.value)}
        placeholder="Search Chemical..."
      />
      {loading && (
        <div className="position-absolute w-100 text-center">
          <small>Loading...</small>
        </div>
      )}
      {row.suggestions.length > 0 && (
        <ul className="list-group position-absolute w-100">
          {row.suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="w-50 list-group-item list-group-item-action col-4 col-sm-4"
              onClick={() => handleSuggestionClick(row.id,suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </Form.Group>
    <Form.Group className="col-3 col-sm-3 px-1" >
      <input
        type="text"
        className="form-control"
        value={row.material}
        onChange={(e) => handleMaterialInputChange(row.id, e.target.value)}
        placeholder="Search Product..."
      />
      {loading && (
        <div className="position-absolute w-100 text-center">
          <small>Loading...</small>
        </div>
      )}
      {row.materials.length > 0 && (
        <ul className="list-group position-absolute w-100">
          {row.materials.map((suggestion, index) => (
            <li
              key={index}
              className="w-50 list-group-item list-group-item-action col-4 col-sm-4"
              onClick={() => handleMaterialSuggestionClick(row.id,suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </Form.Group>
    <Form.Group className="col-1 col-sm-1 px-1" >
  
              <Form.Control
              type="text"
              name="quantity"  
              placeholder='Qty'            
              value={row.quantity}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setRows((prevRows) =>
                prevRows.map((row1) =>
                  row1.id === row.id ? { ...row1, quantity:e.target.value} : row1
                )
              )
            }    
             required
            />
            </Form.Group>
            <Form.Group className="col-2 col-sm-2 px-1" controlId="formBasicWidth">
                     
                        <Form.Select             
                           type="text"
                           name="unit"              
                           value={row.unit}
                           onKeyUp={handleKeyUp}
                           onChange={(e) =>  setRows((prevRows) =>
                             prevRows.map((row1) =>
                               row1.id === row.id ? { ...row1, unit:e.target.value} : row1
                             )
                           )
                         }  
                         required
                        >
                          <option  value="">Unit</option>
                          <option  value="%">%</option>
                          <option  value="GPL">GPL</option>
                          
                       </Form.Select>       
                      </Form.Group>
            <Form.Group className="col-1 col-sm-1 px-1" >  
              <Form.Control
              type="text"
              name="temp"   
              placeholder='Temp'            
              value={row.temp}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setRows((prevRows) =>
                prevRows.map((row1) =>
                  row1.id === row.id ? { ...row1, temp:e.target.value} : row1
                )
              )
            }    
            required
            />
            </Form.Group>
            <Form.Group className="col-1 col-sm-1 px-1" >  
              <Form.Control
              type="text"
              name="time"    
              placeholder='Time'          
              value={row.time}
              onKeyUp={handleKeyUp}
              onChange={(e) =>  setRows((prevRows) =>
                prevRows.map((row1) =>
                  row1.id === row.id ? { ...row1, time:e.target.value} : row1
                )
              )
            }    
            required
            />
            </Form.Group>
           <Form.Group className="col-1 col-sm-1 px-1" onClick={(e) => handleRemove(e,row.material)}>x</Form.Group>
    </Row>    
))}
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


export default Processroute;
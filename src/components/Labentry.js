import React, { useState, useEffect, useRef} from 'react';
import { Container,Button, Row,Modal, Form,Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import '../css/DataTable.css';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import FixedHeader from 'datatables.net-fixedcolumns-dt';
import RowGroup from 'datatables.net-rowgroup-dt';

import DT from 'datatables.net-dt';
const API_URL = 'https://www.wynstarcreations.com/seyal/api/getMasters?type=labentry';
const API_URL1 = 'https://www.wynstarcreations.com/seyal/api/addLabentry';
const API_URL2 = 'https://www.wynstarcreations.com/seyal/api/updateLabentry';

DataTable.use(DT);DataTable.use(FixedHeader);DataTable.use(RowGroup);
function Labentry() {

   const table = useRef();
   const suggestionRefs = useRef({});
    const [formData, setFormData] = useState({
        mname: '',type:'process'
      });

      const regexPatterns = {
        mname: /^[a-zA-Z0-9_@./#&+\-, ]*$/,callno: /^[0-9]*$/,quantity: /^[0-9.]*$/, unit: /^[a-zA-Z/%.]*$/, time: /^[0-9.]*$/,temp: /^[0-9.]*$/,
      };

    const [tableData, setTableData] = useState([ ]);
    const [show, setShow] = useState(false);
    const [eshow, setEditShow] = useState(false);
    const [fetch, setFetch] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([{ process:'',id: 1,callno: "", material:'',quantity: "", materials: [],unit:"",temp:"",time:"" ,selectedIndex: -1}]);
    const { user , isAuthenticated } = useAuth();
  const handleClose = () => {
    setShow(false);
    setFormData('');
    setRows([]);
  }

  const handleClose1 = () => {
    setEditShow(false);
    setFormData('');
    setRows([]);
  }

  const handleShow = () => setShow(true);
  
  // Scroll into view when navigating suggestions
  useEffect(() => {
    rows.forEach((row) => {
      if (row.selectedIndex >= 0 && suggestionRefs.current[row.id]) {
        const selectedItem = suggestionRefs.current[row.id][row.selectedIndex];
        if (selectedItem) {
          selectedItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    });
  }, [rows]);

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
        rows.map(row => (          
          row.process= formData.mname
        ))
        console.log('Form Submitted with Data:', rows);
        
            axios.post(`${API_URL1}`, rows)
      .then(function (response) {

        setShow(false);
        setFormData('');
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

      const fetchSuggestions = async (query,id) => {
        if (!query.trim()) {
          updateMaterialSuggestions(id, {materials:[], selectedIndex: -1 });
          return;
        }
        try {
          setLoading(true);
          const response = await axios.get(`https://www.wynstarcreations.com/seyal/api/search?type=chemical&q=${query}`);
          const data = response.data;          
          updateMaterialSuggestions(id, {materials:data.results || [],selectedIndex: -1 });
          
         
        } catch (error) {
          console.error("Error fetching suggestions:", error);          
          updateMaterialSuggestions(id, {materials:[],selectedIndex: -1});          
        } finally {
          setLoading(false);
        }
      };
         
      const updateMaterialSuggestions = (id, materials) => {
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, ...materials } : row
          )
        );
      };

  const handleMaterialInputChange = (id, inputValue) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, material: inputValue } : row
      )
    );

    // Fetch suggestions from the backend
    fetchSuggestions(inputValue, id);
  };

 
  const handleMaterialSuggestionClick = (id, material) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, material: material, materials: [], selectedIndex: -1} : row
      )
    );
  };

  const addRow = () => {
    const newRow = { id: rows.length + 1,process:'',callno:"", material:'',materials: [] ,quantity: "",temp: "",unit: "",time: "",selectedIndex: -1};
    setRows([...rows, newRow]);
  };

  const addRow1 = (data) => {   
    const newRow = { id: data[0],process:'',callno:"", material:data[2],materials: [] ,quantity: data[3],temp: data[5],unit: data[4],time: data[6],selectedIndex: -1};
    setRows(rows=>[...rows, newRow]);
    console.log("data:", newRow);  
  };

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

      const  handleRemove = (event,id) => { 
        event.preventDefault();
        let srows = rows.map((data,index) =>  (data.id === id ? rows.splice(index, 1) : "" ));
        console.log('removed Data:', srows);
        
        setRows((prevRows) =>
          prevRows.map((row) =>
             row
          )
        );
        
      }

      const handleSubmit1 = async (event) => {
        event.preventDefault();
        rows.map(row => (          
          row.process= formData.mname
        ))
        
            axios.post(`${API_URL2}`, rows)
      .then(function (response) {

        setEditShow(false);
        setFormData('');
        setFetch(true);
        setRows([]);
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });

    
      };
      
      // Handle keyboard navigation
  const handleKeyDown = (event, id) => {
     
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id !== id) return row;        
        let { selectedIndex, materials, material,unit } = row;

        if (event.key === "ArrowDown") {
          event.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, materials.length - 1);
   
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, 0);
        } else if (event.key === "Enter") {
          event.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < materials.length) {
            material = materials[selectedIndex];
            if(material ==="SODA ASH" || material ==="GLAUBERS SALT") { unit="GPL"}
            materials = [];
          }
        } else if (event.key === "Escape") {
          materials = [];
        }

        return { ...row, selectedIndex, material, materials,unit };
      })
    );
  };


  return (
    <div className="main-content" >   
        <Container fluid className="relative">
          <Row className="mb-6">
                              <div className="col-10 col-sm-10">
                                <h1 className="text-2xl font-bold text-gray-800">Lab Entry</h1>
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
         { user && (user.role !=="PM" ) && <Dropdown.Item href="#" onClick={handleShow}>Add</Dropdown.Item>  }
        { user && (user.role ==="admin" ||  user.role==="SP2" ) &&  <Dropdown.Item href="#" onClick={handleEdit}>Edit</Dropdown.Item>   }
       
      </Dropdown.Menu>
    </Dropdown>
           </div>
            </div>
       </Row>
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
                    <th>Colour Code</th>                    
                    <th>Chemical</th>
                    <th>Dosage</th>
                    <th>Unit</th>
                    <th>Temperature</th>
                    <th>Time</th>                                   
                </tr>
            </thead>
        </DataTable>
        <Modal size="lg" show={show} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Add Labentry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form><Row>
            <Form.Group className="col-6 col-sm-6" >
              <Form.Control
              type="text"
              placeholder='Enter Colour Code'
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
            <Button onClick={addRow}>Add Chemical</Button>
            </Form.Group></Row>
            {rows.map((row) => (
           
            <Row className="mt-2">
                    
    <Form.Group className="col-4 col-sm-4 px-1 " >
      <input
        type="text"
        className="form-control"
        value={row.material}
        onChange={(e) => handleMaterialInputChange(row.id, e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, row.id)}
        placeholder="Search Product..."
      />
      {loading && (
        <div className="position-absolute w-50 text-center">
          <small>Loading...</small>
        </div>
      )}
      {row.materials.length > 0 && (
        <ul className="list-group position-absolute" Style="height: auto;max-height:300px;overflow-y: scroll">
          {row.materials.map((suggestion, index) => (
            <li
              key={index}
              ref={(el) => {
                    if (!suggestionRefs.current[row.id]) {
                      suggestionRefs.current[row.id] = [];
                    }
                    suggestionRefs.current[row.id][index] = el;
                  }}
              className={`w-100 list-group-item list-group-item-action col-4 col-sm-4 ${
                    index === row.selectedIndex ? "active" : ""
                  }`}
              
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
          <Modal.Title>Edit Labentry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form><Row>
            <Form.Group className="col-6 col-sm-6" >
              <Form.Control
              type="text"
              placeholder='Enter Colour Code'
              name="mname"              
              value={formData.mname}
              disabled  
             required
            />
            </Form.Group> <Form.Group className="col-4 col-sm-4" >
            <Button onClick={addRow}>Add Chemical</Button>
            </Form.Group></Row>
            {rows.map((row) => (
            <Row className="mt-2">
                    
    <Form.Group className="col-4 col-sm-4 px-1" >
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
            <Form.Group className="col-1 col-sm-1 px-1" onClick={(e) => handleRemove(e,row.id)}>x</Form.Group>
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


export default Labentry;
import React, { useState, useEffect} from 'react';
import { Container,Button, Row,Modal, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import '../css/DataTable.css';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import FixedHeader from 'datatables.net-fixedcolumns-dt';
import RowGroup from 'datatables.net-rowgroup-dt';

import DT from 'datatables.net-dt';
const API_URL = 'https://www.wynstarcreations.com/seyal/api/getMasters?type=processroute';
const API_URL1 = 'https://www.wynstarcreations.com/seyal/api/addProcessRoute';

DataTable.use(DT);DataTable.use(FixedHeader);DataTable.use(RowGroup);
function Process() {

    const [formData, setFormData] = useState({
        mname: '',type:'process'
      });

      const regexPatterns = {
        mname: /^[a-zA-Z0-9_@./#&+\-, ]*$/,callno: /^[0-9]*$/,quantity: /^[0-9.]*$/, unit: /^[a-zA-Z/.]*$/, time: /^[0-9.]*$/,temp: /^[0-9.]*$/,
      };

    const [tableData, setTableData] = useState([ ]);
    const [show, setShow] = useState(false);
   const [fetch, setFetch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([{ process:'',id: 1,callno: 1, value: "",material:'',quantity: "", suggestions: [],materials: [],unit:"",temp:"",time:"" }]);

  const handleClose = () => {
    setShow(false);
    setFormData('');
    setRows([]);
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
    fetchData();
  }, [fetch]);

      const { user , isAuthenticated } = useAuth();
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
    const newRow = { id: rows.length + 1,process:'',callno:1, value:'',suggestions: [] ,material:'',materials: [] ,quantity: "",temp: "",unit: "",time: "",};
    setRows([...rows, newRow]);
  };


  return (
    <div className="data-wrapper">
    <div className="data-form-container" >
        <Container>
        <h1>Process Master</h1>
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
        <Modal size="lg" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Process</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form><Row>
            <Form.Group className="col-6 col-sm-6" >
              <Form.Control
              type="text"
              placeholder='Enter Standard Process'
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
                          <option  value="per/kg">PER/KG</option>
                          <option  value="per/gpl">PER/GPL</option>
                          
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
        </div>
        </div>
  );
}


export default Process;
import React, { useState,useEffect,useRef} from 'react';
import { Container, Row,Dropdown,Col,Card,Form,Modal,Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import '../css/Profile.css';
import '../css/Styles.css';
import axios from 'axios';
const API_URL = 'https://www.wynstarcreations.com/seyal/api';


function Mrs() {
  
  let { batchid } = useParams();
  let count = 1;
   const [formData, setFormData] = useState({
      machine: '', customer: '', fabric: '', 
      shade: '', construction: '', width: '',
      weight: '0',  gmeter: 0, glm: '0',aglm: '0',process: '',finishing: '',
    });
    const [colorCode, setColorCode] = useState(0);
    const [fetch, setFetch] = useState(false);
    const [rows, setMrs] = useState([{ ide:'',name: "", 
        subprocess: "",callno:'',chemical: "", dosage: "",
        unit:"",temp:"",time:"",totalWeight:"0",ratio:"" }]);

        const regexPatterns = {
          dosage: /^[0-9.]*$/,callno: /^[0-9]*$/
        };
          const [show, setShow] = useState(false);            
            const [loading, setLoading] = useState(false);
            const [colourrow, setRows] = useState([{ id: 1,material:'',materials: [],bid:batchid}]);
        
          const handleClose = () => {
            setShow(false);                  
          }
          const handleShow = () => {
            setShow(true);            
          }

          const [errors, setErrors] = useState([]);
          const inputsRef = useRef([]);
          const inputsRef1 = useRef([]);
    

 useEffect(() => {       
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/getbatchDetails`,{
            params: {
                batchid: batchid
              }
        });        
        setFormData(response.data['batch']); 
        setMrs(response.data['mrs']);  
        setColorCode(response.data['there']);
                    
      } catch (error) {
        console.log(error);
      } 
    };
    fetchData();
  }, [batchid,fetch]);

  const { user , isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return null;
  // navigate('/login');  // Avoid rendering profile if the user is not authenticated
 }

 const PrintHandle =  (event) => {
    event.preventDefault();  
    window.print();       
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

    
   };


   const fetchSuggestions = async (query,id) => {
    if (!query.trim()) {
      updateMaterialSuggestions(id, []);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`https://www.wynstarcreations.com/seyal/api/search?type=colourcode&q=${query}`);
      const data = response.data;          
      updateMaterialSuggestions(id, data.results || []);      
     
    } catch (error) {
      console.error("Error fetching suggestions:", error);          
      updateMaterialSuggestions(id, []);          
    } finally {
      setLoading(false);
    }
  };
     
  const updateMaterialSuggestions = (id, materials) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, materials } : row
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
        row.id === id ? { ...row, material: material, materials: []} : row
      )
    );
    };

    const addRow = () => {      
    //const newRow = { id: colourrow.length + 1, material:'',materials: [],bid:batchid };
    //setRows([...colourrow, newRow]);
    };

    const handleSubmit = async (event) => {
      
      event.preventDefault();      
      console.log('Form Submitted with Data:', colourrow);
      
          axios.post(`${API_URL}/addColourCode`, colourrow)
    .then(function (response) {

      setShow(false);setColorCode(1);
      response.data.map((dataObj) => (
        setMrs((prevItems) => [...prevItems, { ide:(Math.floor(Math.random() * (1000 - 10 + 1)) + 10),subprocess:dataObj.name,
          callno:dataObj.callno, chemical:dataObj.chemical,
          dosage: dataObj.dosage,temp: dataObj.temp,unit: dataObj.unit,
          time: dataObj.time,totalWeight:"",ratio:""}])       
      ))
      
    })
    .catch(function (error) {
      console.log(error);
    });
      //const userData = response.data;
    // console.log('Data From Backend:', userData);

    };

    const validate = () => {
      const newErrors = rows.map((user) => {
        const userErrors = {};
        if (user.callno==="") {
          userErrors.callno = 'Call no required';
        }
        if ((user.unit === "GPL")&&(user.ratio==="")) {
          userErrors.ratio = 'Ratio is required';
        } 
        return userErrors;
      });
      return newErrors;
    }

    const handleSave =  (event) => {
      
      event.preventDefault(); 
      const validationErrors = validate();
      const hasErrors = validationErrors.some((userErrors) =>
         Object.keys(userErrors).length > 0
      );

      if (hasErrors) {
        alert("Some values are missiong.Check out the red color hints");
        setErrors(validationErrors);
      } else {  
        setErrors([]);
        const dataToSend = {
          ...rows,
          bid: batchid,
          weight: formData.weight,
        };           
        console.log(dataToSend)
        axios.post(`${API_URL}/updateMRS`, dataToSend)
        .then(function (response) {
          setColorCode(2);
        console.log(response.data)
        setFetch(true);
        })
      }
    
    };
  
  
    const calculateGPL =  (ratio,selROw) => {
     
      let totalLtr = parseFloat(ratio * formData.weight).toFixed(5)
      let gpl = parseFloat(selROw.dosage/1000).toFixed(5)
      let totalWeight = parseFloat(totalLtr*gpl).toFixed(5)
      setMrs((prevRows) =>
        prevRows.map((row1) =>
          row1.ide === selROw.ide ? { ...row1, totalWeight:totalWeight,ratio:ratio} : row1
        )
      )
              
    };

    const handleKeyDown = (event, index) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault(); // Prevent default scrolling behavior
          const nextInput = inputsRef.current[index + 1];
          if (nextInput) {
            nextInput.focus();
          }
        }else if (event.key === 'ArrowUp') {
            event.preventDefault(); // Prevent default scrolling behavior
            const nextInput = inputsRef.current[index - 1];
            if (nextInput) {
              nextInput.focus();
            }
          }
      };

      const handleKeyDown1 = (event, index) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault(); // Prevent default scrolling behavior
          const nextInput = inputsRef1.current[index + 1];
          if (nextInput) {
            nextInput.focus();
          }
        }else if (event.key === 'ArrowUp') {
            event.preventDefault(); // Prevent default scrolling behavior
            const nextInput = inputsRef1.current[index - 1];
            if (nextInput) {
              nextInput.focus();
            }
          }
      };

      const STRHandle= (event) => {
        alert("Work In Progress");
      }
    
    return (
    
    <div className="data-wrapper">
        <Container>
        <Row className="header-top d-print-none">
          <div className="col-10 col-sm-10">
          <h3>BATCH - {batchid}</h3>
          </div>
          <div className="col-2 col-sm-2">         
          
            </div>
       </Row>
       <div id='content-wrapper'>
         <Card className='mb-4 p-3'>
        <Row className='batchcard'>         
        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p><strong>Batch No:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{batchid}</p>
					</div>
				</div>
		</div>   
       

        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p><strong>Customer:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{formData.customer}</p>
					</div>
				</div>
		</div>

       

        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p><strong>Shade:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{formData.shade}</p>
					</div>
				</div>
		</div>


        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p><strong>Weight:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{formData.weight}</p>
					</div>
				</div>
		</div>
        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p><strong>Gmeter:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{formData.gmeter}</p>
					</div>
				</div>
		</div>
        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p><strong>Process:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{formData.process}</p>
					</div>
				</div>
		</div>
        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p><strong>Finishing:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{formData.finishing}</p>
					</div>
				</div>
		</div>

        </Row>
        </Card>
       <Row className='mrs'>
       <Col xs={10}><h3>Material Request Slip</h3></Col>
       <Col xs={2} className='d-print-none'>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Actions
            </Dropdown.Toggle>
            <Dropdown.Menu>
            {colorCode===0 && <Dropdown.Item href="#" onClick={handleShow}>Add Colour Code</Dropdown.Item> }              
            {colorCode===1 && <Dropdown.Item href="#" onClick={handleSave}>Save</Dropdown.Item> } 
            {colorCode===2 && <Dropdown.Item href="#" onClick={PrintHandle}>Print</Dropdown.Item> }
             { colorCode===2 && user && <Dropdown.Item href="#" onClick={STRHandle} >Store Request</Dropdown.Item>  }
            </Dropdown.Menu>
        </Dropdown>
       </Col>
        </Row> 
        
        <Card className='mrs mb-4 p-3 '>
        
        <Row className='mrheader py-2' Style={'background:#f9f9f9;border-bottom:2px solid #f3f3f3 !important'}>         
        <Col xs={1}>S.N0</Col>
        <Col xs={1}>CALL NO</Col>
        <Col xs={2}>DESCRIPTION</Col>   
        <Col xs={2}>CHEMICAL</Col>        
        <Col xs={1}>DOSAGE</Col>
        <Col xs={1}>UNIT</Col>
        <Col xs={2}>QTY/KGS</Col>
        <Col xs={1}>TEMP</Col>
        <Col xs={1}>TIME</Col>
        </Row>
       {        
          rows.map((row,index) => (  
           
        <Row className='mt-3' >         
        <Col xs={1}>{count++}</Col>
        <Col xs={1}>{(row.callno === "") ? <Form.Control
         type="text"
         name="callno"  
         placeholder='Callno'            
         value={row.callno}
         ref={(el) => (inputsRef1.current[index] = el)}
              onKeyDown={(event) => handleKeyDown1(event, index)}
         onKeyUp={handleKeyUp}
         onChange={(e) =>  setMrs((prevRows) =>
           prevRows.map((row1) =>
             row1.ide === row.ide ? { ...row1, callno:e.target.value} : row1
           )
         )
       }    
        required
       />
       : row.callno
      }
      {errors[index]?.callno && (
            <p style={{ color: 'red' }}>{errors[index].callno}</p>
          )}
      </Col>
        <Col xs={2}>{row.subprocess}</Col>    
        <Col xs={2}>{row.chemical}</Col>    
        <Col xs={1}>{colorCode !== 2 ? 
        <Form.Control
              type="text"
              name="dosage"  
              placeholder='Qty'            
              value={row.dosage}
              ref={(el) => (inputsRef.current[index] = el)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onKeyUp={handleKeyUp}
              onChange={(e) => { 
                calculateGPL(e.target.value,row);
                setMrs((prevRows) =>
                prevRows.map((row1) =>
                  row1.ide === row.ide ? { ...row1, dosage:e.target.value} : row1
                )
              )
            }
            }    
             required
            /> : row.dosage }
        </Col>
        <Col xs={1}>{row.unit === 'GPL' && colorCode !==2 ? 
        
        <Form.Select             
                      name="gplunit"   
                      value={row.ratio}        
                      onChange={(e) =>  {
                        calculateGPL(e.target.value,row);
                       }
                      }      
                     required
                    >
         <option >Ratio</option>
         <option value="3" >1:3</option>
         <option value="4">1:4</option>
         </Form.Select>
        :
        row.unit }
        {row.unit === 'GPL' && colorCode ===2 && <p>Ratio 1 :{row.ratio}</p>}
        {errors[index]?.ratio && (
            <p style={{ color: 'red' }}>{errors[index].ratio}</p>
          )}
        </Col>
        <Col xs={2}>{
          
        row.unit !== "GPL"?(parseFloat((row.dosage/100) * formData.weight).toFixed(5)):row.totalWeight}</Col>
        <Col xs={1}>{row.temp}</Col>
        <Col xs={1}>{row.time}</Col>
        </Row>
        ))}
        </Card>
        </div>
        <Modal size="md" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
          <Row>
            <Col md={10}>Add Colour Code</Col>
            <Col md={2}>
            <Form.Group className="col-12 col-sm-12" >
            <Button onClick={addRow}>+</Button>
            </Form.Group></Col>             
            </Row>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {colourrow.map((row) => (
            <Row className="mt-2">
                    
    <Form.Group className="col-10 col-sm-10 px-1" >
      <input
        type="text"
        className="form-control"
        value={row.material}
        onChange={(e) => handleMaterialInputChange(row.id, e.target.value)}
        placeholder="Search Colour Code From Lab Entry..."
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
        </Container>
  </div>
  );
}


export default Mrs;
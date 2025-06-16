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
  let count = 1;let acount = 1;
   const [formData, setFormData] = useState({
      machine: '', customer: '', fabric: '', 
      shade: '', construction: '', width: '',
      weight: '0',  gmeter: 0, glm: '0',aglm: '0',process: '',finishing: '',
    });
    const [colorCode, setColorCode] = useState(0);
    const [fetch, setFetch] = useState(false);
    const { user , isAuthenticated } = useAuth();
    const [rows, setMrs] = useState([{ ide:'',name: "", 
        subprocess: "",callno:'',chemical: "", dosage: "",
        unit:"",temp:"",time:"",totalWeight:"0",ratio:"" }]);
        const [addrows, setAddMrs] = useState([{ ide:'1',addid:'1',name: "", 
          subprocess: "",callno:'',chemical: "", dosage: "",
          unit:"",temp:"",time:"",totalWeight:"0",ratio:"" }]);

          const [additionalrows, setAdditionalRows] = useState([{ addid:'' }]);

          const [rows1, setRows1] = useState([{ process:'',id: 1,callno: 1, value: "",material:'',quantity: "", suggestions: [],materials: [],unit:"",temp:"",time:"",pid:"" }]);
        

        const regexPatterns = {
          dosage: /^[0-9.]*$/,callno: /^[0-9]*$/
        };
          const [show, setShow] = useState(false);  
          const [show1, setShow1] = useState(false);          
            const [loading, setLoading] = useState(false);
            const [colourrow, setRows] = useState([{ id: 1,material:'',materials: [],bid:batchid}]);
        
          const handleClose = () => {
            setShow(false);                  
          }
          const handleShow = () => {
            setShow(true);            
          }

          const handleClose1 = () => {
            setShow1(false);    
            setRows1([]);              
          }
          const handleShow1 = () => {
            setShow1(true);            
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
        setAdditionalRows(response.data['addcount'])
        setAddMrs(response.data['addmrs']);              
      } catch (error) {
        console.log(error);
      } 
    };
    user && fetchData();
  }, [batchid,fetch,user]);

  
  if (!isAuthenticated) {
    return null;
  // navigate('/login');  // Avoid rendering profile if the user is not authenticated
 }

 const PrintHandle =  (event) => {
    const printContent = document.querySelector('.main-content');
  const originalContent = document.body.innerHTML;
  
  // Add print-specific styles
  const style = document.createElement('style');
  style.innerHTML = `
    @page {
      size: auto;
      margin: 20mm;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 8px;
      border: 1px solid #ddd;
    }
    
    thead {
      display: table-header-group;
    }
  `;
  document.head.appendChild(style);

  // Only print the main content
  document.body.innerHTML = printContent.innerHTML;
  
  window.print();
  
  // Restore original content
  document.body.innerHTML = originalContent;
  document.head.removeChild(style);
  
  // Reattach event listeners if needed
  window.location.reload();      
  };

  const ExportHandle =  (event) => {
    event.preventDefault();  
    let fname = `dispensar_data_${batchid}.csv`;
    exportTableToCSV(fname);    
  };

  function exportTableToCSV(filename) {
    let csv = [];    
    let bdata = [];
    bdata.push("Batch Name");
    bdata.push(batchid);
    bdata.push("");
    csv.push(bdata.join(","));
    bdata = [];
    bdata.push("Fabric Wt");
    bdata.push(formData.weight);
    bdata.push("");
    csv.push(bdata.join(","));

    bdata = [];
    bdata.push("MLR");
    bdata.push("");
    bdata.push("");
    csv.push(bdata.join(","));

    bdata = [];
    bdata.push("Machine No");
    bdata.push(formData.machine);
    bdata.push("");
    csv.push(bdata.join(","));

    bdata = [];
    bdata.push("seqno");
    bdata.push("chemical");
    bdata.push("targetwt");
    csv.push(bdata.join(","));

    rows.forEach((row) => {
        let cols = row;
        let rowData = [];
        rowData.push(cols.callno);
        rowData.push(cols.chemical);
        rowData.push(cols.totalWeight);
        csv.push(rowData.join(","));
    });

    let csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(csvFile);
    link.download = filename;
    link.click();
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


      const fetchSuggestions1 = async (query,id,type) => {
        if (!query.trim()) {
          updateRowSuggestions(id, []);
          updateMaterialSuggestions1(id, []);
          return;
        }
        try {
          setLoading(true);
          const response = await axios.get(`https://www.wynstarcreations.com/seyal/api/search?type=${type}&q=${query}`);
          const data = response.data;
          if(type ==="process"){
            updateRowSuggestions(id, data.results || []);
          } else {
            updateMaterialSuggestions1(id, data.results || []);
          }
         
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          if(type ==="process"){
            updateRowSuggestions(id, []);
          } else {
            updateMaterialSuggestions1(id, []);
          }
        } finally {
          setLoading(false);
        }
      };
    
      const updateRowSuggestions = (id, suggestions) => {
        setRows1((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, suggestions } : row
          )
        );
      };

      const updateMaterialSuggestions1 = (id, materials) => {
        setRows1((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, materials } : row
          )
        );
      };
      
  const handleInputChange = (id, inputValue) => {
    setRows1((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, value: inputValue } : row
      )
    );

    // Fetch suggestions from the backend
    fetchSuggestions1(inputValue, id,'process');
  };

  const handleMaterialInputChange1 = (id, inputValue) => {
    setRows1((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, material: inputValue } : row
      )
    );

    // Fetch suggestions from the backend
    fetchSuggestions1(inputValue, id,'chemical');
  };

  const handleSuggestionClick = (id, suggestion) => {
    setRows1((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, value: suggestion, suggestions: []} : row
      )
    );
  };

  const  handleMaterialSuggestionClick1= (id, material) => {
    setRows1((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, material: material, materials: []} : row
      )
    );
  };

  const addRow1 = () => {
    const newRow = { id: rows1.length + 1,process:'',callno:1, value:'',suggestions: [] ,material:'',materials: [] ,quantity: "",temp: "",unit: "",time: "",pid:""};
    setRows1([...rows1, newRow]);
  };

  const handleSubmit1 = async (event) => {
      
    event.preventDefault(); 
    
      const dataToSend = {
        ...rows1,
        bid: batchid,
        weight: formData.weight,
      };           
      console.log(dataToSend)
      axios.post(`${API_URL}/additionalMRS`, dataToSend)
      .then(function (response) {       
      console.log(response.data);
      setShow1(false);setRows1([]);  
      setFetch(true);
      })
  };
    
    return (
    
   <div className="main-content" >
         <Container fluid className="relative">
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
        <Row>
       <Row className='mrs'>
       <Col xs={10}><h3>Material Request Slip</h3></Col>
       <Col xs={2} className='d-print-none'>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic" className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
              Actions
            </Dropdown.Toggle>
            <Dropdown.Menu>
            {colorCode===0 && <Dropdown.Item href="#" onClick={handleShow}>Add Colour Code</Dropdown.Item> }              
            {colorCode===1 && <Dropdown.Item href="#" onClick={handleSave}>Save</Dropdown.Item> } 
            {colorCode===2 && <Dropdown.Item href="#" onClick={PrintHandle}>Print</Dropdown.Item> }
            {colorCode===2 && <Dropdown.Item href="#" onClick={ExportHandle}>Export</Dropdown.Item> }
             { colorCode===2 && user && <Dropdown.Item href="#" onClick={handleShow1} >Additional</Dropdown.Item>  }
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
        </Row>
        { additionalrows.map((row1) => (          
        <Row className={row1.addid}>
       <Row className='additional'>
       <Col xs={10}><h3>Additional {acount++}</h3></Col>
       <Col xs={2} className='d-print-none'>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Actions
            </Dropdown.Toggle>
            <Dropdown.Menu>
            {colorCode===2 && <Dropdown.Item href="#" onClick={PrintHandle}>Print</Dropdown.Item> }
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
          addrows.map((row,index) => (  
            row1.addid === row.addid ?  
        <Row className='mt-3' >         
        <Col xs={1}>{count++}</Col>
        <Col xs={1}>{(row.callno === "") ? <Form.Control
         type="text"
         name="callno"  
         placeholder='Callno'            
         value={row.callno}
         ref={(el) => (inputsRef1.current[index] = el)}           
        required
       />
       : row.callno
      }

      </Col>
        <Col xs={2}>{row.subprocess}</Col>    
        <Col xs={2}>{row.chemical}</Col>    
        <Col xs={1}>{ row.dosage }</Col>
        <Col xs={1}>{row.unit }
        {row.unit === 'GPL' && colorCode ===2 && <p>Ratio 1 :{row.ratio}</p>}        
        </Col>
        <Col xs={2}>{          
        row.totalWeight}</Col>
        <Col xs={1}>{row.temp}</Col>
        <Col xs={1}>{row.time}</Col>
        </Row> : ""

        ))}
        </Card>
        </Row>
        ))}
        </div>
        { colorCode===0 && <Modal size="md" show={show} onHide={handleClose}>
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
      }

      { colorCode===2 && user &&  <Modal size="lg" show={show1} onHide={handleClose1}>
              <Modal.Header closeButton>
                <Modal.Title>Additional Chemical & Dyes 
                <Button style={{ marginLeft: '50px' }} onClick={addRow1} >Add More</Button>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  {rows1.map((row) => (
                  <Row className="mt-2">
                    <Form.Group className="col-1 col-sm-1" >  
                    <Form.Control
                    type="text"
                    name="callno"              
                    value={row.callno}                    
                    onChange={(e) =>  setRows1((prevRows) =>
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
              onChange={(e) => handleMaterialInputChange1(row.id, e.target.value)}
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
                    onClick={() => handleMaterialSuggestionClick1(row.id,suggestion)}
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
                    onChange={(e) =>  setRows1((prevRows) =>
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
                                 onChange={(e) =>  setRows1((prevRows) =>
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
                    onChange={(e) =>  setRows1((prevRows) =>
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
                    onChange={(e) =>  setRows1((prevRows) =>
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
                <Button variant="secondary" onClick={handleClose1}>
                  Close
                </Button>
                <Button variant="primary" onClick={handleSubmit1}>
                  Save 
                </Button>
              </Modal.Footer>
            </Modal>  }
        </Container>
  </div>
  );
}


export default Mrs;
import React, { useState,useEffect} from 'react';
import { Container, Row,Dropdown,Col,Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import '../css/Profile.css';
import '../css/Styles.css';
import axios from 'axios';
const API_URL = 'https://www.wynstarcreations.com/seyal/api';


function Batchdetails() {
  
  let { batchid } = useParams();
  let count = 1;
   const [formData, setFormData] = useState({
      machine: '', customer: '', fabric: '', 
      shade: '', construction: '', width: '',
      weight: '0',  gmeter: 0, glm: '0',aglm: '0',process: '',finishing: '',
    });
    const [rows, setMrs] = useState([{ ide:'',name: "", 
        subprocess: "",callno:'',chemical: "", dosage: "",
        unit:"",temp:"",time:"" }]);
    

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
        
      } catch (error) {
        console.log(error);
      } 
    };
    fetchData();
  }, [batchid]);

  const { user , isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return null;
  // navigate('/login');  // Avoid rendering profile if the user is not authenticated
 }

 const PrintHandle =  (event) => {
    event.preventDefault();  
    window.print();       
  };
 
    return (
    
    <div className="data-wrapper">
        <Container>
        <Row className="header-top d-print-none">
          <div className="col-10 col-sm-10">
          <h1>Batch Details - {batchid}</h1>
          <p>Welcome, {user.email}!</p>
          </div>
          <div className="col-2 col-sm-2">
          <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        Actions
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item href="#">Add</Dropdown.Item>
        <Dropdown.Item href="#" onClick={PrintHandle} >Print</Dropdown.Item>     
      </Dropdown.Menu>
    </Dropdown>
          
            </div>
       </Row>
       <div id='content-wrapper'>
         <Card className='mb-4 p-3'>
        <Row>         
        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p>Batch No:</p>
					</div>
					<div class="col-md-7">
						<p>{batchid}</p>
					</div>
				</div>
		</div>   
        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p>Machine:</p>
					</div>
					<div class="col-md-7">
						<p>{formData.machine}</p>
					</div>
				</div>
		</div>

        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p>Customer:</p>
					</div>
					<div class="col-md-7">
						<p>{formData.customer}</p>
					</div>
				</div>
		</div>

        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p>Fabric:</p>
					</div>
					<div class="col-md-7">
						<p>{formData.fabric}</p>
					</div>
				</div>
		</div>

        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p>Shade:</p>
					</div>
					<div class="col-md-7">
						<p>{formData.shade}</p>
					</div>
				</div>
		</div>

        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p>Construction:</p>
					</div>
					<div class="col-md-7">
						<p>{formData.construction}</p>
					</div>
				</div>
		</div>

        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p>Width:</p>
					</div>
					<div class="col-md-7">
						<p>{formData.width}</p>
					</div>
				</div>
		</div>
        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p>Weight:</p>
					</div>
					<div class="col-md-7">
						<p>{formData.weight}</p>
					</div>
				</div>
		</div>
        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p>Gmeter:</p>
					</div>
					<div class="col-md-7">
						<p>{formData.gmeter}</p>
					</div>
				</div>
		</div>
        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p>GLM:</p>
					</div>
					<div class="col-md-7">
						<p>{formData.glm}</p>
					</div>
				</div>
		</div>
        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p>AGLM:</p>
					</div>
					<div class="col-md-7">
						<p>{formData.aglm}</p>
					</div>
				</div>
		</div>
        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p>Process:</p>
					</div>
					<div class="col-md-7">
						<p>{formData.process}</p>
					</div>
				</div>
		</div>
        <div class="col-12 col-sm-6">
                <div class="row">
					<div class="col-md-5">
						<p>Finishing:</p>
					</div>
					<div class="col-md-7">
						<p>{formData.finishing}</p>
					</div>
				</div>
		</div>

        </Row>
        </Card>
        <h3>Material Request Details</h3>
        <Card className='mb-4 p-3'>
        
        <Row className='mrheader py-2' Style={'background:#f9f9f9;border-bottom:2px solid #f3f3f3 !important'}>         
        <Col xs={1}>S.N0</Col>
        <Col xs={1}>CALL NO</Col>
        <Col xs={2}>DESCRIPTION</Col>   
        <Col xs={2}>CHEMICAL</Col>        
        <Col xs={2}>DOSAGE</Col>
        <Col xs={1}>UNIT</Col>
        <Col xs={1}>QTY/KGS</Col>
        <Col xs={1}>TEMP</Col>
        <Col xs={1}>TIME</Col>
        </Row>
       { 
          rows.map(row => (   
        <Row className='mt-3'>         
        <Col xs={1}>{count++}</Col>
        <Col xs={1}>{row.callno}</Col>
        <Col xs={2}>{row.subprocess}</Col>    
        <Col xs={2}>{row.chemical}</Col>    
        <Col xs={2}>{row.dosage}</Col>
        <Col xs={1}>{row.unit.toUpperCase()}</Col>
        <Col xs={1}>{parseFloat((row.dosage/100) * formData.weight).toFixed(5)}</Col>
        <Col xs={1}>{row.temp}</Col>
        <Col xs={1}>{row.time}</Col>
        </Row>
        ))}
        </Card>
        </div>
        </Container>
  </div>
  );
}


export default Batchdetails;
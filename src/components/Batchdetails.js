import React, { useState,useEffect} from 'react';
import { Container, Row,Dropdown,Card } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import '../css/Profile.css';
import '../css/Styles.css';
import axios from 'axios';
const API_URL = 'https://www.wynstarcreations.com/seyal/api';


function Batchdetails() {
  
  let { batchid } = useParams();
   const [formData, setFormData] = useState({
      machine: '', customer: '', fabric: '', 
      shade: '', construction: '', width: '',
      weight: '0',  gmeter: 0, glm: '0',aglm: '0',process: '',finishing: '',
    });
    const { user , isAuthenticated } = useAuth();

 useEffect(() => {       
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/getbatchDetails`,{
            params: {
                batchid: batchid
              }
        });        
        setFormData(response.data['batch']);       
    
                    
      } catch (error) {
        console.log(error);
      } 
    };
    user && fetchData();
  }, [batchid,user]);
  
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
        <Row className="header-top">
          <div className="col-10 col-sm-10" style={{textAlign:'center'}}>
          <h1>Sri Shiva Designs</h1>
          <p style={{fontSize:'20px'}}>Perundurai</p>
          </div>
          <div className="col-2 col-sm-2 d-print-none">
          <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        Actions
      </Dropdown.Toggle>

      <Dropdown.Menu>       
        <Dropdown.Item href="#" onClick={PrintHandle} >Print</Dropdown.Item> 
        { user && (user.role==="admin" || user.role==="production") && <Dropdown.Item href={`../mrs/${batchid}`}  >MRS</Dropdown.Item>  }   
      </Dropdown.Menu>
    </Dropdown>
          
            </div>
       </Row>
       <div id='content-wrapper'>
         <Card className='mb-4 p-3'>
        <Row className='batchcard'>         
        <div class="col-8">
                <div class="row">
					<div class="col-md-5">
						<p><strong>Batch No:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{batchid}</p>
					</div>
				</div>
		</div>   
        <div class="col-8">
                <div class="row">
					<div class="col-md-5">
						<p><strong>Machine:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{formData.machine}</p>
					</div>
				</div>
		</div>

        <div class="col-8">
                <div class="row">
					<div class="col-md-5">
						<p><strong>Customer:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{formData.customer}</p>
					</div>
				</div>
		</div>

        <div class="col-8">
                <div class="row">
					<div class="col-md-5">
						<p><strong>Fabric:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{formData.fabric}</p>
					</div>
				</div>
		</div>

        <div class="col-8">
                <div class="row">
					<div class="col-md-5">
						<p><strong>Shade:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{formData.shade}</p>
					</div>
				</div>
		</div>

        <div class="col-8">
                <div class="row">
					<div class="col-md-5">
						<p><strong>Construction:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{formData.construction}</p>
					</div>
				</div>
		</div>

        <div class="col-8">
                <div class="row">
					<div class="col-md-5">
						<p><strong>Width:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{formData.width}</p>
					</div>
				</div>
		</div>
        <div class="col-8">
                <div class="row">
					<div class="col-md-5">
						<p><strong>Weight:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{formData.weight}</p>
					</div>
				</div>
		</div>
        <div class="col-8">
                <div class="row">
					<div class="col-md-5">
						<p><strong>Gmeter:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{formData.gmeter}</p>
					</div>
				</div>
		</div>
        <div class="col-8">
                <div class="row">
					<div class="col-md-5">
						<p><strong>GLM:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{formData.glm}</p>
					</div>
				</div>
		</div>
        <div class="col-8">
                <div class="row">
					<div class="col-md-5">
						<p><strong>AGLM:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{formData.aglm}</p>
					</div>
				</div>
		</div>
        <div class="col-8">
                <div class="row">
					<div class="col-md-5">
						<p><strong>Process:</strong></p>
					</div>
					<div class="col-md-7">
						<p>{formData.process}</p>
					</div>
				</div>
		</div>
        <div class="col-8">
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
        </div>      
        </Container>
  </div>
  );
}


export default Batchdetails;
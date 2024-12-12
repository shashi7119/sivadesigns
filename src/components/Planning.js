import React, { useState, useEffect} from 'react';
import { Container,Dropdown, Row } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import '../css/DataTable.css';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import Select from 'datatables.net-select-dt';
import FixedHeader from 'datatables.net-fixedcolumns-dt';
import Responsive from 'datatables.net-responsive-dt';
import DT from 'datatables.net-dt';
const API_URL = 'https://www.wynstarcreations.com/seyal/api/plans';

DataTable.use(DT);DataTable.use(Responsive);DataTable.use(Select);
DataTable.use(FixedHeader);
function Planning() {
  
  const [tableData, setTableData] = useState([ ]);

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
  }, []);

      const { user , isAuthenticated } = useAuth();
      if (!isAuthenticated) {
        return null;
      // navigate('/login');  // Avoid rendering profile if the user is not authenticated
     }

     let selectEvent = (e) => {

         e.preventDefault();
         
    };
     

  return (
    <div className="data-wrapper">
   
        <Container>
        <Row>
          <div className="col-10 col-sm-10">
          <h1>Planning</h1>
          <p>Welcome, {user.email}!</p>
          </div>
          <div className="col-2 col-sm-2">
          <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        Actions
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item href="/profile">Add</Dropdown.Item>
        <Dropdown.Item href="#" >Print</Dropdown.Item>
        <Dropdown.Item href="#">Delete</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
          
            </div>
       </Row>
                
    <DataTable data={tableData} onSelect={selectEvent} options={{
            order: [[1, 'asc']],
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
              
            } }  className="display table sortable stripe row-border order-column nowrap dataTable" style={{width:"100%"}}>
            <thead>
                <tr>                   
                    <th>Plan.No</th>
                    <th>Date</th>
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
        </DataTable>
        </Container>
       
        </div>
  );
}


export default Planning;
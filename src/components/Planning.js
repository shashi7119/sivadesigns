import React, { useState, useEffect} from 'react';
import { Container,Dropdown, Row } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import '../css/DataTable.css';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
const API_URL = 'https://www.wynstarcreations.com/seyal/api/plans';

DataTable.use(DT);
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
     

  return (
    <div className="data-wrapper">
    <div className="data-form-container" >
        <Container>
        <h1>Planning</h1>
        <p>Welcome, {user.email}!</p>
        </Container>
        <Row>
          <div class="col-10 col-sm-10"></div>
          <div class="col-2 col-sm-2">
          <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        Actions
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item href="/profile">Add</Dropdown.Item>
        <Dropdown.Item href="#">Print</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
          
            </div>
       </Row>
    <DataTable data={tableData} options={{
                responsive: true,
                select: true,
                iDisplayLength:25,
                order:[1,"asc"]
            }} className="display table sortable">
            <thead>
                <tr>
                    <th></th>
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
        </div>
        </div>
  );
}


export default Planning;
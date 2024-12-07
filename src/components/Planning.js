import React, { useState, useEffect} from 'react';
import { Container } from 'react-bootstrap';
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
    <DataTable data={tableData} options={{
                responsive: true,
                select: true,
                iDisplayLength:25,
            }} className="display table sortable">
            <thead>
                <tr>
                    <th>S.No</th>
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
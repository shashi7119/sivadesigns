import React from 'react';
import { Container} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import '../css/DataTable.css';
import DataTable from 'datatables.net-react';
import Responsive from 'datatables.net-responsive-dt';
import DT from 'datatables.net-dt';


DataTable.use(Responsive);
DataTable.use(DT);
function PrintDataTable(props)  {
    const { tableData } = props;

      const { user , isAuthenticated } = useAuth();
      if (!isAuthenticated) {
        return null;
      // navigate('/login');  // Avoid rendering profile if the user is not authenticated
     }
 
  return (
    <div className="data-wrapper" data-user = {user}>
   
        <Container>
                      
    <DataTable  ref={this.props.innerRef} data={tableData} 
    options={{
            order: [[0, 'desc']],            
            paging: false,    
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
export default PrintDataTable;
import React, { useState,  useRef } from 'react';
import { Container,  Row, Dropdown,  Form, } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import '../css/Styles.css';
import '../css/DataTable.css';
import DataTable from 'datatables.net-react';
import Select from 'datatables.net-select-dt';
import FixedHeader from 'datatables.net-fixedcolumns-dt';
import Responsive from 'datatables.net-responsive-dt';
import DT from 'datatables.net-dt';
import $ from 'jquery';
//import PrintDataTable from '../components/PrintDataTable';

const API_URL = 'https://www.wynstarcreations.com/seyal/api';

DataTable.use(Responsive); DataTable.use(Select);
DataTable.use(FixedHeader); DataTable.use(DT);
function PurchaseOrderList() {
  const table = useRef();
  const { user, isAuthenticated } = useAuth();

   const [searchState, setSearchState] = useState('');


  // Remove the useEffect that was fetching tableData since we're using server-side processing

  if (!isAuthenticated) {
    return null;
  // navigate('/login');  // Avoid rendering profile if the user is not authenticated
  }



       const PrintIndvHandle =  (event) => {
      event.preventDefault();
      let api = table.current.dt();
      let selectedRows = api.rows({ selected: true }).data();
  console.log(selectedRows);
      const printableContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            table, th, td {
              border: 1px solid black;
            }
            th, td {
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            h1 {
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>Purchase Orders</h1>
          <table>
            <thead>
              <tr>
                      <th>Date</th>
                      <th>Order No</th>
                      <th>Vendor</th> 
                      <th>Order Quantity</th>      
                      <th>Receved Quantity</th>                           
                   
              </tr>
            </thead>
            <tbody>
              ${selectedRows
                .map(
                  (row) => `
                    <tr>
                      <td>${row[0]}</td>
                      <td>${row[1]}</td>
                      <td>${row[2]}</td>
                      <td>${row[3]}</td>
                      <td>${row[4]}</td>                     
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
  
      const newWindow = window.open("", "_blank");
      newWindow.document.write(`<pre>${printableContent}</pre>`);
      newWindow.print();
         
    };

  const addHandle = (event) => {

    event.preventDefault();
 window.location.href = 'purchaseOrder'; 
  };



    const handleColumnChange = (e) => {
    setSearchState(e.target.value);
   
  };

  return (
    <div className="main-content" >
      <Container fluid className="relative">
        <Row className="mb-6">
          <div className="col-10 col-sm-10">
            <h1 className="text-2xl font-bold text-gray-800">Purchase Orders</h1>
            <p className="text-gray-600">Welcome, {user.user}!</p>
          </div>
        </Row>

        <div className="flex justify-end mb-4">
          <div className="col-2 col-sm-2">
            <Dropdown className="">
              <Dropdown.Toggle variant="primary" id="dropdown-basic" 
                className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                Actions
              </Dropdown.Toggle>

              <Dropdown.Menu className="mt-2">
                <Dropdown.Item href="#" onClick={PrintIndvHandle}>Print</Dropdown.Item> 
                <Dropdown.Item href="#" onClick={addHandle}>Add</Dropdown.Item>

              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="ml-auto w-1/5">
                      <Form.Select
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 tsearch"
                        value={searchState}
                        onChange={handleColumnChange}
                      >
                        <option value="id">Order No</option>
                        <option value="vendor">Vendor</option>
                       
                      </Form.Select>
                    </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 relative bg-white">
          <DataTable 
            ref={table}
            options={{
              scrollX: true,
              scrollY: '60vh',
              scrollCollapse: true,
              fixedColumns: {
                left: 2
              },
              order: [[1, 'desc']],
              paging: true,
              processing: true,
              serverSide: true,
              select: { style: 'multi' },
              ajax: {
                url: `${API_URL}/purchaseOrders`,
                type: 'POST',
                data: function (d) {
                  d.searchcol = $(".tsearch").val();
                  if (d.length === -1) {
                    d.length = 25;
                  }
                  return d;
                }
              },
              pageLength: 25,
              columns: [
                { data: "0" }, // Date
                { data: "1" }, // order.No
                { data: "2" }, // vendor name
                { data: "3" }, // qty
                { data: "4" }, // receivedqty
               
              ],
              dom: '<"flex items-center justify-between mb-4"l<"ml-2"f>>rtip',
              language: {
                search: "Search:",
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                paginate: {
                  first: "First",
                  last: "Last",
                  next: "Next",
                  previous: "Previous"
                }
              },
              className: "w-full text-sm text-left text-gray-500"
            }}
          >
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Order.No</th>
              <th className="px-6 py-3">Vendor</th>
              <th className="px-6 py-3">Order Quantity</th>
              <th className="px-6 py-3">Received Quantity</th>
             
            </tr>
          </thead>
        </DataTable>
        </div>

    
      </Container>
    </div>


  );
}

export default PurchaseOrderList;
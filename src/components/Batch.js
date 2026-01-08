import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Dropdown, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import Select from 'datatables.net-select-dt';
import FixedHeader from 'datatables.net-fixedcolumns-dt';
import Responsive from 'datatables.net-responsive-dt';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import '../css/Styles.css';
import '../css/DataTable.css';

// Add styles for editable cells
const editableCellStyles = document.createElement('style');
editableCellStyles.innerHTML = `
  .editable-cell { cursor: pointer; }
  .editable-cell:hover { background-color: #e9ecef !important; }
  .editing { padding: 0 !important; }
  .editing input { width: 100%; height: 100%; padding: 8px; box-sizing: border-box; }
  .not-authorized .editable-cell { cursor: not-allowed; }
  .not-authorized .editable-cell:hover { background-color: transparent !important; }
  td:not(.editable-cell) { cursor: default; }
  .not-authorized .editable-cell { cursor: not-allowed; background-color: transparent !important; }
  .not-authorized .editable-cell:hover { background-color: transparent !important; }
`;
document.head.appendChild(editableCellStyles);

const API_URL = 'https://www.wynstarcreations.com/seyal/api';

DataTable.use(Responsive);DataTable.use(Select);
DataTable.use(FixedHeader);DataTable.use(DT);
function Batch() {
  const table = useRef();
  const { user , isAuthenticated } = useAuth();

// Reload DataTable when tab becomes active (user returns after idle)
  useEffect(() => {
    const currentTable = table.current;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && currentTable) {
        const api = currentTable.dt();
        api.ajax.reload();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Clean up any existing cell edit states
      $('.editing input').remove();
      $('.editing').removeClass('editing');
      $(document).off('mousedown.cellEdit');
    };
  }, []);


      const [searchState, setSearchState] = useState('');
      if (!isAuthenticated) {
        return null;
      // navigate('/login');  // Avoid rendering profile if the user is not authenticated
     }
   
     const PrintHandle =  (event) => {
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
          <h1>Batches</h1>
          <table>
            <thead>
              <tr>
                <th>Batch.No</th>
                      <th>Date</th>
                      <th>Sale Order No</th>
                      <th>Inward No</th>                      
                      <th>Cust Dc</th>
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
                      <td>${row[5]}</td>
                      <td>${row[6]}</td>
                      <td>${row[7]}</td>
                      <td>${row[8]}</td>
                      <td>${row[9]}</td>
                      <td>${row[10]}</td>
                      <td>${row[11]}</td>
                      <td>${row[12]}</td>
                      <td>${row[13]}</td>
                      <td>${row[14]}</td>
                      <td>${row[15]}</td>
                      <td>${row[16]}</td>
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
      //setSelectedData(dataArr);
      //console.log(dataArr);  
         
    };

  const deleteHandle =  (event) => {

    event.preventDefault();
    if (window.confirm("Delete this item?")) {
    let api = table.current.dt();
    let rows = api.rows({ selected: true }).data().toArray();
    let dataArr = [];
    rows.map(value => (
      dataArr.push(value)
    ));    
    axios.post(`${API_URL}/deleteBatch`, dataArr)
    .then(function (response) {      
      console.log(response);
    })
  .catch(function (error) {
    console.log(error);
  });
    console.log(dataArr);
    api.rows({ selected: true }).remove().draw();
  }
  };

  const completeHandle =  (event) => {

    event.preventDefault();
    if (window.confirm("Complete this batch?")) {
    let api = table.current.dt();
    let rows = api.rows({ selected: true }).data().toArray();
    let dataArr = [];let dataArr1 = [];
    rows.map(value => (
      dataArr.push(value)
    ));
    
    const match = dataArr[0][4].match(/data-pide="([^"]*)"/);
      const value = match ? match[1] : null;
      dataArr1.push(value);
    
    if(dataArr.length === 0) {
      alert('Select batch for complete');
    }else if(dataArr.length > 1) {
      alert('Not allowed multiple plans for complete batch');
    } else {
    axios.post(`${API_URL}/completeBatch`, dataArr1)
    .then(function (response) {      
      alert("Batch Completed");
      api.rows({ selected: true }).remove().draw();
    })
  .catch(function (error) {
    alert("Please generate MRS before complete this batch!");
  });
}
  }
  };
  
      const handleColumnChange = (e) => {
    setSearchState(e.target.value);
  };

  const handleCellEdit = (cell) => {
    // Check if user has permission to edit
    const allowedRoles = ['admin', 'PA', 'editor'];
    if (!allowedRoles.includes(user.role)) {
      alert('You do not have permission to edit this data');
      return;
    }

    // Clear any existing edit state
    $('.editing input').trigger('blur');
    $('.editing').removeClass('editing');

    const $cell = $(cell);
    const api = table.current.dt();
    
    // Get cell data and position
    const cellData = api.cell(cell).data();
    const currentValue = cellData || $cell.text();
    const cellIndex = api.cell(cell).index();
    
    if (!cellIndex) return;
    const columnIdx = cellIndex.column;
    const rowIdx = cellIndex.row;
    
    // Only allow editing for Weight (11) and GMeter (12) columns
    if (columnIdx !== 11 && columnIdx !== 12) return;

    // Get the row data before editing
    const rowData = api.row(rowIdx).data();
    if (!rowData || !rowData[0]) return;
    //const batchId = rowData[4];
    const match =  rowData[4].match(/data-pide="([^"]*)"/);
      const batchId = match ? match[1] : null;

    // Store original content
    const originalContent = $cell.html();
    
    // Create input element
    const $input = $('<input type="text">')
      .val(currentValue)
      .addClass('form-control')
      .css({
        width: '100%',
        height: '100%',
        padding: '5px',
        boxSizing: 'border-box',
        border: '1px solid #007bff'
      });

    // Replace cell content with input
    $cell.html($input).addClass('editing');
    $input.focus().select();

    // Function to restore original state
    const restoreOriginal = () => {
      // Remove all event handlers first
      $input.off('keydown mousedown blur');
      $(document).off('mousedown.cellEdit');
      
      // Remove editing class and restore original content
      $cell.removeClass('editing');
      $cell.empty().html(originalContent);
      
      // Cleanup any floating input elements
      $('.editing input').remove();
      $('.editing').removeClass('editing');
    };

    // Function to save changes
    const saveChanges = async () => {
      const newValue = $input.val().trim();
      
      if (newValue === currentValue) {
        restoreOriginal();
        return;
      }

      try {
        await axios.post(`${API_URL}/updateBatch`, {
          batchId: batchId,
          columnIndex: columnIdx,
          oldValue: currentValue,
          newValue: newValue,
          columnName: api.settings()[0].aoColumns[columnIdx].data
        });

        // Update DataTable
        const updatedData = [...rowData];
        updatedData[columnIdx] = newValue;
        api.row(rowIdx).data(updatedData);
        api.draw(false);

        // Cleanup
        restoreOriginal();
      } catch (error) {
        console.error('Update failed:', error);
        alert('Failed to update data');
        restoreOriginal();
      }
    };

    // Handle clicks outside the editing cell
    const handleOutsideClick = function(e) {
      if (!$(e.target).closest($cell).length && !$(e.target).is($input)) {
        e.preventDefault();
        e.stopPropagation();
        restoreOriginal();
      }
    };

    // Delay binding the document click handler
    setTimeout(() => {
      $(document).on('mousedown.cellEdit', handleOutsideClick);
    }, 0);

    // Handle input events
    $input
      .on('keydown.cellEdit', function(e) {
        e.stopPropagation();
        
        if (e.key === 'Enter') {
          e.preventDefault();
          saveChanges();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          restoreOriginal();
        }
      })
      .on('mousedown.cellEdit', function(e) {
        e.stopPropagation();
        e.preventDefault();
      })
      .on('dblclick.cellEdit', function(e) {
        e.stopPropagation();
        e.preventDefault();
      })
      .on('click.cellEdit', function(e) {
        e.stopPropagation();
        e.preventDefault();
      })
      .on('blur.cellEdit', function(e) {
        // Only handle blur if we're not clicking inside the cell
        if (!$(e.relatedTarget).closest($cell).length) {
          // Small delay to allow other events to process
          setTimeout(() => {
            if ($cell.hasClass('editing')) {
              restoreOriginal();
            }
          }, 50);
        }
      });
  };




  const updateBatchData = (rowData, columnIndex, newValue) => {
    console.log('Updating batch data:', rowData, columnIndex, newValue);
    //const batchId = rowData[4]; // Assuming first column is batch ID
    const match =  rowData[4].match(/data-pide="([^"]*)"/);
    const batchId = match ? match[1] : null;
    const oldValue = rowData[columnIndex]; // Get the current value before update
    const api = table.current.dt();
    const columnName = api.settings()[0].aoColumns[columnIndex].data;
    
    const updateData = {
      batchId: batchId,
      columnIndex: columnIndex,
      oldValue: oldValue,
      newValue: newValue,
      columnName: columnName
    };

    axios.post(`${API_URL}/updateBatch`, updateData)
      .then(function (response) {
        console.log('Update successful:', response);
        // Refresh the table data
        const api = table.current.dt();
        api.ajax.reload(null, false);
      })
      .catch(function (error) {
        console.error('Update failed:', error);
        alert('Failed to update data. Please try again.');
      });
  };

  return (
    <div className="main-content">
      <Container fluid className="relative">
        <Row className="mb-6">
          <div className="col-10 col-sm-10">
            <h1 className="text-2xl font-bold text-gray-800">Batch</h1>
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
                <Dropdown.Item href="#" onClick={PrintHandle}>Print</Dropdown.Item>         
                {user && (user.role==="admin" ) && <Dropdown.Item href="#" onClick={deleteHandle}>Delete</Dropdown.Item>}
                {user && ((user.role==="admin" ) || (user.role==="batchcomplete" )|| (user.role==="PA" ) || (user.role==="PM" )) && 
                  <Dropdown.Item href="#" onClick={completeHandle}>Complete</Dropdown.Item>}
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="ml-auto w-1/5">
            <Form.Select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 tsearch"
              value={searchState}
              onChange={handleColumnChange}
            >
              <option value="batchid">Batch No</option>
              <option value="greyid">Grey Entry No</option>
              <option value="customer">Customer</option>
            </Form.Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 relative bg-white">
          <DataTable 
            ref={table}
            options={{
              drawCallback: function(settings) {
                const api = this.api();
                const $body = $(api.table().body());
                
                // Remove any existing handlers
                $body.off('dblclick mousedown');
                
                // Prevent single clicks from interfering
                $body.on('mousedown', 'td', function(e) {
                  if (e.detail === 1) {
                    e.stopPropagation();
                  }
                });

                // Handle double-click only for Weight and GMeter columns
                $body.on('dblclick', 'td', function(e) {
                  const allowedRoles = ['admin', 'PA', 'editor'];
                  if (!allowedRoles.includes(user.role)) {
                    return; // Silently ignore if user doesn't have permission
                  }
                  
                  const cell = api.cell(this);
                  const columnIdx = cell.index().column;
                  if (columnIdx !== 11 && columnIdx !== 12) return;
                  e.preventDefault();
                  e.stopPropagation();
                  if (!$(this).hasClass('editing')) {
                    handleCellEdit(this);
                  }
                });
              },
              scrollX: true,
              scrollY: '60vh',
              scrollCollapse: true,
              fixedColumns: {
                left: 2
              },
              altEditor: true,
              onEditRow: function(datatable, rowdata, success, error) {
                const api = datatable.dt();                
                //const batchId = rowdata[4];
                const match =  rowdata[4].match(/data-pide="([^"]*)"/);
                const batchId = match ? match[1] : null;
                console.log('Editing row:', rowdata);
                
                axios.post(`${API_URL}/updateBatch`, {
                  batchId: batchId,
                  rowData: rowdata
                })
                .then(function (response) {
                  success(response);
                  api.ajax.reload();
                })
                .catch(function (error) {
                  error(error);
                  alert('Failed to update data');
                });
              },
              editable: {
                enable: true,
                mode: 'inline',
                submit: 'blur',
                onBlur: true
              },
              order: [[0, 'desc']],
              paging: true,
              processing: true,
              serverSide: true,
              select: { style: 'multi' },
              keys: true,
              editor: true,
              cellEdit: {
                enable: true,
                mode: 'click',
                blurToSave: true,
                beforeSave: (oldValue, newValue, row, column) => {
                  // Don't update if value hasn't changed
                  if (oldValue === newValue) return;
                  
                  // Don't allow empty values
                  if (newValue.trim() === '') {
                    alert('Empty values are not allowed');
                    return false;
                  }
                  
                  updateBatchData(row.data(), column.index(), newValue);
                }
              },
              ajax: {
                url: `${API_URL}/batches1`,
                type: 'POST',
                data: function (d) {
                  d.searchcol = $(".tsearch").val();
                   d.user = user.user; 
                  if (d.length === -1) {
                    d.length = 25;
                  }
                  return d;
                },
              },
              pageLength: 25,
              lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
              columns: [
                {
                    className: "",                   
                    data: "0",
                    defaultContent: "",
                    editable: false // Batch ID should not be editable
                },
                { data: "1" },
                { data: "2" },
                { data: "3" },
                { data: "4" },
                { data: "5" },
                { data: "6" },
                { data: "7" },
                { data: "8" },
                { data: "9" },
                { data: "10" },
                { 
                  data: "11",
                  className: "editable-cell",
                  createdCell: function(td, cellData, rowData, row, col) {
                    $(td).css('background-color', '#f8f9fa');
                  }
                },
                { 
                  data: "12",
                  className: "editable-cell",
                  createdCell: function(td, cellData, rowData, row, col) {
                    $(td).css('background-color', '#f8f9fa');
                  }
                },
                { data: "13" },
                { data: "14" },
                { data: "15" },
                { data: "16" },
                
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
              className: "w-full text-sm text-left text-gray-500",
              containerClassName: "relative z-10"
            }}
          >
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Batch.No</th>
                <th className="px-6 py-3">Batch Date</th>
                <th className="px-6 py-3">Sale Order.No</th>
                <th className="px-6 py-3">Inward No</th>
                <th className="px-6 py-3">Cust Dc</th>
                <th className="px-6 py-3">Machine</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Fabric</th>
                <th className="px-6 py-3">Shade</th>
                <th className="px-6 py-3">Construction</th>
                <th className="px-6 py-3">Width</th>
                <th className="px-6 py-3">Weight</th>
                <th className="px-6 py-3">GMeter</th>                   
                <th className="px-6 py-3">GLM</th>
                <th className="px-6 py-3">AGLM</th>
                <th className="px-6 py-3">Process</th>
                <th className="px-6 py-3">Finishing</th>
              </tr>
            </thead>
          </DataTable>
        </div>
      </Container>
    </div>
  );
}

export default Batch;
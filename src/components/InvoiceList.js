import React, { useRef, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../css/Styles.css';
import '../css/DataTable.css';
import DataTable from 'datatables.net-react';
import Select from 'datatables.net-select-dt';
import FixedHeader from 'datatables.net-fixedcolumns-dt';
import Responsive from 'datatables.net-responsive-dt';
import DT from 'datatables.net-dt';
import $ from 'jquery';

const API_URL = 'https://www.wynstarcreations.com/seyal/api';

DataTable.use(Responsive);
DataTable.use(Select);
DataTable.use(FixedHeader);
DataTable.use(DT);

const normalizeInvoiceRow = (row) => {
  if (!row) return {};
  if (Array.isArray(row)) {
    return {
      invoiceNo: row[0] || '',
      invoiceDate: row[1] || '',
      customer: row[2] || '',
      customerid: row[7] || '',
      subtotal: row[3] || '',
      tax: row[4] || '',
      total: row[5] || '',
      items: row[6] || []
    };
  }
  return {
    invoiceNo: row.invoiceNo || row.invNo || row.invoice_number || '',
    invoiceDate: row.invoiceDate || row.date || row.invDate || '',
    customer: row.customer || row.customerName || row.name || '',
    customerid: row.customerid || row.customerId || row.customer_id || row.customerID || '',
    subtotal: row.subtotal || row.subTotal || row.amount || '',
    tax: row.tax || row.totalTax || 0,
    total: row.total || row.totalAmount || '',
    items: Array.isArray(row.items) ? row.items : []
  };
};

export default function InvoiceList() {
  const tableRef = useRef();
  const navigate = useNavigate();

    const { user , isAuthenticated } = useAuth();

  useEffect(() => {
    const currentTable = tableRef.current;
    
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

  const handleView = (inv) => {
    const invoiceData = normalizeInvoiceRow(inv);
    navigate('/invoice', { state: invoiceData });
  };

  const handleDeleteRow = (rowNode) => {
    if (!window.confirm('Delete this invoice?')) return;
    const api = tableRef.current.dt();
    api.row(rowNode).remove().draw(false);
  };

  if (!isAuthenticated) {
        return null;
      // navigate('/login');  // Avoid rendering profile if the user is not authenticated
     }

  return (
    <div className="main-content">
      <Container fluid className="p-4">
        <Row className="mb-3">
          <Col>
            <h2>Invoices</h2>
          </Col>
   
        </Row>

        <div className="overflow-hidden rounded-lg border border-gray-200 relative bg-white">
          <DataTable
            ref={tableRef}
            options={{
              scrollX: true,
              scrollY: '60vh',
              scrollCollapse: true,
              fixedColumns: { left: 1 },
              order: [[0, 'desc']],
              paging: true,
              processing: true,
              serverSide: true,             
              pageLength: 25,
              ajax: {
                url: `${API_URL}/getInvoices`,
                type: 'POST',
                data: function (d) {
                  d.searchcol = $(".tsearch").val();
                  d.user = user.user;
                  if (d.length === -1) {
                    d.length = 25;
                  }
                  return d;
                },
                dataSrc: function (json) {
                  if (!json || !Array.isArray(json.data)) return [];
                  return json.data.map((row) => normalizeInvoiceRow(row));
                }
              },
              columns: [
                { title: 'Invoice No', data: 'invoiceNo' },
                { title: 'Date', data: 'invoiceDate' },
                { title: 'Customer', data: 'customer' },
                {
                  title: 'Subtotal',
                  data: 'subtotal'
                },
                {
                  title: 'Tax',
                  data: 'tax'
                },
                {
                  title: 'Total',
                  data: 'total'
                },
                {
                  title: 'Actions',
                  data: null,
                  orderable: false,
                  searchable: true,
                  render: () =>
                    '<button class="btn btn-sm btn-outline-primary view-btn mr-2">View/Edit</button>' +
                    '<button class="btn btn-sm btn-outline-danger delete-btn">Print</button>'
                }
              ],
              dom: '<"flex items-center justify-between mb-4"l<"ml-2"f>>rtip',
              language: {
                search: 'Search:',
                lengthMenu: 'Show _MENU_ entries',
                info: 'Showing _START_ to _END_ of _TOTAL_ entries',
                paginate: {
                  first: 'First',
                  last: 'Last',
                  next: 'Next',
                  previous: 'Previous'
                }
              },
              createdRow: function (row, data) {
                const $row = $(row);
                $row.find('.view-btn').off('click').on('click', function () {
                  handleView(data);
                });
                $row.find('.delete-btn').off('click').on('click', function () {
                  handleDeleteRow(row);
                });
              }
            }}
          />
        </div>
      </Container>
    </div>
  );
}

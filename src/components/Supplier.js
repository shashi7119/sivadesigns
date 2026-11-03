import React, { useState, useEffect, useRef } from "react";
import { Container, Button, Row, Modal, Form, Dropdown } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { PERMISSIONS } from "../constants/permissions";
import "../css/Styles.css";
import "../css/DataTable.css";
import axios from "axios";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import Select from "datatables.net-select-dt";

const API_URL = "https://www.wynstarcreations.com/seyal/api";

DataTable.use(DT);
DataTable.use(Select);

// Same fields as the customer master (without the ship-to addresses)
const createInitialFormData = () => ({
  ide: "",
  mname: "",
  contact_number: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  pincode: "",
  gstin: "",
});

const regexPatterns = {
  mname: /^[a-zA-Z0-9_@./#&+\-, ]*$/,
  contact_number: /^[0-9 ]*$/,
  email: /^[a-zA-Z0-9_@./#&+\-, ]*$/,
  address1: /^[a-zA-Z0-9_@./#&+\-, ]*$/,
  address2: /^[a-zA-Z0-9_@./#&+\-, ]*$/,
  city: /^[a-zA-Z0-9_@./#&+\-, ]*$/,
  state: /^[a-zA-Z0-9_@./#&+\-, ]*$/,
  pincode: /^[0-9 ]*$/,
  gstin: /^[a-zA-Z0-9]*$/,
};

const FIELDS = [
  { name: "mname", label: "Supplier Name", required: true },
  { name: "contact_number", label: "Contact Number", required: true },
  { name: "email", label: "Email" },
  { name: "address1", label: "Address 1", required: true },
  { name: "address2", label: "Address 2" },
  { name: "city", label: "City", required: true },
  { name: "state", label: "State", required: true },
  { name: "pincode", label: "Pincode", required: true },
  { name: "gstin", label: "GSTIN" },
];

function Supplier() {
  const table = useRef();
  const [formData, setFormData] = useState(createInitialFormData);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [show, setShow] = useState(false);
  const [reload, setReload] = useState(false);
  const { user, isAuthenticated, canAccess } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/getSuppliers`);
        const rows = Array.isArray(response.data) ? response.data : [];
        setTableData(
          rows.map((r) => [
            r.ide,
            r.name,
            r.contact_number,
            r.email,
            r.address1,
            r.address2,
            r.city,
            r.state,
            r.pincode,
            r.gstin,
            r.created_at,
          ]),
        );
      } catch (error) {
        console.log(error);
      }
    };
    user && fetchData();
  }, [reload, user]);

  if (!isAuthenticated) {
    return null;
  }

  const handleClose = () => {
    setIsEdit(false);
    setShow(false);
    setFormData(createInitialFormData());
  };

  const handleShow = (event) => {
    event.preventDefault();
    setIsEdit(false);
    setFormData(createInitialFormData());
    setShow(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    // keep only the characters allowed for this field
    if (regexPatterns[name] && !regexPatterns[name].test(value)) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const editHandle = (event) => {
    event.preventDefault();
    const rows = table.current.dt().rows({ selected: true }).data().toArray();
    if (rows.length === 0) {
      alert("Select entry for edit");
      return;
    }
    if (rows.length > 1) {
      alert("Not allowed multiple entries for edit");
      return;
    }
    const r = rows[0];
    setFormData({
      ide: r[0],
      mname: r[1] || "",
      contact_number: r[2] || "",
      email: r[3] || "",
      address1: r[4] || "",
      address2: r[5] || "",
      city: r[6] || "",
      state: r[7] || "",
      pincode: r[8] || "",
      gstin: r[9] || "",
    });
    setIsEdit(true);
    setShow(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const missing = FIELDS.filter(
      (f) => f.required && !String(formData[f.name] || "").trim(),
    );
    if (missing.length) {
      alert(`Please enter ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    try {
      await axios.post(`${API_URL}/saveSupplier`, formData);
      handleClose();
      setReload((prev) => !prev);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Supplier could not be saved");
    }
  };

  return (
    <div className="main-content">
      <Container fluid className="relative">
        <Row className="mb-6">
          <div className="col-10 col-sm-10">
            <h1 className="text-2xl font-bold text-gray-800">
              Supplier Master
            </h1>
            <p className="text-gray-600">Welcome, {user.user}!</p>
          </div>
        </Row>

        <div className="flex justify-end mb-4">
          <div className="col-2 col-sm-2">
            <Dropdown>
              <Dropdown.Toggle
                variant="primary"
                id="supplier-actions"
                className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Actions
              </Dropdown.Toggle>
              <Dropdown.Menu className="mt-2">
                {canAccess(PERMISSIONS.SUPPLIER_CREATE, ["admin", "PA", "SP1"]) && (
                  <Dropdown.Item href="#" onClick={handleShow}>
                    Add
                  </Dropdown.Item>
                )}
                {canAccess(PERMISSIONS.SUPPLIER_EDIT, ["admin", "PA", "SP1"]) && (
                  <Dropdown.Item href="#" onClick={editHandle}>
                    Edit
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 relative bg-white">
          <DataTable
            ref={table}
            data={tableData}
            options={{
              scrollX: true,
              scrollY: "60vh",
              scrollCollapse: true,
              order: [[10, "desc"]],
              select: true,
              paging: true,
              pageLength: 25,
              lengthMenu: [10, 25, 50, 100, 200],
              columnDefs: [{ targets: 0, visible: false }],
              dom: '<"flex items-center justify-between mb-4"l<"ml-2"f>>rtip',
              language: {
                paginate: {
                  first: "First",
                  last: "Last",
                  next: "Next",
                  previous: "Previous",
                },
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
              },
            }}
            className="display nowrap w-full text-sm text-left text-gray-500"
          >
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Id</th>
                <th className="px-6 py-3">Supplier</th>
                <th className="px-6 py-3">Contact Number</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Address 1</th>
                <th className="px-6 py-3">Address 2</th>
                <th className="px-6 py-3">City</th>
                <th className="px-6 py-3">State</th>
                <th className="px-6 py-3">Pincode</th>
                <th className="px-6 py-3">GSTIN</th>
                <th className="px-6 py-3">Created_At</th>
              </tr>
            </thead>
          </DataTable>
        </div>

        <Modal size="lg" show={show} onHide={handleClose} className="rounded-lg">
          <Modal.Header closeButton className="bg-gray-50 border-b border-gray-200">
            <Modal.Title className="text-xl font-semibold text-gray-800">
              {isEdit ? "Edit Supplier" : "Add Supplier"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-6">
            <Form>
              <div className="row">
                {FIELDS.map((f) => (
                  <Form.Group key={f.name} className="col-12 col-md-6 mb-3">
                    <Form.Label className="block text-sm font-medium text-gray-700">
                      {f.label}
                      {f.required && <span className="text-danger"> *</span>}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name={f.name}
                      value={formData[f.name]}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </Form.Group>
                ))}
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer className="bg-gray-50 border-t border-gray-200">
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}

export default Supplier;

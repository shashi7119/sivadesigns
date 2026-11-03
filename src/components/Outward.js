import React, { useState, useEffect, useRef, useMemo } from "react";
import { Container, Row, Dropdown, Modal, Form, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { PERMISSIONS } from "../constants/permissions";
import axios from "axios";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import Select from "datatables.net-select-dt";
import "../css/Styles.css";
import "../css/DataTable.css";
import logo from "../img/slogo.png";

const API_URL = "https://www.wynstarcreations.com/seyal/api";

DataTable.use(DT);
DataTable.use(Select);

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// "2026-11-02 10:15:00" -> "02-11-2026"
const formatDate = (value) => {
  const m = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : String(value || "");
};

const num = (value) => Number(value || 0);
const fmt = (value) => num(value).toFixed(2);
const dcLabel = (dcid) => (dcid ? `SDC-${dcid}` : "");

// Top filters - same as the Batch page, with Supplier in place of Machine
const emptyFilters = {
  fromDate: "",
  toDate: "",
  customer: "",
  supplier: "",
  fabric: "",
  shade: "",
  construction: "",
};

// masters come back as rows [id, name, ...] - dropdowns use the name
const toNames = (list) =>
  [...new Set((Array.isArray(list) ? list : []).map((r) => String(r?.[1] ?? "").trim()).filter(Boolean))];

const matchesFilters = (r, f) => {
  const day = String(r.outward_at || "").slice(0, 10);
  if (f.fromDate && day < f.fromDate) return false;
  if (f.toDate && day > f.toDate) return false;
  return ["customer", "supplier", "fabric", "shade", "construction"].every(
    (k) => !f[k] || String(r[k] ?? "").trim() === f[k],
  );
};

// Supplier DC print - same layout as the Delivery DC (job work delivery)
const buildSupplierDCHtml = (dc) => {
  const items = dc.items || [];
  const total = items.reduce(
    (t, it) => ({
      weight: t.weight + num(it.weight),
      gmeter: t.gmeter + num(it.gmeter),
      noofpcs: t.noofpcs + num(it.noofpcs),
    }),
    { weight: 0, gmeter: 0, noofpcs: 0 },
  );

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<title>${esc(dcLabel(dc.ide))}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
<style>
  body { margin: 0; padding: 10px; font-family: Arial, sans-serif; font-size: 12px; color: #181E29; }
  p { font-size: 12px; line-height: 18px; margin-bottom: 5px; }
  .hr { width: 100%; height: 1px; border-top: 1px solid #000; }
  .dc-table { width: 100%; border: 1px solid #364159; border-collapse: collapse; margin-top: 10px; }
  .dc-table th { background: #E6EBF7; color: #364159; font-weight: 600; padding: 6px; border: 1px solid #364159; text-align: center; }
  .dc-table td { padding: 6px; border: 1px solid #364159; font-weight: 600; color: #364159; }
  .dc-table td.num { text-align: right; }
  .dc-table tr.total td { font-weight: bold; }
  .dc-table thead { display: table-header-group; }
  .dc-table tr { break-inside: avoid; page-break-inside: avoid; }
  .sign { break-inside: avoid; page-break-inside: avoid; }
  @page { size: A4; margin: 10mm; }
</style></head>
<body><main>
  <div class="row">
    <div class="col-2"><img src="${logo}" style="width:100px"></div>
    <div class="col-10">
      <div class="row">
        <div class="col-12" style="text-align:center;font-size:25px;"><strong>SRI SHIVA DESIGNS</strong></div>
        <div class="col-12 mt-2" style="text-align:center;font-size:14px;">PLOT NO . G3, 4TH CROSS,SIPCOT INDUSTRIAL GROWTH CENTRE,PERUNDURAI,TAMILNADU,INDIA - 638052</div>
      </div>
      <div class="row mt-4">
        <div class="col-4" style="text-align:center;">Email : admin@srishivadesigns.com</div>
        <div class="col-4" style="text-align:center;">Mobile No: 9443029027</div>
        <div class="col-4" style="text-align:center;">GSTIN: 33AMEPP2435Q2ZP</div>
      </div>
    </div>
  </div>
  <div class="hr mt-1 mb-2"></div>
  <div class="row"><div class="col-12" style="text-align:center"><h3 class="px-2">JOB WORK OUTWARD - SUPPLIER DC</h3></div></div>
  <div class="hr mt-1 mb-0"></div>
  <div class="row">
    <div class="col-8" style="border-right:1px solid #000">
      <p><strong>To:</strong></p>
      <p>${esc(dc.name)}</p>
      <p>${esc(dc.address1)}</p>
      <p>${esc(dc.address2)}</p>
      <p>${esc(dc.city)} - ${esc(dc.pincode)}</p>
      <p>${esc(dc.state)}</p>
      <p><strong>GSTIN:</strong> ${esc(dc.gstin)}</p>
      <p><strong>Contact:</strong> ${esc(dc.contact_number)}</p>
    </div>
    <div class="col-4">
      <div class="row"><div class="col-5"><p>DC NO</p></div><div class="col-7"><p>: ${esc(dcLabel(dc.ide))}</p></div></div>
      <div class="row"><div class="col-5"><p>DC DATE</p></div><div class="col-7"><p>: ${esc(formatDate(dc.created_at))}</p></div></div>
      <div class="row"><div class="col-5"><p>Type of Job</p></div><div class="col-7"><p>: ${esc(dc.type)}</p></div></div>
      <div class="row"><div class="col-5"><p>No of Batches</p></div><div class="col-7"><p>: ${items.length}</p></div></div>
    </div>
  </div>
  <div class="hr mt-0 mb-0"></div>
  <table class="dc-table">
    <thead>
      <tr>
        <th>S.No</th><th>Batch No</th><th>Inward No</th><th>Party DC</th><th>Fabric</th><th>Shade</th>
        <th>Construction</th><th>Width</th><th>Weight</th><th>Meter</th><th>No Of Pcs</th>
      </tr>
    </thead>
    <tbody>
      ${items
        .map(
          (it, i) => `<tr>
        <td>${i + 1}</td>
        <td>${esc(it.batchid)}</td>
        <td>${esc(
          String(it.greyid || "")
            .split(",")
            .filter(Boolean)
            .map((g) => `IW${g}`)
            .join(", "),
        )}</td>
        <td>${esc(it.customerdc)}</td>
        <td>${esc(it.fabric)}</td>
        <td>${esc(it.shade)}</td>
        <td>${esc(it.construction)}</td>
        <td>${esc(it.width)}</td>
        <td class="num">${fmt(it.weight)}</td>
        <td class="num">${fmt(it.gmeter)}</td>
        <td class="num">${num(it.noofpcs)}</td>
      </tr>`,
        )
        .join("")}
      <tr class="total">
        <td colspan="8" style="text-align:right">Total</td>
        <td class="num">${fmt(total.weight)}</td>
        <td class="num">${fmt(total.gmeter)}</td>
        <td class="num">${total.noofpcs}</td>
      </tr>
    </tbody>
  </table>
  <div class="row mt-3">
    <div class="col-6"><p>Vehicle No : ${esc(dc.vehicleno)}</p></div>
    <div class="col-6"><p>Remarks : ${esc(dc.remarks)}</p></div>
  </div>
  <div class="row mt-5 sign" style="text-align:center">
    <div class="col-4"><p>Prepared by</p></div>
    <div class="col-4"><p>Checked by</p></div>
    <div class="col-4"><p>Received by</p></div>
  </div>
</main></body></html>`;
};

function Outward() {
  const table = useRef();
  const [rows, setRows] = useState([]);
  const [reload, setReload] = useState(false);
  const [showDC, setShowDC] = useState(false);
  // pides = the selected batch rows, batchids = their batch nos (for display)
  const [dcForm, setDcForm] = useState({ pides: [], batchids: [], vehicleno: "", remarks: "" });
  const [dcInfo, setDcInfo] = useState({ supplier: "", type: "" });
  const [saving, setSaving] = useState(false);
  // Inward from supplier - one batch row at a time (dyeing weight / meter belong to that row)
  const [showInward, setShowInward] = useState(false);
  const [inwardForm, setInwardForm] = useState(null);
  const { user, isAuthenticated, canAccess } = useAuth();

  const canCreateDC = canAccess(PERMISSIONS.SUPPLIER_DC_CREATE, ["admin", "PA", "PM"]);
  const canPrintDC = canAccess(PERMISSIONS.SUPPLIER_DC_PRINT, ["admin", "PA", "PM"]);
  const canInward = canAccess(PERMISSIONS.OUTWARD_INWARD, ["admin", "PA", "PM"]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/outwards`);
        setRows(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.log(error);
      }
    };
    user && fetchData();
  }, [reload, user]);

  const [filters, setFilters] = useState(emptyFilters);
  // the list only changes on Submit / Reset, like the Batch page
  const [submittedFilters, setSubmittedFilters] = useState(emptyFilters);

  const filteredRows = useMemo(
    () => rows.filter((r) => matchesFilters(r, submittedFilters)),
    [rows, submittedFilters],
  );

  // Filter dropdowns from the masters, same as the Batch page (supplier master in place of machine)
  const [filterOptions, setFilterOptions] = useState({
    customers: [],
    suppliers: [],
    fabrics: [],
    shades: [],
    constructions: [],
  });

  const fetchMastersData = async () => {
    try {
      const [customers, suppliers, fabrics, constructions, shades] = await Promise.all([
        fetch(`${API_URL}/getMasters?type=customer`).then((r) => r.json()),
        fetch(`${API_URL}/getSuppliers`).then((r) => r.json()),
        fetch(`${API_URL}/getMasters?type=fabric`).then((r) => r.json()),
        fetch(`${API_URL}/getMasters?type=construction`).then((r) => r.json()),
        fetch(`${API_URL}/getFilterMasters?type=shade`).then((r) => r.json()),
      ]);
      setFilterOptions({
        customers: toNames(customers),
        suppliers: (Array.isArray(suppliers) ? suppliers : [])
          .map((s) => String(s.name ?? "").trim())
          .filter(Boolean),
        fabrics: toNames(fabrics),
        shades: toNames(shades),
        constructions: toNames(constructions),
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMastersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fabric / shade / construction follow the selected customer
  useEffect(() => {
    if (!filters.customer) {
      return;
    }
    const fetchDependent = async () => {
      try {
        const params = `customer=${encodeURIComponent(filters.customer)}&fromDate=${encodeURIComponent(filters.fromDate)}&toDate=${encodeURIComponent(filters.toDate)}`;
        const [fabrics, shades, constructions] = await Promise.all([
          fetch(`${API_URL}/getFilterMasters?type=fabric&${params}`).then((r) => r.json()),
          fetch(`${API_URL}/getFilterMasters?type=shade&${params}`).then((r) => r.json()),
          fetch(`${API_URL}/getFilterMasters?type=construction&${params}`).then((r) => r.json()),
        ]);
        setFilterOptions((o) => ({
          ...o,
          fabrics: toNames(fabrics),
          shades: toNames(shades),
          constructions: toNames(constructions),
        }));
      } catch (e) {
        console.error(e);
      }
    };
    fetchDependent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.customer]);

  if (!isAuthenticated) {
    return null;
  }

  const handleFilterChange = (name, value) => {
    if (name === "customer") {
      setFilters((f) => ({ ...f, fabric: "", shade: "", construction: "", customer: value }));
      if (!value) fetchMastersData();
    } else {
      setFilters((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmitFilters = () => setSubmittedFilters(filters);

  const handleResetFilters = () => {
    setFilters(emptyFilters);
    setSubmittedFilters(emptyFilters);
    fetchMastersData();
  };

  const selectedRows = () =>
    table.current ? table.current.dt().rows({ selected: true }).data().toArray() : [];

  const createDCHandle = (event) => {
    event.preventDefault();
    const sel = selectedRows();
    if (sel.length === 0) {
      alert("Select the batches for the supplier DC");
      return;
    }
    const inwarded = sel.filter((r) => r.active !== "ow");
    if (inwarded.length) {
      alert(`Batch ${inwarded.map((r) => r.batchid).join(", ")} is already inwarded`);
      return;
    }
    const withDC = sel.filter((r) => r.dcid);
    if (withDC.length) {
      alert(
        `Batch ${withDC.map((r) => r.batchid).join(", ")} already has a supplier DC`,
      );
      return;
    }
    const first = sel[0];
    if (
      sel.some(
        (r) => r.supplier_id !== first.supplier_id || r.type !== first.type,
      )
    ) {
      alert("One DC can only have batches of the same supplier and job type");
      return;
    }
    setDcForm({
      pides: sel.map((r) => r.pide),
      batchids: [...new Set(sel.map((r) => r.batchid))],
      vehicleno: "",
      remarks: "",
    });
    setDcInfo({ supplier: first.supplier, type: first.type });
    setShowDC(true);
  };

  const printDC = async (dcid) => {
    try {
      const response = await axios.post(`${API_URL}/getSupplierDC`, { dcid });
      const newWindow = window.open("", "_blank");
      newWindow.document.write(buildSupplierDCHtml(response.data));
      newWindow.document.close();
      // wait for the logo and styles before printing (fallback if load already fired)
      let printed = false;
      const doPrint = () => {
        if (printed) return;
        printed = true;
        newWindow.print();
      };
      newWindow.onload = doPrint;
      setTimeout(doPrint, 1500);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Supplier DC not available");
    }
  };

  const saveDC = async () => {
    if (saving) return;
    try {
      setSaving(true);
      const response = await axios.post(`${API_URL}/addSupplierDC`, {
        pides: dcForm.pides,
        vehicleno: dcForm.vehicleno,
        remarks: dcForm.remarks,
        user: user.user,
      });
      setShowDC(false);
      setReload((r) => !r);
      if (window.confirm(`Supplier DC ${dcLabel(response.data.dcid)} created. Print now?`)) {
        printDC(response.data.dcid);
      }
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Supplier DC could not be created");
    } finally {
      setSaving(false);
    }
  };

  const inwardHandle = (event) => {
    event.preventDefault();
    const sel = selectedRows();
    if (sel.length === 0) {
      alert("Select the batch for inward");
      return;
    }
    if (sel.length > 1) {
      alert("Select only one batch for inward");
      return;
    }
    const r = sel[0];
    if (r.active !== "ow") {
      alert(`Batch ${r.batchid} is already inwarded`);
      return;
    }
    if (!r.dcid) {
      alert(`Create the supplier DC for batch ${r.batchid} before inward`);
      return;
    }
    setInwardForm({
      pide: r.pide,
      batchid: r.batchid,
      supplier: r.supplier,
      type: r.type,
      dcid: r.dcid,
      outWeight: r.weight,
      outGmeter: r.gmeter,
      weight: "",
      gmeter: "",
    });
    setShowInward(true);
  };

  const saveInward = async () => {
    if (saving || !inwardForm) return;
    const isDyeing = inwardForm.type === "Dyeing";
    if (isDyeing && (num(inwardForm.weight) <= 0 || num(inwardForm.gmeter) <= 0)) {
      alert("Enter the dyeing weight and dyeing meter");
      return;
    }
    try {
      setSaving(true);
      const response = await axios.post(`${API_URL}/markInward`, {
        pide: inwardForm.pide,
        weight: isDyeing ? inwardForm.weight : 0,
        gmeter: isDyeing ? inwardForm.gmeter : 0,
        user: user.user,
      });
      setShowInward(false);
      setReload((r) => !r);
      alert(
        response.data.deliveryid
          ? `Inward saved. Delivery DC ${response.data.deliveryid} created`
          : "Inward saved. Batch moved to finishing",
      );
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Inward could not be saved");
    } finally {
      setSaving(false);
    }
  };

  const printHandle = (event) => {
    event.preventDefault();
    const sel = selectedRows();
    const dcids = [...new Set(sel.map((r) => r.dcid).filter(Boolean))];
    if (sel.length === 0) {
      alert("Select a batch to print its supplier DC");
    } else if (dcids.length === 0) {
      alert("Supplier DC is not created for the selected batch");
    } else if (dcids.length > 1) {
      alert("Select batches of one supplier DC to print");
    } else {
      printDC(dcids[0]);
    }
  };

  return (
    <div className="main-content">
      <Container fluid className="relative">
        <Row className="mb-6">
          <div className="col-10 col-sm-10">
            <h1 className="text-2xl font-bold text-gray-800">Outward</h1>
            <p className="text-gray-600">
              Batches sent to suppliers for job work (Dyeing / Washing)
            </p>
          </div>
        </Row>

        {/* Filter Row */}
        <div className="row mb-3">
          <div className="col-md-2">
            <Form.Group>
              <Form.Label>From Date</Form.Label>
              <Form.Control
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              />
            </Form.Group>
          </div>
          <div className="col-md-2">
            <Form.Group>
              <Form.Label>To Date</Form.Label>
              <Form.Control
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
              />
            </Form.Group>
          </div>
        </div>
        <div className="row mb-3">
          {[
            ["customer", "Customer", filterOptions.customers],
            ["supplier", "Supplier", filterOptions.suppliers],
            ["fabric", "Fabric", filterOptions.fabrics],
            ["shade", "Shade", filterOptions.shades],
            ["construction", "Construction", filterOptions.constructions],
          ].map(([name, label, opts]) => (
            <div className="col-md-2" key={name}>
              <Form.Group>
                <Form.Label>{label}</Form.Label>
                <Form.Select
                  value={filters[name]}
                  onChange={(e) => handleFilterChange(name, e.target.value)}
                >
                  <option value="">All</option>
                  {opts.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          ))}
        </div>
        <div className="col-md-2 mb-5">
          <button className="btn btn-primary mr-3" onClick={handleSubmitFilters}>
            Submit
          </button>
          <button className="btn btn-secondary mr-3" onClick={handleResetFilters}>
            Reset
          </button>
        </div>

        <div className="flex justify-end mb-4">
          <div className="col-2 col-sm-2">
            <Dropdown>
              <Dropdown.Toggle
                variant="primary"
                id="outward-actions"
                className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Actions
              </Dropdown.Toggle>
              <Dropdown.Menu className="mt-2">
                {canCreateDC && (
                  <Dropdown.Item href="#" onClick={createDCHandle}>
                    Create Supplier DC
                  </Dropdown.Item>
                )}
                {canPrintDC && (
                  <Dropdown.Item href="#" onClick={printHandle}>
                    Print Supplier DC
                  </Dropdown.Item>
                )}
                {canInward && (
                  <Dropdown.Item href="#" onClick={inwardHandle}>
                    Inward
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 relative bg-white">
          <DataTable
            ref={table}
            data={filteredRows}
            options={{
              scrollX: true,
              scrollY: "60vh",
              scrollCollapse: true,
              order: [[0, "desc"]],
              select: { style: "multi" },
              // completed inward rows are shown in green
              createdRow: (tr, data) => {
                if (data.inward_at) tr.classList.add("outward-inward-done");
              },
              paging: true,
              pageLength: 25,
              lengthMenu: [10, 25, 50, 100, 200],
              columns: [
                { data: "outward_at", render: (d, type) => (type === "display" ? formatDate(d) : d) },
                { data: "batchid" },
                { data: "supplier", defaultContent: "" },
                { data: "type", defaultContent: "" },
                { data: "dcid", render: (d) => dcLabel(d) || '<span style="color:red">Pending</span>' },
                {
                  data: "inward_at",
                  render: (d, type) => {
                    const status = d ? "Inward done" : "At supplier";
                    if (type !== "display" || !d) return status;
                    return `<span style="color:#15803d;font-weight:600">${status}</span>`;
                  },
                },
                { data: "inward_at", render: (d, type) => (type === "display" ? formatDate(d) : d || "") },
                { data: "inward_weight", render: (d) => (d === null || d === undefined ? "" : fmt(d)) },
                { data: "inward_gmeter", render: (d) => (d === null || d === undefined ? "" : fmt(d)) },
                { data: "deliveryid", defaultContent: "" },
                {
                  data: "greyid",
                  render: (d) =>
                    String(d || "")
                      .split(",")
                      .filter(Boolean)
                      .map((g) => `IW${g}`)
                      .join(", "),
                },
                { data: "customerdc", defaultContent: "" },
                { data: "customer", defaultContent: "" },
                { data: "fabric", defaultContent: "" },
                { data: "shade", defaultContent: "" },
                { data: "construction", defaultContent: "" },
                { data: "width", defaultContent: "" },
                { data: "process", defaultContent: "" },
                { data: "weight", render: (d) => fmt(d) },
                { data: "gmeter", render: (d) => fmt(d) },
                { data: "noofpcs", render: (d) => num(d) },
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
                  previous: "Previous",
                },
              },
            }}
            className="display nowrap w-full text-sm text-left text-gray-500"
          >
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Outward Date</th>
                <th className="px-6 py-3">Batch No</th>
                <th className="px-6 py-3">Supplier</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Supplier DC</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Inward Date</th>
                <th className="px-6 py-3">Dyeing Weight</th>
                <th className="px-6 py-3">Dyeing Meter</th>
                <th className="px-6 py-3">Delivery DC</th>
                <th className="px-6 py-3">Inward No</th>
                <th className="px-6 py-3">Cust DC</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Fabric</th>
                <th className="px-6 py-3">Shade</th>
                <th className="px-6 py-3">Construction</th>
                <th className="px-6 py-3">Width</th>
                <th className="px-6 py-3">Process</th>
                <th className="px-6 py-3">Weight</th>
                <th className="px-6 py-3">GMeter</th>
                <th className="px-6 py-3">No Of Pcs</th>
              </tr>
            </thead>
          </DataTable>
        </div>

        <Modal show={showDC} onHide={() => setShowDC(false)}>
          <Modal.Header closeButton className="bg-gray-50 border-b border-gray-200">
            <Modal.Title className="text-xl font-semibold text-gray-800">
              Create Supplier DC
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <p className="mb-1">
              Supplier: <b>{dcInfo.supplier}</b>
            </p>
            <p className="mb-1">
              Type of Job: <b>{dcInfo.type}</b>
            </p>
            <p className="mb-3">
              Batch No: <b>{dcForm.batchids.join(", ")}</b> ({dcForm.pides.length} row
              {dcForm.pides.length === 1 ? "" : "s"})
            </p>
            <Form.Group className="mb-3">
              <Form.Label>Vehicle No</Form.Label>
              <Form.Control
                value={dcForm.vehicleno}
                onChange={(e) => setDcForm((f) => ({ ...f, vehicleno: e.target.value }))}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={dcForm.remarks}
                onChange={(e) => setDcForm((f) => ({ ...f, remarks: e.target.value }))}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="bg-gray-50 border-t border-gray-200">
            <Button variant="secondary" onClick={() => setShowDC(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={saveDC} disabled={saving}>
              {saving ? "Saving..." : "Create DC"}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showInward} onHide={() => setShowInward(false)}>
          <Modal.Header closeButton className="bg-gray-50 border-b border-gray-200">
            <Modal.Title className="text-xl font-semibold text-gray-800">
              Inward from Supplier
            </Modal.Title>
          </Modal.Header>
          {inwardForm && (
            <Modal.Body className="p-4">
              <p className="mb-1">
                Batch No: <b>{inwardForm.batchid}</b> ({dcLabel(inwardForm.dcid)})
              </p>
              <p className="mb-1">
                Supplier: <b>{inwardForm.supplier}</b>
              </p>
              <p className="mb-3">
                Sent: <b>{fmt(inwardForm.outWeight)} kg</b> / <b>{fmt(inwardForm.outGmeter)} m</b>
              </p>
              <Form.Group className="mb-3">
                <Form.Label>Type of Job</Form.Label>
                <Form.Control value={inwardForm.type} readOnly disabled />
              </Form.Group>
              {inwardForm.type === "Dyeing" ? (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Dyeing Weight (kg)<span className="text-danger"> *</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={inwardForm.weight}
                      onChange={(e) => setInwardForm((f) => ({ ...f, weight: e.target.value }))}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>
                      Dyeing Meter<span className="text-danger"> *</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={inwardForm.gmeter}
                      onChange={(e) => setInwardForm((f) => ({ ...f, gmeter: e.target.value }))}
                    />
                  </Form.Group>
                  <p className="mt-3 mb-0 text-gray-600">
                    A delivery entry is created with these values and the batch is marked as delivered.
                  </p>
                </>
              ) : (
                <p className="mb-0 text-gray-600">
                  The batch moves to finishing.
                </p>
              )}
            </Modal.Body>
          )}
          <Modal.Footer className="bg-gray-50 border-t border-gray-200">
            <Button variant="secondary" onClick={() => setShowInward(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={saveInward} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}

export default Outward;

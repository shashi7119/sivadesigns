import React, { useState, useRef } from "react";
import { Container, Row, Form, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import "../css/Styles.css";
import "../css/DataTable.css";
import "../css/Reports.css";
import DataTable from "datatables.net-react";
import Select from "datatables.net-select-dt";
import FixedHeader from "datatables.net-fixedcolumns-dt";
import Responsive from "datatables.net-responsive-dt";
import DT from "datatables.net-dt";
import MultiSelectFilter from "./MultiSelectFilter";

const API_URL = "https://www.wynstarcreations.com/seyal/api";

DataTable.use(Responsive);
DataTable.use(Select);
DataTable.use(FixedHeader);
DataTable.use(DT);

const emptyFilters = {
  fromDate: "",
  toDate: "",
  customer: "",
  machine: "",
  fabric: "",
  shade: [], // multi select
  construction: "",
};

const searchPlaceholders = {
  greyid: "Enter Inward No (e.g. IW1234 or 1234)",
  customerdc: "Enter Customer DC No",
  customer: "Enter Customer name",
};

// ---------- helpers for the table / detail HTML ----------

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// "2026-10-29 10:15:00" -> "29-10-2026"
const formatDate = (value) => {
  if (!value) return "-";
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : String(value);
};

const STATUS_LABEL = { done: "Done", partial: "Partly", pending: "Pending" };
const BATCH_STATUS = { a: "In process", f: "In finishing", dc: "Delivered" };

// Work out the status of every stage for one planning row
const getStages = (track) => {
  const t = track || {};
  const batches = t.batches || [];
  const deliveries = t.deliveries || [];
  const finished = batches.filter((b) => b.status === "f" || b.status === "dc");
  const invoiced = deliveries.filter((d) => (d.invoices || []).length > 0);
  const allBatchesDelivered =
    batches.length > 0 && batches.every((b) => b.status === "dc");

  return [
    { key: "inward", label: "Inward", status: "done" },
    { key: "plan", label: "Plan", status: "done" },
    {
      key: "batch",
      label: "Batch",
      status: batches.length ? "done" : "pending",
    },
    {
      key: "finishing",
      label: "Finishing",
      status: !finished.length
        ? "pending"
        : finished.length === batches.length
          ? "done"
          : "partial",
    },
    {
      key: "delivery",
      label: "Delivery",
      status: !deliveries.length
        ? "pending"
        : allBatchesDelivered
          ? "done"
          : "partial",
    },
    {
      key: "invoice",
      label: "Invoice",
      status: !invoiced.length
        ? "pending"
        : invoiced.length === deliveries.length
          ? "done"
          : "partial",
    },
  ];
};

const renderSteps = (track) => {
  const stages = getStages(track);
  const next = stages.find((s) => s.status !== "done");
  const nowText = !next
    ? "Completed"
    : next.status === "partial"
      ? `${next.label} in progress`
      : `Waiting for ${next.label}`;

  return `
    <div class="rp-steps">
      ${stages
        .map(
          (s, i) => `
        <div class="rp-step ${s.status}" title="${s.label}: ${STATUS_LABEL[s.status]}">
          <div class="rp-step-icon">${s.status === "done" ? "&#10003;" : i + 1}</div>
          <div>${s.label}</div>
        </div>`,
        )
        .join("")}
    </div>
    <div class="rp-now"><b>${esc(nowText)}</b></div>`;
};

const kv = (label, value) =>
  `<div class="rp-kv"><span>${esc(label)}</span><span>${esc(value === "" || value === null || value === undefined ? "-" : value)}</span></div>`;

const card = (stage, body) => `
  <div class="rp-card ${stage.status}">
    <h6>${esc(stage.label)} <span class="rp-badge ${stage.status}">${STATUS_LABEL[stage.status]}</span></h6>
    ${body}
  </div>`;

const emptyText = (text) => `<div class="rp-empty">${esc(text)}</div>`;

// Detail panel shown when a row is expanded: one card per stage
const renderDetail = (row) => {
  const track = row[17] || {};
  const batches = track.batches || [];
  const deliveries = track.deliveries || [];
  const finished = batches.filter((b) => b.status === "f" || b.status === "dc");
  const [inward, plan, batch, finishing, delivery, invoice] = getStages(track);

  const batchList = (list) =>
    list.length
      ? list
          .map(
            (b) => `<div class="rp-item">
              ${kv("Batch No", b.id)}
              ${kv(b.batch_plans > 1 ? "Weight (this plan)" : "Weight", b.weight)}
              ${kv(b.batch_plans > 1 ? "Meter (this plan)" : "Meter", b.gmeter)}
              ${
                // several plans joined into one batch - also show the whole batch
                b.batch_plans > 1
                  ? kv(
                      `Batch total (${b.batch_plans} plans)`,
                      `${b.batch_weight} kg / ${b.batch_gmeter} m`,
                    )
                  : ""
              }
              ${kv("Status", BATCH_STATUS[b.status] || b.status)}
            </div>`,
          )
          .join("")
      : emptyText("Pending");

  return `
    <div class="rp-detail">
      ${card(
        inward,
        kv("Inward No", row[1]) +
          kv("Inward Date", formatDate(track.inward_date)) +
          kv("Customer DC", row[2]),
      )}
      ${card(
        plan,
        kv("Plan No", row[0]) +
          kv("Plan Date", row[3]) +
          kv("Machine", row[4]) +
          kv("Width", row[9]) +
          kv("Weight", row[10]) +
          kv("Meter", row[11]),
      )}
      ${card(batch, batchList(batches))}
      ${card(finishing, batchList(finished))}
      ${card(
        delivery,
        deliveries.length
          ? deliveries
              .map(
                (d) => `<div class="rp-item">
                  ${kv("DC No", d.dcno)}
                  ${kv("DC Date", formatDate(d.date))}
                  ${kv("Weight", d.weight)}
                  ${kv("Meter", d.gmeter)}
                </div>`,
              )
              .join("")
          : emptyText("Pending"),
      )}
      ${card(
        invoice,
        deliveries.length
          ? deliveries
              .map(
                (d) => `<div class="rp-item">
                  ${kv("DC No", d.dcno)}
                  ${kv("Invoice", (d.invoices || []).length ? d.invoices.join(", ") : "Pending")}
                </div>`,
              )
              .join("")
          : emptyText("Pending - no DC yet"),
      )}
    </div>`;
};

// Consolidated totals of one inward, process stage wise (from the backend "summary")
// total = everything that passed through the stage, pending = the part still waiting at that stage
const SUMMARY_STAGES = [
  {
    key: "inward",
    label: "Inward",
    unit: "",
    pending: "toplan",
    pendingLabel: "Yet to plan",
  },
  {
    key: "planned_total",
    label: "Planned",
    unit: "plan",
    pending: "planned",
    pendingLabel: "Waiting for batch",
  },
  {
    key: "batch_total",
    label: "Batch",
    unit: "batch",
    pending: "batch",
    pendingLabel: "In process",
  },
  {
    key: "finishing_total",
    label: "Finishing",
    unit: "batch",
    pending: "finishing",
    pendingLabel: "Not yet delivered",
  },
  { key: "delivered", label: "Delivered", unit: "DC" },
  {
    key: "invoiced",
    label: "Invoiced",
    unit: "DC",
    pending: "invpending",
    pendingLabel: "Invoice pending",
  },
];

const fmtNum = (value) =>
  Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

function InwardSummary({ summary }) {
  return (
    <div className="rp-summary-card">
      <div className="rp-summary-head">
        {summary.greyid ? (
          <b>{summary.greyid}</b>
        ) : (
          <>
            <b>Search / filter result</b> ({summary.plans} plan
            {summary.plans === 1 ? "" : "s"} from {summary.inwards} inward
            {summary.inwards === 1 ? "" : "s"})
          </>
        )}{" "}
        - total quantity in each process
        {summary.invoices && summary.invoices.length > 0 && (
          <span className="rp-sub">
            {" "}
            (Invoices: {summary.invoices.join(", ")})
          </span>
        )}
      </div>
      <div className="rp-summary-row">
        {SUMMARY_STAGES.map((s) => {
          const v = summary[s.key] || {};
          const p = s.pending ? summary[s.pending] || {} : null;
          const empty =
            !Number(v.weight) && !Number(v.gmeter) && !Number(v.count);
          return (
            <div
              key={s.key}
              className={`rp-summary-cell${empty ? " is-empty" : ""}`}
            >
              <div className="rp-summary-label">{s.label}</div>
              <div className="rp-summary-weight">{fmtNum(v.weight)} kg</div>
              <div className="rp-sub">{fmtNum(v.gmeter)} m</div>
              {Number(v.pcs) > 0 && (
                <div className="rp-sub">{fmtNum(v.pcs)} pcs</div>
              )}
              {s.unit && (
                <div className="rp-sub">
                  {v.count || 0} {s.unit}
                  {v.count === 1 ? "" : "s"}
                </div>
              )}
              {p && (
                <div
                  className={`rp-summary-pending${Number(p.weight) > 0 ? " has-pending" : ""}`}
                >
                  {s.pendingLabel}: <b>{fmtNum(p.weight)} kg</b>
                  <span> / {fmtNum(p.gmeter)} m</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Reports() {
  const table = useRef();
  const submittedFiltersRef = useRef(emptyFilters);
  const searchColRef = useRef("greyid");

  const [searchCol, setSearchCol] = useState("greyid");
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [selData, setSelData] = useState([]);
  const [summary, setSummary] = useState(null);
  const { user, isAuthenticated } = useAuth();

  const [filters, setFilters] = useState(emptyFilters);

  const [options, setOptions] = useState({
    customers: [],
    machines: [],
    fabrics: [],
    shades: [],
    constructions: [],
  });

  const toOptions = (rows) =>
    (rows || []).map((row) => ({ id: row[0], name: row[1] }));

  // Fetch masters (all shades are listed by default)
  const fetchMastersData = async () => {
    try {
      const [customers, machines, fabrics, constructions, shades] =
        await Promise.all([
          fetch(`${API_URL}/getMasters?type=customer`).then((r) => r.json()),
          fetch(`${API_URL}/getMasters?type=machine`).then((r) => r.json()),
          fetch(`${API_URL}/getMasters?type=fabric`).then((r) => r.json()),
          fetch(`${API_URL}/getMasters?type=construction`).then((r) =>
            r.json(),
          ),
          fetch(`${API_URL}/getFilterMasters?type=shade`).then((r) => r.json()),
        ]);

      setOptions((o) => ({
        ...o,
        customers: toOptions(customers),
        machines: toOptions(machines),
        fabrics: toOptions(fabrics),
        shades: toOptions(shades),
        constructions: toOptions(constructions),
      }));
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchMastersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch fabric, shade, construction when customer changes
  React.useEffect(() => {
    if (!filters.customer) {
      return;
    }
    const fetchDependent = async () => {
      try {
        const params = `customer=${encodeURIComponent(filters.customer)}&fromDate=${encodeURIComponent(filters.fromDate)}&toDate=${encodeURIComponent(filters.toDate)}`;
        const [fabrics, shades, constructions] = await Promise.all([
          fetch(`${API_URL}/getFilterMasters?type=fabric&${params}`).then((r) =>
            r.json(),
          ),
          fetch(`${API_URL}/getFilterMasters?type=shade&${params}`).then((r) =>
            r.json(),
          ),
          fetch(`${API_URL}/getFilterMasters?type=construction&${params}`).then(
            (r) => r.json(),
          ),
        ]);
        setOptions((o) => ({
          ...o,
          fabrics: toOptions(fabrics),
          shades: toOptions(shades),
          constructions: toOptions(constructions),
        }));
      } catch (e) {
        console.error(e);
      }
    };
    fetchDependent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.customer]);

  const dtApi = () =>
    table.current && table.current.dt ? table.current.dt() : null;

  // Handle filter change (do not reload table)
  const handleFilterChange = (name, value) => {
    if (name === "customer") {
      setFilters((f) => ({
        ...f,
        fabric: "",
        shade: [],
        construction: "",
        customer: value,
      }));
      if (!value) fetchMastersData();
    } else {
      setFilters((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmitFilters = () => {
    submittedFiltersRef.current = filters;
    setActiveFilterCount(
      Object.values(filters).filter((v) =>
        Array.isArray(v) ? v.length > 0 : Boolean(v),
      ).length,
    );
    const api = dtApi();
    if (api) api.ajax.reload();
  };

  const handleResetFilters = () => {
    setFilters(emptyFilters);
    submittedFiltersRef.current = emptyFilters;
    setActiveFilterCount(0);
    fetchMastersData();
    const api = dtApi();
    if (api) api.ajax.reload();
  };

  // Search box (server side search on the chosen field)
  const runSearch = (text) => {
    const api = dtApi();
    if (api) api.search(text.trim()).draw();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    runSearch(searchText);
  };

  const handleClearSearch = () => {
    setSearchText("");
    runSearch("");
  };

  const handleSearchColChange = (e) => {
    searchColRef.current = e.target.value;
    setSearchCol(e.target.value);
  };

  if (!isAuthenticated) {
    console.log("not logged in");
    return null; // Avoid rendering profile if the user is not authenticated
  }

  const PrintHandle = (event) => {
    event.preventDefault();
    if (selData.length === 0) {
      alert("Tick the rows you want to print");
      return;
    }
    let api = table.current.dt();
    api.rows().deselect();
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
        <h1>Reports</h1>
        <table>
          <thead>
            <tr>
              <th>Plan.No</th>
        <th>Inward.No</th>
        <th>Cust.Dc</th>
                    <th>Date</th>
                    <th>Machine</th>
                    <th>Customer</th>
                    <th>Fabric</th>
                    <th>Shade</th>
                    <th>Construction</th>
                    <th>Width</th>
                    <th>Weight</th>
                    <th>GMeter</th>
                    <th >Inward Date</th>
                <th >Batch</th>
                <th >Finishing</th>
                <th >Delivery</th>
                <th >Invoice</th>
            </tr>
          </thead>
          <tbody>
            ${selData
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
                `,
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
    setSelData([]);
  };

  const rowClick = (e) => {
    let api = table.current.dt();
    let rows = api.rows({ selected: true }).data().toArray();
    let newSelData = [...selData];

    rows.forEach((value) => {
      if (!newSelData.some((existing) => existing[0] === value[0])) {
        newSelData.push(value);
      }
    });

    setSelData(newSelData);
  };

  // Open / close the stage details under a row
  const toggleDetail = (api, tr) => {
    const row = api.row(tr);
    if (!row.data()) return;
    if (row.child.isShown()) {
      row.child.hide();
    } else {
      row.child(renderDetail(row.data()), "rp-child").show();
      // lets the mobile card layout style the details row
      row.child().addClass("rp-child-row");
    }
  };

  return (
    <div className="main-content rp-page">
      <Container fluid className="relative">
        <Row className="mb-4">
          <div className="col-12 rp-title">
            <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
            <p className="text-gray-600">
              Track every inward from planning to invoice. Click a row to see
              all its details.
            </p>
          </div>
        </Row>

        {/* Search */}
        <div className="rp-search-card">
          <Form onSubmit={handleSearchSubmit}>
            <div className="rp-search-row">
              <Form.Select
                className="rp-search-by"
                value={searchCol}
                onChange={handleSearchColChange}
                aria-label="Search by"
              >
                <option value="greyid">Inward No</option>
                <option value="customerdc">Customer DC</option>
                <option value="customer">Customer</option>
              </Form.Select>
              <Form.Control
                className="rp-search-input"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={searchPlaceholders[searchCol]}
                autoFocus
              />
              <Button type="submit" variant="primary" className="px-4">
                Search
              </Button>
              {searchText && (
                <Button variant="outline-secondary" onClick={handleClearSearch}>
                  Clear
                </Button>
              )}
            </div>
          </Form>

          <div className="rp-toolbar">
            <Button
              variant={showFilters ? "secondary" : "outline-secondary"}
              size="sm"
              onClick={() => setShowFilters((s) => !s)}
              aria-expanded={showFilters}
            >
              {showFilters ? "Hide filters" : "More filters"}
              {activeFilterCount > 0 && ` (${activeFilterCount} active)`}
            </Button>
            <Button variant="outline-primary" size="sm" onClick={PrintHandle}>
              Print selected{selData.length > 0 && ` (${selData.length})`}
            </Button>
            <div className="rp-legend">
              <span>
                <i className="rp-dot done" /> Done
              </span>
              <span>
                <i className="rp-dot partial" /> Partly done
              </span>
              <span>
                <i className="rp-dot pending" /> Pending
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        {/* Rendered conditionally - react-bootstrap <Collapse> clashes with Tailwind's "collapse" class */}
        {showFilters && (
          <div>
            <div className="rp-filter-card">
              <div className="row g-3">
                <div className="col-6 col-md-2">
                  <Form.Group>
                    <Form.Label>From Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.fromDate}
                      onChange={(e) =>
                        handleFilterChange("fromDate", e.target.value)
                      }
                    />
                  </Form.Group>
                </div>
                <div className="col-6 col-md-2">
                  <Form.Group>
                    <Form.Label>To Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.toDate}
                      onChange={(e) =>
                        handleFilterChange("toDate", e.target.value)
                      }
                    />
                  </Form.Group>
                </div>
                <div className="col-6 col-md-2">
                  <Form.Group>
                    <Form.Label>Customer</Form.Label>
                    <Form.Control
                      list="customer-list"
                      value={filters.customer}
                      onChange={(e) =>
                        handleFilterChange("customer", e.target.value)
                      }
                      placeholder="Type to search..."
                      autoComplete="off"
                    />
                    <datalist id="customer-list">
                      {options.customers.map((opt) => (
                        <option key={opt.id || opt.name} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                    </datalist>
                  </Form.Group>
                </div>
                <div className="col-6 col-md-2">
                  <Form.Group>
                    <Form.Label>Machine</Form.Label>
                    <Form.Select
                      value={filters.machine}
                      onChange={(e) =>
                        handleFilterChange("machine", e.target.value)
                      }
                    >
                      <option value="">All</option>
                      {options.machines.map((opt) => (
                        <option key={opt.id || opt.name} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-6 col-md-2">
                  <Form.Group>
                    <Form.Label>Fabric</Form.Label>
                    <Form.Control
                      list="fabric-list"
                      value={filters.fabric}
                      onChange={(e) =>
                        handleFilterChange("fabric", e.target.value)
                      }
                      placeholder="Type to search..."
                      autoComplete="off"
                    />
                    <datalist id="fabric-list">
                      {options.fabrics.map((opt) => (
                        <option key={opt.id || opt.name} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                    </datalist>
                  </Form.Group>
                </div>
                <div className="col-6 col-md-2">
                  <Form.Group>
                    <Form.Label>Shade</Form.Label>
                    <MultiSelectFilter
                      options={options.shades}
                      value={filters.shade}
                      onChange={(list) => handleFilterChange("shade", list)}
                    />
                  </Form.Group>
                </div>
                <div className="col-6 col-md-2">
                  <Form.Group>
                    <Form.Label>Construction</Form.Label>
                    <Form.Control
                      list="construction-list"
                      value={filters.construction}
                      onChange={(e) =>
                        handleFilterChange("construction", e.target.value)
                      }
                      placeholder="Type to search..."
                      autoComplete="off"
                    />
                    <datalist id="construction-list">
                      {options.constructions.map((opt) => (
                        <option key={opt.id || opt.name} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                    </datalist>
                  </Form.Group>
                </div>
              </div>
              <div className="mt-3">
                <Button
                  variant="primary"
                  className="mr-3"
                  onClick={handleSubmitFilters}
                >
                  Apply filters
                </Button>
                <Button variant="secondary" onClick={handleResetFilters}>
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}

        {summary && <InwardSummary summary={summary} />}

        <div className="rp-table-wrap overflow-hidden rounded-lg border border-gray-200 relative bg-white p-2">
          <DataTable
            onSelect={rowClick}
            ref={table}
            className="display rp-table"
            options={{
              autoWidth: false,
              order: [[0, "desc"]],
              paging: true,
              processing: true,
              serverSide: true,
              select: { style: "multi", selector: "td:first-child" },
              ajax: {
                url: `${API_URL}/reports`,
                type: "POST",
                data: function (d) {
                  d.searchcol = searchColRef.current;
                  d.user = user.user; // send email
                  // Use submitted filters from ref
                  const f = submittedFiltersRef.current;
                  d.fromDate = f.fromDate || "";
                  d.toDate = f.toDate || "";
                  d.customer = f.customer || "";
                  d.machine = f.machine || "";
                  d.fabric = f.fabric || "";
                  d.shade = f.shade || []; // sent as shade[] - one or more shades
                  d.construction = f.construction || "";
                  if (d.length === -1) {
                    d.length = 25; // Set default page length
                  }
                  return d;
                },
                // backend sends "summary" when something is searched or filtered
                dataSrc: function (json) {
                  setSummary(json.summary || null);
                  return json.data;
                },
              },
              pageLength: 25,
              lengthMenu: [10, 25, 50, 100, 200],
              columns: [
                {
                  // Tick to select rows for print
                  data: null,
                  orderable: false,
                  render: DT.render.select(),
                  width: "24px",
                  className: "rp-col-select",
                },
                {
                  data: null,
                  className: "rp-col-inward",
                  render: (d, type, row) =>
                    `<div class="rp-inward">${esc(row[1])}</div>
                     <div class="rp-sub">Plan No ${esc(row[0])}</div>
                     <div class="rp-sub">Cust DC ${esc(row[2] || "-")}</div>`,
                },
                {
                  data: null,
                  render: (d, type, row) =>
                    `<div class="rp-main">${esc(row[3])}</div>
                     <div class="rp-sub">Inward ${esc(formatDate(row[17] && row[17].inward_date))}</div>`,
                },
                {
                  data: null,
                  render: (d, type, row) =>
                    `<div class="rp-main">${esc(row[5])}</div>
                     <div class="rp-sub">Machine ${esc(row[4] || "-")}</div>`,
                },
                {
                  data: null,
                  render: (d, type, row) =>
                    `<div class="rp-main">${esc(row[6])}</div>
                     <div class="rp-sub">Shade ${esc(row[7] || "-")}</div>
                     <div class="rp-sub">${esc(row[8] || "")}</div>`,
                },
                {
                  data: null,
                  render: (d, type, row) =>
                    `<div class="rp-main">${esc(row[10])} kg</div>
                     <div class="rp-sub">${esc(row[11])} m</div>
                     <div class="rp-sub">Width ${esc(row[9] || "-")}</div>`,
                },
                {
                  data: null,
                  orderable: false,
                  className: "rp-col-progress",
                  render: (d, type, row) => renderSteps(row[17]),
                },
                {
                  data: null,
                  orderable: false,
                  className: "rp-col-toggle",
                  render: () =>
                    `<button type="button" class="rp-toggle">Details</button>`,
                },
              ],
              // Labels shown above each value in the mobile card layout
              createdRow: function (tr) {
                const labels = [
                  "",
                  "",
                  "Plan Date",
                  "Customer",
                  "Fabric",
                  "Quantity",
                  "Progress",
                  "",
                ];
                tr.querySelectorAll("td").forEach((td, i) => {
                  if (labels[i]) td.setAttribute("data-label", labels[i]);
                });
              },
              pagingType: "simple_numbers",
              initComplete: function () {
                const api = this.api();
                // Click anywhere on a row (except the tick box) to open its details
                api.on("click", "tbody td:not(:first-child)", function () {
                  toggleDetail(api, this.closest("tr"));
                });
              },
              drawCallback: function () {
                // Searching one inward usually gives one row - open it straight away
                const api = this.api();
                if (api.rows().count() === 1 && api.search()) {
                  const tr = api.row(0).node();
                  if (tr && !api.row(0).child.isShown()) toggleDetail(api, tr);
                }
              },
              dom: '<"flex items-center justify-between mb-2"l>rtip',
              language: {
                lengthMenu: "Show _MENU_ entries",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                zeroRecords: "No matching records found",
                paginate: {
                  first: "First",
                  last: "Last",
                  next: "Next",
                  previous: "Previous",
                },
              },
            }}
          >
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th></th>
                <th>Inward / Plan</th>
                <th>Plan Date</th>
                <th>Customer</th>
                <th>Fabric</th>
                <th>Quantity</th>
                <th>Progress</th>
                <th></th>
              </tr>
            </thead>
          </DataTable>
        </div>
      </Container>
    </div>
  );
}

export default Reports;

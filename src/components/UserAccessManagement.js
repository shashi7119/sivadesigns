import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { PERMISSIONS } from "../constants/permissions";
import "../css/Styles.css";

const API_URL = "https://www.wynstarcreations.com/seyal/api";
const sortRoles = (roles) =>
  [...roles].sort((firstRole, secondRole) =>
    firstRole.localeCompare(secondRole, undefined, { sensitivity: "base" }),
  );

export const SCREEN_CATALOG = [
  {
    key: "home",
    label: "Dashboard",
    path: "/",
    permission: PERMISSIONS.HOME_VIEW,
  },
  {
    key: "planning",
    label: "Planning",
    path: "/planning",
    permission: PERMISSIONS.PLANNING_VIEW,
  },
  {
    key: "batch",
    label: "Batch",
    path: "/batch",
    permission: PERMISSIONS.BATCH_VIEW,
  },
  {
    key: "storeentry",
    label: "Store",
    path: "/storeentry",
    permission: PERMISSIONS.STOREENTRY_VIEW,
  },
  {
    key: "delivery",
    label: "Delivery",
    path: "/delivery",
    permission: PERMISSIONS.DELIVERY_VIEW,
  },
  {
    key: "invoice",
    label: "Invoice List",
    path: "/invoices",
    permission: PERMISSIONS.INVOICE_LIST_VIEW,
  },
  {
    key: "purchase-order",
    label: "Purchase Order",
    path: "/polist",
    permission: PERMISSIONS.PURCHASE_ORDER_LIST_VIEW,
  },
  {
    key: "reports",
    label: "Reports",
    path: "/reports",
    permission: PERMISSIONS.REPORTS_VIEW,
  },
  {
    key: "machine",
    label: "Machine",
    path: "/machine",
    permission: PERMISSIONS.MACHINE_VIEW,
  },
  {
    key: "user-management",
    label: "Users & Access",
    path: "/users/access",
    permission: PERMISSIONS.USER_MANAGEMENT_VIEW,
  },
  {
    key: "labentry",
    label: "Lab Entry",
    path: "/labentry",
    permission: PERMISSIONS.LABENTRY_VIEW,
  },
  {
    key: "greyentry",
    label: "Grey Entry",
    path: "/greyentry",
    permission: PERMISSIONS.GREYENTRY_VIEW,
  },
  {
    key: "pstock",
    label: "Planning Stock",
    path: "/pstock",
    permission: PERMISSIONS.PSTOCK_VIEW,
  },
  {
    key: "bstock",
    label: "Batch Stock",
    path: "/bstock",
    permission: PERMISSIONS.BSTOCK_VIEW,
  },
  {
    key: "users",
    label: "User List",
    path: "/users",
    permission: PERMISSIONS.USERS_VIEW,
  },
  {
    key: "customer",
    label: "Customer List",
    path: "/customers",
    permission: PERMISSIONS.CUSTOMER_LIST_VIEW,
  },
  {
    key: "fabric",
    label: "Fabric List",
    path: "/fabric",
    permission: PERMISSIONS.FABRIC_LIST_VIEW,
  },
  {
    key: "construction",
    label: "Construction List",
    path: "/constructions",
    permission: PERMISSIONS.CONSTRUCTION_LIST_VIEW,
  },
  {
    key: "vendor",
    label: "Vendor List",
    path: "/vendor",
    permission: PERMISSIONS.VENDOR_LIST_VIEW,
  },
  {
    key: "process",
    label: "Process List",
    path: "/process/",
    permission: PERMISSIONS.PROCESS_LIST_VIEW,
  },
  {
    key: "width",
    label: "Width List",
    path: "/width",
    permission: PERMISSIONS.WIDTH_LIST_VIEW,
  },
  {
    key: "sfinishing",
    label: "Finishing List",
    path: "/sfinishing",
    permission: PERMISSIONS.SFINISHING_VIEW,
  },
  {
    key: "finishing",
    label: "Bathc Finishing List",
    path: "/finishing",
    permission: PERMISSIONS.FINISHING_VIEW,
  },
  {
    key: "process-route",
    label: "Process Route",
    path: "/processroute",
    permission: PERMISSIONS.PROCESS_ROUTE_VIEW,
  },
  {
    key: "mrs",
    label: "MRS List",
    path: "/mrs",
    permission: PERMISSIONS.MRS_VIEW,
  },
];

export const ACTION_CATALOG = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
  { key: "print", label: "Print" },
  { key: "export", label: "Export" },
  { key: "complete", label: "Complete" },
  { key: "return", label: "Return" },
];

const ACTION_PERMISSION_OVERRIDES = {
  planning: {
    view: PERMISSIONS.PLANNING_VIEW,
    create: PERMISSIONS.PLANNING_CREATE,
    print: PERMISSIONS.PLANNING_PRINT,
    export: PERMISSIONS.PLANNING_EXPORT,
    delete: PERMISSIONS.PLANNING_DELETE,
  },
  batch: {
    create: PERMISSIONS.BATCH_CREATE,
    edit: PERMISSIONS.BATCH_EDIT_VIEW,
    print: PERMISSIONS.BATCH_PRINT_VIEW,
    export: PERMISSIONS.BATCH_EXPORT,
    delete: PERMISSIONS.BATCH_DELETE,
  },
  delivery: {
    view: PERMISSIONS.DELIVERY_VIEW,
    create: PERMISSIONS.DELIVERY_CREATE,
    delete: PERMISSIONS.DELIVERY_DELETE,
    print: PERMISSIONS.DELIVERY_PRINT,
    export: PERMISSIONS.DELIVERY_EXPORT,
  },
  invoice: {
    view: PERMISSIONS.INVOICE_LIST_VIEW,
    print: PERMISSIONS.INVOICE_PRINT,
    export: PERMISSIONS.INVOICE_EXPORT,
  },
  customer: {
    view: PERMISSIONS.CUSTOMER_LIST_VIEW,
    create: PERMISSIONS.CUSTOMER_CREATE,
    edit: PERMISSIONS.CUSTOMER_EDIT,
    delete: PERMISSIONS.CUSTOMER_DELETE,
    print: PERMISSIONS.CUSTOMER_PRINT,
    export: PERMISSIONS.CUSTOMER_EXPORT,
  },
  "purchase-order": {
    view: PERMISSIONS.PURCHASE_ORDER_LIST_VIEW,
    create: PERMISSIONS.PURCHASE_ORDER_VIEW,
    edit: PERMISSIONS.PURCHASE_ORDER_EDIT_VIEW,
    print: PERMISSIONS.PURCHASE_ORDER_PRINT_VIEW,
  },
  pstock: {
    view: PERMISSIONS.PSTOCK_VIEW,
    create: PERMISSIONS.PSTOCK_CREATE,
    print: PERMISSIONS.PSTOCK_PRINT,
    return: PERMISSIONS.PSTOCK_RETURN,
  },
  bstock: {
    view: PERMISSIONS.BSTOCK_VIEW,
    create: PERMISSIONS.BSTOCK_CREATE,
    edit: PERMISSIONS.BSTOCK_EDIT,
    delete: PERMISSIONS.BSTOCK_DELETE,
  },
  finishing: {
    view: PERMISSIONS.FINISHING_VIEW,
    create: PERMISSIONS.FINISHING_CREATE,
    print: PERMISSIONS.FINISHING_PRINT,
    delete: PERMISSIONS.FINISHING_DELETE,
    complete: PERMISSIONS.FINISHING_COMPLETE,
  },
  sfinishing: {
    view: PERMISSIONS.SFINISHING_VIEW,
  },
};

export const getPermissionCode = (screenKey, actionKey) =>
  ACTION_PERMISSION_OVERRIDES[screenKey]?.[actionKey] ||
  `${screenKey}.${actionKey}`;

export const buildDefaultAccessMatrix = () => {
  return SCREEN_CATALOG.reduce((accumulator, screen) => {
    accumulator[screen.key] = ACTION_CATALOG.reduce((actionMap, action) => {
      actionMap[action.key] = false;
      return actionMap;
    }, {});
    return accumulator;
  }, {});
};

const ROLE_ACCESS_PRESETS = {
  admin: "*",
  delivery: { delivery: ["view", "print", "export"], invoice: ["view"] },
  finishing: { finishing: ["view"], sfinishing: ["view"], batch: ["view"] },
  batch: { planning: ["view"], batch: ["view"] },
  store: { storeentry: ["view"] },
  purchase: { "purchase-order": ["view"], vendor: ["view"] },
  production: { planning: ["view"], batch: ["view"], process: ["view"] },
  grey: { greyentry: ["view"], batch: ["view"] },
  lab: { labentry: ["view"] },
  PA: {
    planning: ["view"],
    batch: ["view"],
    storeentry: ["view"],
    delivery: ["view"],
    invoice: ["view"],
    "purchase-order": ["view"],
    reports: ["view"],
    machine: ["view"],
    customer: ["view"],
    fabric: ["view"],
    construction: ["view"],
    vendor: ["view"],
    process: ["view"],
    width: ["view"],
    sfinishing: ["view"],
    finishing: ["view"],
    pstock: ["view"],
    bstock: ["view"],
    greyentry: ["view"],
    labentry: ["view"],
  },
  PM: {
    planning: ["view"],
    batch: ["view"],
    storeentry: ["view"],
    finishing: ["view"],
    reports: ["view"],
  },
  SP1: {
    planning: ["view"],
    batch: ["view"],
    finishing: ["view"],
    delivery: ["view"],
    greyentry: ["view"],
  },
  SP2: {
    planning: ["view"],
    batch: ["view"],
    labentry: ["view"],
    pstock: ["view"],
  },
  SP3: { batch: ["view"], delivery: ["view"], greyentry: ["view"] },
};

const buildRoleAccessMatrix = (role) => {
  const matrix = buildDefaultAccessMatrix();
  const preset = ROLE_ACCESS_PRESETS[role];

  if (preset === "*") {
    Object.keys(matrix).forEach((screenKey) => {
      Object.keys(matrix[screenKey]).forEach((actionKey) => {
        matrix[screenKey][actionKey] = true;
      });
    });
    return matrix;
  }

  Object.entries(preset || {}).forEach(([screenKey, actions]) => {
    actions.forEach((actionKey) => {
      if (matrix[screenKey]?.[actionKey] !== undefined) {
        matrix[screenKey][actionKey] = true;
      }
    });
  });

  return matrix;
};

const buildAccessMatrixFromPermissions = (permissions = []) => {
  const matrix = buildDefaultAccessMatrix();
  const permissionList = Array.isArray(permissions) ? permissions : [];

  const enablePermission = (permission) => {
    if (typeof permission !== "string" || !permission.trim()) {
      return;
    }

    const normalizedPermission = permission.trim();
    if (normalizedPermission.endsWith(".*")) {
      const screenKey = normalizedPermission.replace(/\.\*$/, "");
      if (matrix[screenKey]) {
        Object.keys(matrix[screenKey]).forEach((actionKey) => {
          matrix[screenKey][actionKey] = true;
        });
      }
      return;
    }

    SCREEN_CATALOG.forEach((screen) => {
      ACTION_CATALOG.forEach((action) => {
        if (
          getPermissionCode(screen.key, action.key) === normalizedPermission
        ) {
          matrix[screen.key][action.key] = true;
        }
      });
    });
  };

  permissionList.forEach((permission) => {
    if (permission && typeof permission === "object") {
      const screenKey = permission.screen || permission.key;
      if (screenKey && Array.isArray(permission.actions) && matrix[screenKey]) {
        permission.actions.forEach((actionKey) => {
          if (matrix[screenKey][actionKey] !== undefined) {
            matrix[screenKey][actionKey] = true;
          }
        });
        return;
      }
      enablePermission(
        permission.code ||
          permission.permission ||
          permission.name ||
          permission.key,
      );
      return;
    }

    enablePermission(permission);
  });

  return matrix;
};

const extractRoleNames = (payload) => {
  const candidates = [
    payload?.roles,
    payload?.data?.roles,
    payload?.data,
    payload,
  ];
  const roles = candidates.find(Array.isArray) || [];

  return roles
    .map((role) =>
      typeof role === "string"
        ? role
        : role?.role || role?.name || role?.value || "",
    )
    .map((role) => role.trim())
    .filter(Boolean);
};

function UserAccessManagement() {
  const { canAccess } = useAuth();
  const canCreateUsers = canAccess(PERMISSIONS.USER_MANAGEMENT_CREATE, [
    "admin",
  ]);
  const canAssignAccess = canAccess(PERMISSIONS.USER_ACCESS_ASSIGN, ["admin"]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roles: "",
  });
  const [roleOptions, setRoleOptions] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [accessMatrix, setAccessMatrix] = useState(buildDefaultAccessMatrix());
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await axios.get(`${API_URL}/get_roles`);
        setRoleOptions(
          sortRoles([...new Set(extractRoleNames(response.data))]),
        );
      } catch (loadRolesError) {
        setRoleOptions([]);
      }
    };

    loadRoles();
  }, []);

  const selectedPermissionCount = useMemo(() => {
    return Object.values(accessMatrix).reduce((total, actionMap) => {
      const enabledCount = Object.values(actionMap).filter(Boolean).length;
      return total + enabledCount;
    }, 0);
  }, [accessMatrix]);

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applyRole = async (role) => {
    setSelectedRole(role);
    setFormData((prev) => ({ ...prev, roles: role }));
    setAccessMatrix(buildRoleAccessMatrix(role));

    try {
      const response = await axios.post(`${API_URL}/get_role_permissions`, {
        role,
      });
      const rolePermissions =
        response.data?.permissions ??
        response.data?.data?.permissions ??
        response.data?.access;
      if (Array.isArray(rolePermissions)) {
        setAccessMatrix(buildAccessMatrixFromPermissions(rolePermissions));
      }
    } catch (rolePermissionError) {
      // The built-in role preset remains active until the role-permissions API is available.
    }
  };

  const onRoleChange = (event) => {
    const role = event.target.value;
    if (role === "__add_role__") {
      setIsAddingRole(true);
      return;
    }

    setIsAddingRole(false);
    void applyRole(role);
  };

  const addCustomRole = async () => {
    const role = newRoleName.trim();
    if (!role) {
      return;
    }

    try {
      await axios.post(`${API_URL}/create_role`, { role });
      setRoleOptions((previousRoles) =>
        sortRoles([...new Set([...previousRoles, role])]),
      );
      setNewRoleName("");
      setIsAddingRole(false);
      void applyRole(role);
    } catch (createRoleError) {
      setError(
        "Unable to add role. Please check the create_role API endpoint.",
      );
    }
  };

  const onActionToggle = (screenKey, actionKey) => {
    if (!canAssignAccess) {
      return;
    }

    setAccessMatrix((prev) => ({
      ...prev,
      [screenKey]: {
        ...prev[screenKey],
        [actionKey]: !prev[screenKey][actionKey],
      },
    }));
  };

  const onToggleAllActionsForScreen = (screenKey) => {
    if (!canAssignAccess) {
      return;
    }

    setAccessMatrix((prev) => {
      const currentRow = prev[screenKey];
      const shouldEnableAll = Object.values(currentRow).some((value) => !value);
      const nextRow = Object.keys(currentRow).reduce((accumulator, key) => {
        accumulator[key] = shouldEnableAll;
        return accumulator;
      }, {});

      return {
        ...prev,
        [screenKey]: nextRow,
      };
    });
  };

  const buildPayload = () => {
    const roles = formData.roles
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean);

    const screenAccess = SCREEN_CATALOG.map((screen) => {
      const actions = ACTION_CATALOG.filter(
        (action) => accessMatrix[screen.key][action.key],
      ).map((action) => action.key);

      return {
        screen: screen.key,
        route: screen.path,
        actions,
      };
    }).filter((entry) => entry.actions.length > 0);

    return {
      user: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        roles,
      },
      permissions: screenAccess.flatMap(({ screen, actions }) =>
        actions.map((action) => getPermissionCode(screen, action)),
      ),
      access: screenAccess,
    };
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      roles: "",
    });
    setAccessMatrix(buildDefaultAccessMatrix());
    setSelectedRole("");
    setNewRoleName("");
    setIsAddingRole(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!canCreateUsers) {
      setError("You do not have permission to create users.");
      return;
    }

    const payload = buildPayload();

    if (
      !payload.user.name ||
      !payload.user.email ||
      !payload.user.password ||
      !payload.user.roles.length
    ) {
      setError("Name, email, password, and role are required.");
      return;
    }

    if (!canAssignAccess) {
      payload.access = [];
    }

    setIsSaving(true);

    try {
      try {
        await axios.post(`${API_URL}/create_with_access`, payload);
      } catch (primaryError) {
        if (primaryError?.response?.status === 404) {
          await axios.post(`${API_URL}/users`, payload);
        } else {
          throw primaryError;
        }
      }

      setMessage("User created with role and screen access successfully.");
      resetForm();
    } catch (submitError) {
      const backendMessage =
        submitError?.response?.data?.message ||
        submitError?.response?.data?.error ||
        "Unable to create user. Please check backend API and payload mapping.";
      setError(backendMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="main-content">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-0 py-3">
          <h4 className="mb-1">Users and Access Control</h4>
          <p className="text-muted mb-0">
            Create users and assign screen-level action permissions.
          </p>
        </Card.Header>
        <Card.Body>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="userName">
                  <Form.Label>User Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onInputChange}
                    placeholder="Enter full name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="userEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onInputChange}
                    placeholder="user@example.com"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="userPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={onInputChange}
                    placeholder="Set a temporary password"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="userRoles">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={isAddingRole ? "__add_role__" : selectedRole}
                    onChange={onRoleChange}
                  >
                    <option value="">Select a role</option>
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                    <option value="__add_role__">+ Add new role...</option>
                  </Form.Select>
                  {isAddingRole && (
                    <div className="d-flex gap-2 mt-2">
                      <Form.Control
                        type="text"
                        value={newRoleName}
                        onChange={(event) => setNewRoleName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            addCustomRole();
                          }
                        }}
                        placeholder="Enter new role name"
                      />
                      <Button
                        type="button"
                        variant="outline-primary"
                        onClick={addCustomRole}
                      >
                        Add
                      </Button>
                    </div>
                  )}
                  <Form.Text className="text-muted">
                    Selecting a role applies its default access. You can adjust
                    the access matrix before saving.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">Screen Access Matrix</h5>
              <Badge bg="secondary">
                Selected Actions: {selectedPermissionCount}
              </Badge>
            </div>

            {!canAssignAccess && (
              <Alert variant="warning" className="py-2">
                Your account can create users but cannot assign custom screen
                actions.
              </Alert>
            )}

            <div className="table-responsive border rounded mb-4">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ minWidth: "220px" }}>Screen</th>
                    {ACTION_CATALOG.map((action) => (
                      <th key={action.key} className="text-center">
                        {action.label}
                      </th>
                    ))}
                    <th className="text-center">Quick</th>
                  </tr>
                </thead>
                <tbody>
                  {SCREEN_CATALOG.map((screen) => (
                    <tr key={screen.key}>
                      <td>
                        <div className="fw-semibold">{screen.label}</div>
                        <small className="text-muted">{screen.path}</small>
                      </td>
                      {ACTION_CATALOG.map((action) => (
                        <td
                          key={`${screen.key}-${action.key}`}
                          className="text-center"
                        >
                          <Form.Check
                            type="checkbox"
                            checked={accessMatrix[screen.key][action.key]}
                            onChange={() =>
                              onActionToggle(screen.key, action.key)
                            }
                            disabled={!canAssignAccess}
                          />
                        </td>
                      ))}
                      <td className="text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() =>
                            onToggleAllActionsForScreen(screen.key)
                          }
                          disabled={!canAssignAccess}
                        >
                          Toggle All
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="d-flex gap-2">
              <Button type="submit" disabled={isSaving || !canCreateUsers}>
                {isSaving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  "Create User With Access"
                )}
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={resetForm}
                disabled={isSaving}
              >
                Reset
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default UserAccessManagement;

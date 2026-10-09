import React, { useCallback, useState } from "react";
import axios from "axios";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Table,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PERMISSIONS } from "../constants/permissions";
import "../css/Styles.css";
import "../css/DataTable.css";
import DataTable from "datatables.net-react";
import {
  ACTION_CATALOG,
  SCREEN_CATALOG,
  buildDefaultAccessMatrix,
  getPermissionCode,
} from "./UserAccessManagement";
import Select from "datatables.net-select-dt";
import FixedHeader from "datatables.net-fixedcolumns-dt";
import Responsive from "datatables.net-responsive-dt";
import DT from "datatables.net-dt";
import $ from "jquery";

const API_URL = "https://www.wynstarcreations.com/seyal/api";

DataTable.use(Responsive);
DataTable.use(Select);
DataTable.use(FixedHeader);
DataTable.use(DT);

const USER_UPDATE_ENDPOINTS = () => [
  { method: "post", url: `${API_URL}/update_user` },
];

const USER_PERMISSION_ENDPOINTS = (username) => [
  {
    method: "post",
    url: `${API_URL}/get_user_permissions`,
    data: { username },
  },
  { method: "post", url: `${API_URL}/user_permissions`, data: { username } },
  {
    method: "get",
    url: `${API_URL}/get_user_permissions`,
    params: { username },
  },
];

const extractPermissionList = (payload) => {
  if (!payload) {
    return [];
  }

  const directCandidates = [
    payload.permissions,
    payload.data?.permissions,
    payload.user?.permissions,
    payload.result?.permissions,
    payload.access,
    payload.data?.access,
  ];

  for (const candidate of directCandidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  if (typeof payload === "string") {
    return payload
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const nestedData = payload.data;
  if (Array.isArray(nestedData)) {
    return nestedData;
  }

  return [];
};

const toList = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const toText = (value) => toList(value).join(", ");

const getUserId = (user) =>
  user?.id ?? user?._id ?? user?.userId ?? user?.userid ?? user?.email ?? "";

const getUserName = (user) =>
  user?.username ?? user?.fullName ?? user?.name ?? "";

const getUserEmail = (user) => user?.email ?? "";

const getUserRoles = (user) =>
  toList(user?.roles ?? user?.role ?? user?.userRoles ?? user?.group ?? []);

const getUserPermissions = (user) =>
  toList(
    user?.permissions ?? user?.access ?? user?.scopes ?? user?.scope ?? [],
  );

const getUserStatus = (user) => {
  if (typeof user?.active === "boolean") {
    return user.active;
  }

  if (typeof user?.status === "string") {
    return ["active", "enabled", "yes"].includes(user.status.toLowerCase());
  }

  return true;
};

function UsersList() {
  const { canAccess } = useAuth();
  const canEditUsers = canAccess(PERMISSIONS.USER_MANAGEMENT_EDIT, ["admin"]);
  const canManageUsers = [
    PERMISSIONS.USER_MANAGEMENT_CREATE,
    PERMISSIONS.USER_MANAGEMENT_EDIT,
    PERMISSIONS.USER_ACCESS_ASSIGN,
  ].some((permission) => canAccess(permission, ["admin"]));

  const [searchState, setSearchState] = useState("");

  const handleColumnChange = (e) => {
    setSearchState(e.target.value);
  };

  const [users, setUsers] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [tableVersion, setTableVersion] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [accessMatrix, setAccessMatrix] = useState(buildDefaultAccessMatrix());
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    roles: "",
    password: "",
    active: true,
  });

  const normalizeAccessMatrix = useCallback((permissions = []) => {
    const matrix = buildDefaultAccessMatrix();
    const permissionList = Array.isArray(permissions) ? permissions : [];

    const enablePermission = (permission) => {
      if (typeof permission !== "string") {
        return;
      }

      const normalizedPermission = permission.trim();
      if (!normalizedPermission) {
        return;
      }

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
        const actions = permission.actions;

        if (screenKey && Array.isArray(actions) && matrix[screenKey]) {
          actions.forEach((actionKey) => {
            if (ACTION_CATALOG.some((action) => action.key === actionKey)) {
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

      if (typeof permission !== "string") {
        return;
      }

      enablePermission(permission);
    });

    return matrix;
  }, []);

  const openEditModal = useCallback(
    async (user) => {
      const baseUserName = getUserEmail(user) || getUserId(user);
      const fallbackPermissions = getUserPermissions(user);

      setSelectedUser(user);
      setEditForm({
        name: getUserName(user),
        email: getUserEmail(user),
        roles: toText(getUserRoles(user)),
        password: "",
        active: getUserStatus(user),
      });
      setAccessMatrix(normalizeAccessMatrix(fallbackPermissions));
      setError("");
      setSuccess("");
      setIsEditOpen(true);

      if (!baseUserName) {
        return;
      }

      setIsLoadingPermissions(true);

      try {
        let backendPermissions = [];

        for (const endpoint of USER_PERMISSION_ENDPOINTS(baseUserName)) {
          try {
            const response = await axios({
              method: endpoint.method,
              url: endpoint.url,
              ...(endpoint.method.toLowerCase() === "get" && endpoint.params
                ? { params: endpoint.params }
                : {}),
              ...(endpoint.method.toLowerCase() === "post"
                ? { data: endpoint.data ?? {} }
                : {}),
              ...(endpoint.method.toLowerCase() === "get" && endpoint.data
                ? { data: endpoint.data }
                : {}),
            });

            const permissionList = extractPermissionList(response.data);
            if (permissionList.length > 0) {
              backendPermissions = permissionList;
              break;
            }
          } catch (requestError) {
            const statusCode = requestError?.response?.status;
            if (statusCode && ![404, 405, 400].includes(statusCode)) {
              throw requestError;
            }
          }
        }

        if (backendPermissions.length > 0) {
          setAccessMatrix(normalizeAccessMatrix(backendPermissions));
        }
      } catch (permissionError) {
        setError(
          permissionError?.response?.data?.message ||
            permissionError?.response?.data?.error ||
            "Unable to load the user permissions from the backend.",
        );
      } finally {
        setIsLoadingPermissions(false);
      }
    },
    [normalizeAccessMatrix],
  );

  const closeEditModal = () => {
    setIsEditOpen(false);
    setSelectedUser(null);
    setAccessMatrix(buildDefaultAccessMatrix());
    setEditForm({
      name: "",
      email: "",
      roles: "",
      password: "",
      active: true,
    });
  };

  const onEditChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTableActionClick = useCallback(
    (event) => {
      const actionButton = event.target.closest("[data-edit-user]");
      if (!actionButton) {
        return;
      }

      const userId = actionButton.dataset.editUser;
      const rowUser = users.find(
        (user) => String(getUserId(user)) === String(userId),
      );
      if (rowUser) {
        openEditModal(rowUser);
      }
    },
    [users, openEditModal],
  );

  const onAccessToggle = (screenKey, actionKey) => {
    setAccessMatrix((prev) => ({
      ...prev,
      [screenKey]: {
        ...prev[screenKey],
        [actionKey]: !prev[screenKey][actionKey],
      },
    }));
  };

  const onToggleAllActionsForScreen = (screenKey) => {
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

  const buildSelectedPermissions = () => {
    return SCREEN_CATALOG.flatMap((screen) => {
      return ACTION_CATALOG.filter(
        (action) => accessMatrix[screen.key]?.[action.key],
      ).map((action) => getPermissionCode(screen.key, action.key));
    });
  };

  const buildUpdatePayloads = () => {
    const username = getUserId(selectedUser) || "";
    const rolesList = toList(editForm.roles);
    const permissionsList = buildSelectedPermissions();
    const accessList = SCREEN_CATALOG.map((screen) => {
      const actions = ACTION_CATALOG.filter(
        (action) => accessMatrix[screen.key]?.[action.key],
      ).map((action) => action.key);

      return {
        screen: screen.key,
        route: screen.path,
        actions,
      };
    });

    const flatPayload = {
      id: username,
      username,
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      role: rolesList[0] || "user",
      roles: rolesList,
      permissions: permissionsList,
      access: accessList,
      active: editForm.active,
      status: editForm.active ? "active" : "inactive",
    };

    if (editForm.password.trim()) {
      flatPayload.password = editForm.password.trim();
    }

    const accessPayload = {
      user: {
        id: username,
        username,
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: rolesList[0] || "user",
        roles: rolesList,
        active: editForm.active,
        status: editForm.active ? "active" : "inactive",
        ...(editForm.password.trim()
          ? { password: editForm.password.trim() }
          : {}),
      },
      access: accessList,
      permissions: permissionsList,
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      roles: rolesList,
      active: editForm.active,
    };

    return {
      legacy: flatPayload,
      access: accessPayload,
    };
  };

  const submitEdit = async (event) => {
    event.preventDefault();

    if (!selectedUser || !canEditUsers) {
      return;
    }

    const userId = getUserId(selectedUser);

    if (!userId) {
      setError("Selected user is missing an identifier.");
      return;
    }

    const { legacy, access } = buildUpdatePayloads();

    if (!legacy.name || !legacy.email) {
      setError("Name and email are required.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      let updated = null;

      for (const endpoint of USER_UPDATE_ENDPOINTS()) {
        const payload = {
          ...legacy,
          permissions: access.permissions,
          access: access.access,
        };

        try {
          const response = await axios[endpoint.method](endpoint.url, payload);

          updated = response.data;
          break;
        } catch (requestError) {
          const statusCode = requestError?.response?.status;

          if (statusCode && ![404, 405, 400].includes(statusCode)) {
            throw requestError;
          }
        }
      }

      const mergedUser = {
        ...selectedUser,
        ...(legacy || {}),
        ...(access || {}),
        ...(updated && typeof updated === "object" ? updated : {}),
      };

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          String(getUserId(user)) === String(userId) ? mergedUser : user,
        ),
      );

      setSuccess("User updated successfully.");
      setTableVersion((version) => version + 1);

      closeEditModal();

      window.location.reload();
    } catch (updateError) {
      setError(
        updateError?.response?.data?.message ||
          updateError?.response?.data?.error ||
          "Unable to update user. Check the backend update endpoint.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // rest of your existing code...

  return (
    <div className="main-content">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-0 py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h4 className="mb-1">Users</h4>
              <p className="text-muted mb-0">
                View users, manage their permissions, and edit account details.
              </p>
            </div>
            {canManageUsers && (
              <Button as={Link} to="/users/access" variant="outline-primary">
                Manage User Access
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="mb-3">
            <Col md={4}>
              <Card className="border-0 bg-light h-100">
                <Card.Body>
                  <div className="text-muted small text-uppercase mb-1">
                    Users loaded
                  </div>
                  <div className="fs-3 fw-bold">{userCount}</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={8}>
              <Card className="border-0 bg-light h-100">
                <Card.Body>
                  <div className="text-muted small text-uppercase mb-1">
                    Edit permissions
                  </div>
                  <div className="fw-semibold">
                    {canEditUsers
                      ? "You can edit users and their permissions."
                      : "You can only view the users list."}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="ml-auto w-1/5">
            <Form.Select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 tsearch"
              value={searchState}
              onChange={handleColumnChange}
            >
              <option value="name">DC No</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
            </Form.Select>
          </div>

          <div
            className="overflow-hidden rounded-lg border border-gray-200 relative bg-white"
            onClick={handleTableActionClick}
          >
            <DataTable
              key={tableVersion}
              options={{
                scrollX: true,
                scrollY: "60vh",
                scrollCollapse: true,
                fixedColumns: {
                  left: 1,
                },
                ordering: true,
                paging: true,
                searching: true,
                serverSide: true,
                ajax: {
                  url: `${API_URL}/users_list`,
                  type: "POST",
                  data: function (d) {
                    d.searchcol = $(".tsearch").val();

                    if (d.length === -1) {
                      d.length = 25;
                    }

                    return d;
                  },
                  dataSrc: function (json) {
                    const rowData = Array.isArray(json?.data) ? json.data : [];
                    const mappedRows = rowData.map((row, index) => {
                      const values = Array.isArray(row) ? row : [row];
                      const email = values[1] ?? row?.email ?? "-";
                      const name = values[0] ?? row?.name ?? email;
                      const roleValue =
                        values[2] ?? row?.role ?? row?.roles ?? "";
                      const statusValue =
                        values[3] ?? row?.status ?? row?.active ?? "a";

                      return {
                        id:
                          row?.id ??
                          row?.userId ??
                          values[1] ??
                          `${email}-${index}`,
                        name,
                        email,
                        roles: Array.isArray(roleValue)
                          ? roleValue
                          : typeof roleValue === "string" && roleValue
                            ? roleValue
                                .split(",")
                                .map((item) => item.trim())
                                .filter(Boolean)
                            : [],
                        status:
                          statusValue === "d" ||
                          statusValue === "inactive" ||
                          statusValue === false ||
                          statusValue === 0
                            ? "Inactive"
                            : "Active",
                        active: !(
                          statusValue === "d" ||
                          statusValue === "inactive" ||
                          statusValue === false ||
                          statusValue === 0
                        ),
                        userObject: row,
                      };
                    });

                    setUsers(mappedRows);
                    const totalCount = Number(
                      json?.recordsTotal ??
                        json?.recordsFiltered ??
                        json?.total ??
                        mappedRows.length ??
                        0,
                    );
                    setUserCount(
                      Number.isFinite(totalCount)
                        ? totalCount
                        : mappedRows.length,
                    );
                    return mappedRows;
                  },
                },
                pageLength: 10,
                lengthMenu: [10, 25, 50, 100],
                columns: [
                  {
                    data: "name",
                    title: "Name",
                    render: (value) => value || "-",
                  },
                  {
                    data: "email",
                    title: "Email",
                    render: (value) => value || "-",
                  },
                  {
                    data: "roles",
                    title: "Roles",
                    render: (value) =>
                      value && value.length > 0
                        ? `<div class="d-flex flex-wrap gap-1">${value.map((role) => `<span class="badge bg-secondary">${role}</span>`).join("")}</div>`
                        : '<span class="text-muted">No roles</span>',
                  },
                  {
                    data: "status",
                    title: "Status",
                    render: (value, type, row) =>
                      row.active
                        ? '<span class="badge bg-success">Active</span>'
                        : '<span class="badge bg-secondary">Inactive</span>',
                  },
                  {
                    data: "id",
                    title: "Actions",
                    orderable: false,
                    searchable: false,
                    render: (value) =>
                      canEditUsers
                        ? `<button type="button" class="btn btn-sm btn-outline-primary" data-edit-user="${value}">Edit</button>`
                        : '<span class="text-muted">View only</span>',
                  },
                ],
              }}
            />
          </div>
        </Card.Body>
      </Card>

      <Modal show={isEditOpen} onHide={closeEditModal} centered size="lg">
        <Form onSubmit={submitEdit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {isLoadingPermissions && (
              <Alert
                variant="info"
                className="d-flex align-items-center gap-2 mb-3"
              >
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
                Loading permissions...
              </Alert>
            )}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="editUserName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={editForm.name}
                    onChange={onEditChange}
                    placeholder="Full name"
                    required
                    disabled={!canEditUsers}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="editUserEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={onEditChange}
                    placeholder="user@example.com"
                    required
                    disabled={!canEditUsers}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="editUserRoles">
                  <Form.Label>Roles</Form.Label>
                  <Form.Control
                    name="roles"
                    value={editForm.roles}
                    onChange={onEditChange}
                    placeholder="admin, delivery"
                    disabled={!canEditUsers}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="editUserPassword">
                  <Form.Label>Temporary Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={editForm.password}
                    onChange={onEditChange}
                    placeholder="Leave blank to keep current password"
                    disabled={!canEditUsers}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="mb-0">User Access Matrix</Form.Label>
                <span className="text-muted small">
                  {SCREEN_CATALOG.reduce(
                    (total, screen) =>
                      total +
                      ACTION_CATALOG.filter(
                        (action) => accessMatrix[screen.key]?.[action.key],
                      ).length,
                    0,
                  )}{" "}
                  selected
                </span>
              </div>

              <div className="table-responsive border rounded">
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
                              checked={Boolean(
                                accessMatrix[screen.key]?.[action.key],
                              )}
                              onChange={() =>
                                onAccessToggle(screen.key, action.key)
                              }
                              disabled={!canEditUsers}
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
                            disabled={!canEditUsers}
                          >
                            Toggle All
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>

            <Form.Check
              type="switch"
              id="editUserActive"
              name="active"
              label={editForm.active ? "Active user" : "Inactive user"}
              checked={editForm.active}
              onChange={onEditChange}
              disabled={!canEditUsers}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={closeEditModal}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!canEditUsers || isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default UsersList;

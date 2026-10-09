import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const API_URL = "https://www.wynstarcreations.com/seyal/api";

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = "auth";
const LEGACY_USER_STORAGE_KEY = "user";

const getUniqueStrings = (values = []) => {
  const cleanValues = values
    .map((value) => (value || "").toString().trim())
    .filter(Boolean);
  return [...new Set(cleanValues)];
};

const PERMISSION_ALIASES = {
  "planning.view": [
    "planning.view",
    "planning.create",
    "planning.create.view",
    "planning.print",
    "planning.print.view",
    "planning.export",
    "planning.delete",
  ],
  "planning.create.view": ["planning.create.view", "planning.create"],
  "planning.print.view": ["planning.print.view", "planning.print"],
  "planning.export": ["planning.export"],
  "planning.delete": ["planning.delete"],
  "batch.view": ["batch.view"],
  "batch.details.view": ["batch.details.view", "batch.view", "mrs.view"],
  "batch.create.view": [
    "batch.create.view",
    "batch.create",
    "planning.create",
    "planning.create.view",
  ],
  "batch.edit.view": ["batch.edit.view", "batch.edit"],
  "batch.print.view": ["batch.print.view", "batch.print"],
  "batch.export": ["batch.export"],
  "batch.delete": ["batch.delete"],
  "batch.complete": ["batch.complete"],
  "delivery.view": ["delivery.view"],
  "delivery.print.view": [
    "delivery.print.view",
    "delivery.print",
    "delivery.view",
  ],
  "delivery.export": ["delivery.export", "delivery.view"],
  "delivery.delete": ["delivery.delete", "delivery.view"],
  "invoice.create.view": ["invoice.create.view", "delivery.view"],
  "invoice.list.view": ["invoice.list.view", "invoice.view"],
  "pstock.view": ["pstock.view", "stock.view"],
  "pstock.create": ["pstock.create", "pstock.view", "stock.view"],
  "pstock.return": ["pstock.return", "pstock.view", "stock.view"],
  "pstock.print": ["pstock.print", "pstock.view", "stock.view"],
  "bstock.view": ["bstock.view", "stock.view"],
  "bstock.create": ["bstock.create", "bstock.view", "stock.view"],
  "bstock.edit": ["bstock.edit", "bstock.view", "stock.view"],
  "bstock.delete": ["bstock.delete", "bstock.view", "stock.view"],
  "finishing.create": ["finishing.create", "finishing.view", "sfinishing.view"],
  "finishing.print": ["finishing.print", "finishing.view"],
  "finishing.delete": ["finishing.delete"],
  "finishing.complete": ["finishing.complete", "finishing.view"],
};

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") {
    return null;
  }

  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload =
      normalizedPayload + "=".repeat((4 - (normalizedPayload.length % 4)) % 4);
    return JSON.parse(window.atob(paddedPayload));
  } catch (error) {
    return null;
  }
};

const isTokenExpired = (token) => {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) {
    return false;
  }

  const expiresAtMs = Number(payload.exp) * 1000;
  return Number.isFinite(expiresAtMs) && Date.now() >= expiresAtMs;
};

const normalizePermissions = (rawPermissions) => {
  if (!rawPermissions) {
    return [];
  }

  const permissionList = Array.isArray(rawPermissions)
    ? rawPermissions
    : [rawPermissions];
  return getUniqueStrings(
    permissionList.map((permission) => {
      if (typeof permission === "string") {
        return permission;
      }
      if (permission && typeof permission === "object") {
        return (
          permission.code ||
          permission.key ||
          permission.name ||
          permission.permission ||
          ""
        );
      }
      return "";
    }),
  );
};

const normalizeRoles = (rawData = {}, user = {}, tokenPayload = {}) => {
  const roles = [];

  if (Array.isArray(rawData.roles)) {
    roles.push(...rawData.roles);
  }

  if (Array.isArray(user.roles)) {
    roles.push(...user.roles);
  }

  if (rawData.role) {
    roles.push(rawData.role);
  }

  if (user.role) {
    roles.push(user.role);
  }

  if (tokenPayload.role) {
    roles.push(tokenPayload.role);
  }

  if (Array.isArray(tokenPayload.roles)) {
    roles.push(...tokenPayload.roles);
  }

  return getUniqueStrings(roles);
};

const normalizeAuthPayload = (rawPayload = {}) => {
  const data =
    rawPayload?.data && typeof rawPayload.data === "object"
      ? rawPayload.data
      : rawPayload;

  const token =
    data?.token ||
    data?.jwt ||
    data?.accessToken ||
    data?.access_token ||
    data?.authToken ||
    "";

  const tokenPayload = decodeJwtPayload(token) || {};

  const user =
    data?.user ||
    data?.profile ||
    (data?.id || data?.email || data?.name ? data : null) ||
    {};

  const roles = normalizeRoles(data, user, tokenPayload);
  const permissions = normalizePermissions(
    data?.permissions ||
      user?.permissions ||
      tokenPayload?.permissions ||
      tokenPayload?.scopes ||
      tokenPayload?.scope,
  );

  return {
    token,
    user: {
      ...user,
      role: user?.role || roles[0] || "",
    },
    roles,
    permissions,
  };
};

const isUserDisabled = (user = {}) => {
  const disabledValues = [
    user?.disabled,
    user?.isDisabled,
    user?.is_active === false,
    user?.status === "disabled",
    user?.status === "inactive",
    user?.enabled === false,
  ];

  return disabledValues.includes(true);
};

const getTrustedAuthState = (authState = {}) => {
  const token = authState?.token || "";
  const tokenPayload = decodeJwtPayload(token) || {};
  const user = authState?.user || null;

  const tokenPermissions = normalizePermissions(
    tokenPayload?.permissions || tokenPayload?.scopes || tokenPayload?.scope,
  );

  const tokenRoles = normalizeRoles({}, user, tokenPayload);

  return {
    token,
    user,
    roles: tokenRoles.length
      ? tokenRoles
      : Array.isArray(authState?.roles)
        ? authState.roles
        : [],
    permissions: tokenPermissions.length
      ? tokenPermissions
      : Array.isArray(authState?.permissions)
        ? authState.permissions
        : [],
  };
};

const persistAuth = (authState) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));

  localStorage.setItem(
    LEGACY_USER_STORAGE_KEY,
    JSON.stringify(authState.user || {}),
  );
};

const clearPersistedAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
};

const setAxiosAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }
  delete axios.defaults.headers.common.Authorization;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const applyAuthState = useCallback((authState) => {
    const trustedAuthState = getTrustedAuthState(authState);

    const nextUser = trustedAuthState.user || null;
    const nextToken = trustedAuthState.token || "";
    const nextRoles = trustedAuthState.roles || [];
    const nextPermissions = trustedAuthState.permissions || [];

    const isValidSession =
      Boolean(nextUser) &&
      !isUserDisabled(nextUser) &&
      (!nextToken || !isTokenExpired(nextToken));

    setUser(nextUser);
    setToken(nextToken);
    setRoles(nextRoles);
    setPermissions(nextPermissions);
    setIsAuthenticated(isValidSession);
    setAxiosAuthHeader(nextToken);
  }, []);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setToken("");
    setRoles([]);
    setPermissions([]);
    setIsAuthenticated(false);

    clearPersistedAuth();
    setAxiosAuthHeader("");
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAuth = JSON.parse(
          localStorage.getItem(AUTH_STORAGE_KEY) || "null",
        );

        const legacyUser = JSON.parse(
          localStorage.getItem(LEGACY_USER_STORAGE_KEY) || "null",
        );

        if (storedAuth?.user) {
          if (storedAuth.token && isTokenExpired(storedAuth.token)) {
            clearAuthState();
          } else if (isUserDisabled(storedAuth.user)) {
            clearAuthState();
          } else {
            applyAuthState(storedAuth);
          }
        } else if (legacyUser) {
          if (isUserDisabled(legacyUser)) {
            clearAuthState();
          } else {
            applyAuthState({
              token: "",
              user: legacyUser,
              roles: getUniqueStrings([legacyUser.role]),
              permissions: normalizePermissions(legacyUser.permissions),
            });
          }
        } else {
          clearAuthState();
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Keep other open tabs in sync when this browser logs in or out.
    const handleStorageChange = (event) => {
      if (event.key !== AUTH_STORAGE_KEY) {
        return;
      }

      if (!event.newValue) {
        clearAuthState();

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return;
      }

      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);

    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const statusCode = error?.response?.status;

        if (statusCode === 401 || statusCode === 403) {
          clearAuthState();

          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      axios.interceptors.response.eject(interceptorId);
    };
  }, [applyAuthState, clearAuthState]);

  const login = async (email, password) => {
    const payload = { email, password };
    const endpointCandidates = ["/login", "/users"];

    let loginError = null;

    for (const endpoint of endpointCandidates) {
      try {
        const response = await axios.post(`${API_URL}${endpoint}`, payload);

        const normalizedAuth = normalizeAuthPayload(response.data);

        if (
          !normalizedAuth.user ||
          Object.keys(normalizedAuth.user).length === 0
        ) {
          throw new Error("Invalid login response: user payload missing");
        }

        if (normalizedAuth.token && isTokenExpired(normalizedAuth.token)) {
          throw new Error("Token is expired");
        }

        applyAuthState(normalizedAuth);
        persistAuth(normalizedAuth);

        return normalizedAuth.user;
      } catch (err) {
        loginError = err;

        const statusCode = err?.response?.status;

        if (endpoint === "/login" && statusCode === 404) {
          continue;
        }

        break;
      }
    }

    throw loginError || new Error("Login failed.");
  };

  const hasRole = useCallback(
    (role) => {
      if (!role) {
        return false;
      }

      return roles.includes(role);
    },
    [roles],
  );

  const hasAnyRole = useCallback(
    (requiredRoles = []) => {
      if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
        return true;
      }

      return requiredRoles.some((role) => hasRole(role));
    },
    [hasRole],
  );

  // Permission checking
  const hasPermission = useCallback(
    (permission) => {
      // No permission requested = deny
      if (!permission) {
        return false;
      }

      // Full access
      if (permissions.includes("*")) {
        return true;
      }

      // Accept equivalent permission keys used by older access records.
      const equivalentPermissions = PERMISSION_ALIASES[permission] || [permission];
      if (equivalentPermissions.some((value) => permissions.includes(value))) {
        return true;
      }

      // Resource wildcard
      // Example:
      // delivery.* => delivery.view, delivery.delete, delivery.print.view, etc.
      if (permission.includes(".")) {
        const resource = permission.split(".")[0];
        const wildcardPermission = `${resource}.*`;

        if (permissions.includes(wildcardPermission)) {
          return true;
        }
      }

      return false;
    },
    [permissions],
  );

  // Permission-based access
  const canAccess = useCallback(
    (permission, fallbackRoles = []) => {
      // If the user has permissions, permissions are the source of truth.
      if (permissions.length > 0) {
        return hasPermission(permission);
      }

      // Only use role fallback when there are no permissions.
      return hasAnyRole(fallbackRoles);
    },
    [permissions.length, hasPermission, hasAnyRole],
  );

  const logout = () => {
    clearAuthState();

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        token,
        roles,
        permissions,
        login,
        logout,
        hasRole,
        hasAnyRole,
        hasPermission,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

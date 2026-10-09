import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Role = ({
  allowedRoles = [],
  requiredPermission = "",
  requireAuth = true,
  children,
}) => {
  const {
    isAuthenticated,
    isLoading,
    hasAnyRole,
    canAccess,
  } = useAuth();

  if (isLoading) {
    return null;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission) {
    const allowed = canAccess(requiredPermission, allowedRoles);

    if (!allowed) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  }

  if (allowedRoles.length > 0) {
    if (!hasAnyRole(allowedRoles)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  }

  return children;
};

export default Role;

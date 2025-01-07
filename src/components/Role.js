import React from "react";
import { Navigate } from "react-router-dom";

const Role = ({ allowedRoles, userRole, children }) => {
    console.log(userRole);
    return allowedRoles.includes(userRole) ? (
        children
    ) : (
        <Navigate to="/unauthorized" />
    );
};

export default Role;
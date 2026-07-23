import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ perfisPermitidos }) => {
  const token = localStorage.getItem("stockflow_token");
  const usuarioLogado = JSON.parse(
    localStorage.getItem("stockflow_usuario") || "{}",
  );

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (
    perfisPermitidos &&
    !perfisPermitidos.includes(usuarioLogado.perfil)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;

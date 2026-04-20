import MainLayout from "./layouts/MainLayout";
import { Routes, Route, Navigate } from "react-router-dom";

import "./styles/App.css";
import "./styles/index.css";

import Clientes from "./pages/Clientes";
import Categorias from "./pages/Categorias";
import Almoxarifado from "./pages/Almoxarifado";
import Fornecedor from "./pages/Fornecedor";
import Colaborador from "./pages/Colaborador";
import Produto from "./pages/Produto";

function App() {
  return (
    <div className="app-container">
      <MainLayout />
      <div className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/clientes" />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/almoxarifados" element={<Almoxarifado />} />
          <Route path="/fornecedores" element={<Fornecedor />} />
          <Route path="/colaboradores" element={<Colaborador />} />
          <Route path="/produtos" element={<Produto />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

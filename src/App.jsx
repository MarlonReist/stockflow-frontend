import MainLayout from "./layouts/MainLayout";
import { Routes, Route, Navigate } from "react-router-dom";

import "./styles/App.css";
import "./styles/index.css";

import Clientes from "./pages/Cadastro/Clientes";
import Categorias from "./pages/Cadastro/Categorias";
import Almoxarifado from "./pages/Cadastro/Almoxarifado";
import Fornecedor from "./pages/Cadastro/Fornecedor";
import Colaborador from "./pages/Cadastro/Colaborador";
import Produto from "./pages/Cadastro/Produto";
import Usuario from "./pages/Cadastro/Usuario";

import GerenciamentoClientes from "./pages/Gerenciamento/Clientes";

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
          <Route path="/usuarios" element={<Usuario />} />
          <Route path="/gerenciamento/clientes" element={<GerenciamentoClientes />} />
          <Route path="/clientes/editar/:id" element={<Clientes />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

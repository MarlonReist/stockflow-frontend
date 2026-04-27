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
import GerenciamentoCategorias from "./pages/Gerenciamento/Categorias";
import GerenciamentoAlmoxarifados from "./pages/Gerenciamento/Almoxarifados";
import GerenciamentoFornecedores from "./pages/Gerenciamento/Fornecedores";
import GerenciamentoColaboradores from "./pages/Gerenciamento/Colaboradores";
import GerenciamentoProdutos from "./pages/Gerenciamento/Produtos";
import GerenciamentoUsuarios from "./pages/Gerenciamento/Usuarios";

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
          <Route path="/gerenciamento/categorias" element={<GerenciamentoCategorias />} />
          <Route path="/categorias/editar/:id" element={<Categorias />} />
          <Route path="/gerenciamento/almoxarifados" element={<GerenciamentoAlmoxarifados />} />
          <Route path="/almoxarifados/editar/:id" element={<Almoxarifado />} />
          <Route path="/gerenciamento/fornecedores" element={<GerenciamentoFornecedores />} />
          <Route path="/fornecedores/editar/:id" element={<Fornecedor />} />
          <Route path="/gerenciamento/colaboradores" element={<GerenciamentoColaboradores />} />
          <Route path="/colaboradores/editar/:id" element={<Colaborador />} />
          <Route path="/gerenciamento/produtos" element={<GerenciamentoProdutos />} />
          <Route path="/produtos/editar/:id" element={<Produto />} />
          <Route path="/gerenciamento/usuarios" element={<GerenciamentoUsuarios />} />
          <Route path="/usuarios/editar/:id" element={<Usuario />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

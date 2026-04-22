import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiChevronDown, FiGrid, FiSettings, FiUserPlus } from "react-icons/fi";

const MainLayout = () => {
  const [cadastroAberto, setCadastroAberto] = useState(false);
  const [gerenciamentoAberto, setGerenciamentoAberto] = useState(false);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>StockFlow</h1>
      </div>

      <nav className="sidebar-menu">
        <a href="#" className="sidebar-link">
          <FiGrid />
          <span>Dashboard</span>
        </a>

        <button
          type="button"
          className={`sidebar-toggle ${cadastroAberto ? "open" : ""}`}
          onClick={() => setCadastroAberto(!cadastroAberto)}
        >
          <span className="sidebar-item-content">
            <FiUserPlus />
            <span>Cadastro</span>
          </span>
          <FiChevronDown className="sidebar-chevron" />
        </button>

        {cadastroAberto && (
          <div className="sidebar-submenu">
            <NavLink to="/clientes">Cliente</NavLink>
            <NavLink to="/produtos">Produto</NavLink>
            <NavLink to="/categorias">Categoria</NavLink>
            <NavLink to="/almoxarifados">Almoxarifado</NavLink>
            <NavLink to="/colaboradores">Colaborador</NavLink>
            <NavLink to="/fornecedores">Fornecedor</NavLink>
            <NavLink to="/usuarios">Usuario</NavLink>
          </div>
        )}

        <button
          type="button"
          className={`sidebar-toggle ${gerenciamentoAberto ? "open" : ""}`}
          onClick={() => setGerenciamentoAberto(!gerenciamentoAberto)}
        >
          <span className="sidebar-item-content">
            <FiSettings />
            <span>Gerenciamento</span>
          </span>
          <FiChevronDown className="sidebar-chevron" />
        </button>

        {gerenciamentoAberto && (
          <div className="sidebar-submenu">
            <NavLink to="/gerenciamento/clientes">Clientes</NavLink>
            <NavLink to="/gerenciamento/categorias">Categorias</NavLink>
          </div>
        )}

        <a href="#" className="sidebar-link">
          Entrada
        </a>
        <a href="#" className="sidebar-link">
          Saida
        </a>
        <a href="#" className="sidebar-link">
          Ordem de Servico
        </a>
        <a href="#" className="sidebar-link">
          Estoque
        </a>
        <a href="#" className="sidebar-link">
          Relatorios
        </a>
      </nav>
    </div>
  );
};

export default MainLayout;

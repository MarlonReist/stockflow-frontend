import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiBox,
  FiChevronDown,
  FiDownload,
  FiGrid,
  FiSettings,
  FiUpload,
  FiUserPlus,
} from "react-icons/fi";

const MainLayout = () => {
  const [cadastroAberto, setCadastroAberto] = useState(false);
  const [gerenciamentoAberto, setGerenciamentoAberto] = useState(false);
  const [entradaAberto, setEntradaAberto] = useState(false);
  const [saidaAberto, setSaidaAberto] = useState(false);
  const [estoqueAberto, setEstoqueAberto] = useState(false);

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
            <NavLink to="/usuarios">Usuário</NavLink>
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
            <NavLink to="/gerenciamento/produtos">Produtos</NavLink>
            <NavLink to="/gerenciamento/categorias">Categorias</NavLink>
            <NavLink to="/gerenciamento/almoxarifados">Almoxarifados</NavLink>
            <NavLink to="/gerenciamento/colaboradores">Colaboradores</NavLink>
            <NavLink to="/gerenciamento/fornecedores">Fornecedores</NavLink>
            <NavLink to="/gerenciamento/usuarios">Usuários</NavLink>
          </div>
        )}

        <button
          type="button"
          className={`sidebar-toggle ${entradaAberto ? "open" : ""}`}
          onClick={() => setEntradaAberto(!entradaAberto)}
        >
          <span className="sidebar-item-content">
            <FiDownload />
            <span>Entrada</span>
          </span>
          <FiChevronDown className="sidebar-chevron" />
        </button>

        {entradaAberto && (
          <div className="sidebar-submenu">
            <NavLink to="/entrada/cadastro">Cadastro de Entrada</NavLink>
            <NavLink to="/entrada/itens">Itens da entrada</NavLink>
          </div>
        )}

        <button
          type="button"
          className={`sidebar-toggle ${saidaAberto ? "open" : ""}`}
          onClick={() => setSaidaAberto(!saidaAberto)}
        >
          <span className="sidebar-item-content">
            <FiUpload />
            <span>Saída</span>
          </span>
          <FiChevronDown className="sidebar-chevron" />
        </button>

        {saidaAberto && (
          <div className="sidebar-submenu">
            <NavLink to="/saida/cadastro">Cadastro de Saída</NavLink>
            <NavLink to="/saida/itens">Itens da saída</NavLink>
          </div>
        )}

        <a href="#" className="sidebar-link">
          Ordem de Servico
        </a>

        <button
          type="button"
          className={`sidebar-toggle ${estoqueAberto ? "open" : ""}`}
          onClick={() => setEstoqueAberto(!estoqueAberto)}
        >
          <span className="sidebar-item-content">
            <FiBox />
            <span>Estoque</span>
          </span>
          <FiChevronDown className="sidebar-chevron" />
        </button>

        {estoqueAberto && (
          <div className="sidebar-submenu">
            <NavLink to="/estoque/visualizar">Visualizar Estoque</NavLink>
            <NavLink to="/estoque/transferencia">Transferência entre Almoxarifados</NavLink>
          </div>
        )}

        <a href="#" className="sidebar-link">
          Relatorios
        </a>
      </nav>
    </div>
  );
};

export default MainLayout;

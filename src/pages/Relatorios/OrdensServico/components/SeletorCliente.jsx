import React, { useEffect, useMemo, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronsLeft,
  FiChevronsRight,
  FiSearch,
  FiX,
} from "react-icons/fi";
import "./SeletorCliente.css";

const ITENS_POR_PAGINA = 10;

const SeletorCliente = ({ clientes, clienteId, clienteNome, onSelecionar, disabled }) => {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [selecionado, setSelecionado] = useState(null);
  const [ordenacao, setOrdenacao] = useState({ campo: "id", direcao: "asc" });

  useEffect(() => { setPagina(1); }, [busca, ordenacao]);

  const clientesOrdenados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return clientes
      .filter((cliente) => !termo || String(cliente.id).includes(termo) || String(cliente.nome || "").toLocaleLowerCase("pt-BR").includes(termo))
      .sort((a, b) => {
        const comparacao = ordenacao.campo === "id"
          ? Number(a.id) - Number(b.id)
          : String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR", { sensitivity: "base" });
        return ordenacao.direcao === "asc" ? comparacao : -comparacao;
      });
  }, [clientes, busca, ordenacao]);

  const totalPaginas = Math.ceil(clientesOrdenados.length / ITENS_POR_PAGINA);
  const inicio = (pagina - 1) * ITENS_POR_PAGINA;
  const clientesPaginados = clientesOrdenados.slice(inicio, inicio + ITENS_POR_PAGINA);

  const alternarOrdenacao = (campo) => {
    setOrdenacao((atual) => atual.campo === campo
      ? { campo, direcao: atual.direcao === "asc" ? "desc" : "asc" }
      : { campo, direcao: "asc" });
  };

  const iconeOrdenacao = (campo) =>
    ordenacao.campo !== campo ? null : ordenacao.direcao === "asc" ? <FiChevronUp /> : <FiChevronDown />;

  const confirmar = (cliente) => {
    if (!cliente) return;
    onSelecionar(cliente);
    setAberto(false);
    setBusca("");
    setSelecionado(null);
    setPagina(1);
  };

  const alterarId = (event) => {
    const id = event.target.value.replace(/\D/g, "");
    const cliente = clientes.find((item) => String(item.id) === id);
    onSelecionar(cliente || { id, nome: "" });
  };

  return (
    <>
      <div className="relatorio-cliente-lookup">
        <input aria-label="ID do cliente" inputMode="numeric" placeholder="ID" value={clienteId} onChange={alterarId} disabled={disabled} />
        <input aria-label="Nome do cliente" placeholder="Nome do cliente" value={clienteNome} readOnly />
        <button type="button" aria-label="Pesquisar cliente" title="Pesquisar cliente" onClick={() => setAberto(true)} disabled={disabled}><FiSearch /></button>
      </div>

      {aberto && (
        <div className="relatorio-seletor-overlay" onMouseDown={(event) => event.target === event.currentTarget && setAberto(false)}>
          <div className="relatorio-seletor-box" role="dialog" aria-modal="true" aria-labelledby="seletor-cliente-titulo">
            <div className="relatorio-seletor-header"><h2 id="seletor-cliente-titulo">Selecionar cliente</h2><button type="button" aria-label="Fechar" onClick={() => setAberto(false)}><FiX /></button></div>
            <div className="relatorio-seletor-busca"><FiSearch /><input autoFocus type="search" placeholder="Buscar por ID ou nome..." value={busca} onChange={(event) => setBusca(event.target.value)} /></div>
            <div className="relatorio-seletor-paginacao">
              <button type="button" onClick={() => setPagina(1)} disabled={pagina === 1}><FiChevronsLeft /></button>
              <button type="button" onClick={() => setPagina((atual) => Math.max(1, atual - 1))} disabled={pagina === 1}><FiChevronLeft /></button>
              <span>{clientesOrdenados.length ? `${inicio + 1}–${Math.min(inicio + ITENS_POR_PAGINA, clientesOrdenados.length)} de ${clientesOrdenados.length}` : "0 clientes"}</span>
              <button type="button" onClick={() => setPagina((atual) => Math.min(totalPaginas, atual + 1))} disabled={!totalPaginas || pagina === totalPaginas}><FiChevronRight /></button>
              <button type="button" onClick={() => setPagina(totalPaginas)} disabled={!totalPaginas || pagina === totalPaginas}><FiChevronsRight /></button>
            </div>
            <div className="relatorio-seletor-table-wrapper"><table className="relatorio-seletor-table">
              <thead><tr><th><button type="button" onClick={() => alternarOrdenacao("id")}>ID {iconeOrdenacao("id")}</button></th><th><button type="button" onClick={() => alternarOrdenacao("nome")}>Nome {iconeOrdenacao("nome")}</button></th></tr></thead>
              <tbody>{clientesPaginados.length ? clientesPaginados.map((cliente) => <tr key={cliente.id} className={selecionado?.id === cliente.id ? "selecionado" : ""} onClick={() => setSelecionado(cliente)} onDoubleClick={() => confirmar(cliente)}><td>{cliente.id}</td><td>{cliente.nome}</td></tr>) : <tr><td colSpan="2" className="relatorio-seletor-vazio">Nenhum cliente encontrado.</td></tr>}</tbody>
            </table></div>
            <div className="relatorio-seletor-footer"><button type="button" onClick={() => confirmar(selecionado)} disabled={!selecionado}>Selecionar</button></div>
          </div>
        </div>
      )}
    </>
  );
};

export default SeletorCliente;

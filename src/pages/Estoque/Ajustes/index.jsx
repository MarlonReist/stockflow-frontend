import React, { useEffect, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronsLeft,
  FiChevronsRight,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import { listarAlmoxarifados } from "../../../services/almoxarifadoService";
import { listarProdutos } from "../../../services/produtoService";
import { listarAlmoxarifadosEstoque } from "../../../services/almoxarifadoEstoqueService";
import {
  criarAjusteManual,
  listarAjustes,
} from "../../../services/ajusteEstoqueService";
import "./Ajustes.css";

const Ajustes = () => {
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [estoques, setEstoques] = useState([]);
  const [ajustes, setAjustes] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [mostrarProdutos, setMostrarProdutos] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  const abrirProdutos = () => {
    setBuscaProduto("");
    setPaginaProduto(1);
    setProdutoSelecionado(produtos.find((produto) => String(produto.id) === formulario.produtoId) || null);
    setMostrarProdutos(true);
  };
  const [paginaProduto, setPaginaProduto] = useState(1);
  const [ordenacaoProduto, setOrdenacaoProduto] = useState({
    coluna: "id",
    direcao: "asc",
  });
  const produtosPorPagina = 8;
  const [filtroDataAjuste, setFiltroDataAjuste] = useState("");
  const [paginaAjuste, setPaginaAjuste] = useState(1);
  const [ordenacaoAjuste, setOrdenacaoAjuste] = useState({
    coluna: "dataHora",
    direcao: "desc",
  });
  const ajustesPorPagina = 10;

  const [formulario, setFormulario] = useState({
    tipo: "AJUSTE_ENTRADA",
    almoxarifadoId: "",
    produtoId: "",
    produtoNome: "",
    quantidade: "",
    motivo: "",
  });

  const carregarDados = async () => {
    try {
      const [almoxarifadosResponse, produtosResponse, ajustesResponse, estoquesResponse] =
        await Promise.all([
          listarAlmoxarifados(),
          listarProdutos(),
          listarAjustes(),
          listarAlmoxarifadosEstoque(),
        ]);

      setAlmoxarifados(almoxarifadosResponse.data);
      setProdutos(produtosResponse.data);
      setEstoques(estoquesResponse.data);
      setAjustes(ajustesResponse.data);
      setMensagem("");
      return true;
    } catch (error) {
      setMensagem(
        error.response?.data?.message ||
          "Não foi possível carregar os ajustes de estoque.",
      );
      return false;
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleAlterarCampo = (event) => {
    const { name, value } = event.target;

    setFormulario((atual) => ({
      ...atual,
      [name]: value,
      ...(name === "produtoId" ? {
        produtoNome: produtos.find((produto) => String(produto.id) === value)?.nome || "",
      } : {}),
    }));
  };

  const saldosProdutos = new Map();
  for (const estoque of estoques) {
    if (Number(estoque.almoxarifadoId ?? estoque.almoxarifado?.id) === Number(formulario.almoxarifadoId)) {
      const id = String(estoque.produtoId ?? estoque.produto?.id);
      saldosProdutos.set(id, (saldosProdutos.get(id) || 0) + Number(estoque.saldo ?? estoque.quantidade ?? 0));
    }
  }
  const produtosFiltrados = produtos.map((produto) => ({
    ...produto,
    saldo: formulario.almoxarifadoId ? (saldosProdutos.get(String(produto.id)) || 0) : null,
  })).filter((produto) => {
    const termo = buscaProduto.trim().toLowerCase();
    return (
      !termo ||
      String(produto.id).includes(termo) ||
      String(produto.nome || "").toLowerCase().includes(termo)
    );
  });

  const produtosOrdenados = [...produtosFiltrados].sort((a, b) => {
    const valorA = a[ordenacaoProduto.coluna] ?? "";
    const valorB = b[ordenacaoProduto.coluna] ?? "";
    const resultado = ["id", "saldo"].includes(ordenacaoProduto.coluna)
      ? Number(valorA) - Number(valorB)
      : String(valorA).localeCompare(String(valorB), "pt-BR");

    return ordenacaoProduto.direcao === "asc" ? resultado : -resultado;
  });

  const totalPaginasProduto = Math.max(
    1,
    Math.ceil(produtosOrdenados.length / produtosPorPagina),
  );
  const paginaProdutoLimitada = Math.min(paginaProduto, totalPaginasProduto);
  const produtosPaginados = produtosOrdenados.slice(
    (paginaProdutoLimitada - 1) * produtosPorPagina,
    paginaProdutoLimitada * produtosPorPagina,
  );

  const ordenarProdutos = (coluna) => {
    setOrdenacaoProduto((atual) =>
      atual.coluna === coluna
        ? { coluna, direcao: atual.direcao === "asc" ? "desc" : "asc" }
        : { coluna, direcao: "asc" },
    );
    setPaginaProduto(1);
  };

  const indicadorOrdenacaoProduto = (coluna) => {
    if (ordenacaoProduto.coluna !== coluna) return null;
    return ordenacaoProduto.direcao === "asc" ? <FiChevronUp /> : <FiChevronDown />;
  };

  const ajustesOrdenados = [...ajustes]
    .filter((ajuste) =>
      !filtroDataAjuste ||
      String(ajuste.dataHora || "").slice(0, 10) === filtroDataAjuste,
    )
    .sort((a, b) => {
      const valorA = a[ordenacaoAjuste.coluna] ?? "";
      const valorB = b[ordenacaoAjuste.coluna] ?? "";
      const resultado = ["id", "quantidade"].includes(ordenacaoAjuste.coluna)
        ? Number(valorA) - Number(valorB)
        : String(valorA).localeCompare(String(valorB), "pt-BR");

      return ordenacaoAjuste.direcao === "asc" ? resultado : -resultado;
    });

  const totalPaginasAjuste = Math.max(
    1,
    Math.ceil(ajustesOrdenados.length / ajustesPorPagina),
  );
  const paginaAjusteLimitada = Math.min(paginaAjuste, totalPaginasAjuste);
  const ajustesPaginados = ajustesOrdenados.slice(
    (paginaAjusteLimitada - 1) * ajustesPorPagina,
    paginaAjusteLimitada * ajustesPorPagina,
  );

  const ordenarAjustes = (coluna) => {
    setOrdenacaoAjuste((atual) =>
      atual.coluna === coluna
        ? { coluna, direcao: atual.direcao === "asc" ? "desc" : "asc" }
        : { coluna, direcao: "asc" },
    );
    setPaginaAjuste(1);
  };

  const indicadorOrdenacaoAjuste = (coluna) => {
    if (ordenacaoAjuste.coluna !== coluna) return null;
    return ordenacaoAjuste.direcao === "asc" ? <FiChevronUp /> : <FiChevronDown />;
  };

  const formatarDataHora = (dataHora) =>
    dataHora ? new Date(dataHora).toLocaleString("pt-BR") : "-";

  const formatarTipoAjuste = (tipo) =>
    tipo === "AJUSTE_ENTRADA" ? "Entrada" : "Saída";

  const selecionarProduto = (produto) => {
    setFormulario((atual) => ({
      ...atual,
      produtoId: String(produto.id),
      produtoNome: produto.nome,
    }));
    setBuscaProduto("");
    setMostrarProdutos(false);
  };

  const handleSalvar = async (event) => {
    event.preventDefault();
    if (salvando) return;

    if (
      !formulario.almoxarifadoId ||
      !formulario.produtoId ||
      !formulario.quantidade ||
      !formulario.motivo.trim()
    ) {
      setMensagem("Preencha todos os campos do ajuste.");
      return;
    }

    if (!Number.isInteger(Number(formulario.quantidade)) || Number(formulario.quantidade) <= 0) {
      setMensagem("Informe uma quantidade inteira maior que zero.");
      return;
    }

    try {
      setSalvando(true);

      await criarAjusteManual({
        tipo: formulario.tipo,
        almoxarifadoId: Number(formulario.almoxarifadoId),
        produtoId: Number(formulario.produtoId),
        quantidade: Number(formulario.quantidade),
        motivo: formulario.motivo.trim(),
      });

      setFormulario({
        tipo: "AJUSTE_ENTRADA",
        almoxarifadoId: "",
        produtoId: "",
        produtoNome: "",
        quantidade: "",
        motivo: "",
      });
      setBuscaProduto("");
      setMostrarProdutos(false);

      const dadosAtualizados = await carregarDados();
      setMensagem(dadosAtualizados
        ? "Ajuste criado com sucesso."
        : "Ajuste criado com sucesso, mas não foi possível atualizar a listagem. Recarregue a página.");
    } catch (error) {
      setMensagem(
        error.response?.data?.message || "Não foi possível criar o ajuste.",
      );
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return <div className="ajustes-page">Carregando...</div>;
  }

  return (
    <div className="ajustes-page">
      <div className="ajustes-header">
        <h1>Ajustes de Estoque</h1>
        <p>Registre entradas e saídas manuais de produtos.</p>
      </div>

      {mensagem && <p className="ajustes-message">{mensagem}</p>}

      <section className="ajustes-card">
        <h2>Novo ajuste</h2>

        <form className="ajustes-form" onSubmit={handleSalvar}>
          <label>
            Tipo do ajuste
            <select
              name="tipo"
              value={formulario.tipo}
              onChange={handleAlterarCampo}
            >
              <option value="AJUSTE_ENTRADA">Entrada</option>
              <option value="AJUSTE_SAIDA">Saída</option>
            </select>
          </label>

          <label>
            Almoxarifado
            <select
              name="almoxarifadoId"
              value={formulario.almoxarifadoId}
              onChange={handleAlterarCampo}
            >
              <option value="">Selecione o almoxarifado</option>
              {almoxarifados.map((almoxarifado) => (
                <option key={almoxarifado.id} value={almoxarifado.id}>
                  {almoxarifado.nome}
                </option>
              ))}
            </select>
          </label>

          <div className="ajustes-produto-campo">
            <label htmlFor="ajuste-produto-id">Produto</label>
            <div className="ajustes-produto-busca">
              <input
                name="produtoId"
                id="ajuste-produto-id"
                inputMode="numeric"
                value={formulario.produtoId}
                onChange={handleAlterarCampo}
              />
              <input
                value={formulario.produtoNome}
                aria-label="Nome do produto; abrir seleção"
                onClick={abrirProdutos}
                onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); abrirProdutos(); } }}
                readOnly
              />
              <button
                type="button"
                onClick={abrirProdutos}
                aria-label="Buscar produto"
              >
                <FiSearch />
              </button>
            </div>


          </div>

          <label>
            Quantidade
            <input
              type="number"
              name="quantidade"
              min="1"
              value={formulario.quantidade}
              onChange={handleAlterarCampo}
              placeholder="Informe a quantidade"
            />
          </label>

          <label className="ajustes-form-motivo">
            Motivo
            <textarea
              name="motivo"
              value={formulario.motivo}
              onChange={handleAlterarCampo}
              placeholder="Informe o motivo do ajuste"
              rows="3"
            />
          </label>

          <button type="submit" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar ajuste"}
          </button>
        </form>
      </section>
      <section className="ajustes-card ajustes-historico">
        <div className="ajustes-historico-header">
          <div>
            <h2>Histórico de ajustes</h2>
            <p>Consulte os ajustes manuais e os gerados por conferência.</p>
          </div>

          <div className="ajustes-historico-filtros">
            <input
              type="date"
              value={filtroDataAjuste}
              onChange={(event) => {
                setFiltroDataAjuste(event.target.value);
                setPaginaAjuste(1);
              }}
              aria-label="Filtrar ajustes por data"
            />
            <button
              type="button"
              title="Limpar filtro e atualizar"
              onClick={() => {
                setFiltroDataAjuste("");
                setPaginaAjuste(1);
                carregarDados();
              }}
            >
              <FiRefreshCw />
            </button>
          </div>
        </div>

        <div className="ajustes-historico-tabela-wrapper">
          <table className="ajustes-historico-tabela">
            <thead>
              <tr>
                <th onClick={() => ordenarAjustes("id")}>ID {indicadorOrdenacaoAjuste("id")}</th>
                <th onClick={() => ordenarAjustes("dataHora")}>Data {indicadorOrdenacaoAjuste("dataHora")}</th>
                <th onClick={() => ordenarAjustes("tipo")}>Tipo {indicadorOrdenacaoAjuste("tipo")}</th>
                <th onClick={() => ordenarAjustes("produtoNome")}>Produto {indicadorOrdenacaoAjuste("produtoNome")}</th>
                <th onClick={() => ordenarAjustes("almoxarifadoNome")}>Almoxarifado {indicadorOrdenacaoAjuste("almoxarifadoNome")}</th>
                <th onClick={() => ordenarAjustes("quantidade")}>Quantidade {indicadorOrdenacaoAjuste("quantidade")}</th>
                <th onClick={() => ordenarAjustes("usuarioResponsavelNome")}>Responsável {indicadorOrdenacaoAjuste("usuarioResponsavelNome")}</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {ajustesPaginados.map((ajuste) => (
                <tr key={ajuste.id}>
                  <td>{ajuste.id}</td>
                  <td>{formatarDataHora(ajuste.dataHora)}</td>
                  <td>
                    <span className={`ajustes-tipo-badge ${ajuste.tipo === "AJUSTE_ENTRADA" ? "entrada" : "saida"}`}>
                      {formatarTipoAjuste(ajuste.tipo)}
                    </span>
                  </td>
                  <td>{ajuste.produtoNome}</td>
                  <td>{ajuste.almoxarifadoNome}</td>
                  <td>{ajuste.quantidade}</td>
                  <td>{ajuste.usuarioResponsavelNome}</td>
                  <td className="ajustes-motivo">{ajuste.motivo}</td>
                </tr>
              ))}
              {ajustesPaginados.length === 0 && (
                <tr>
                  <td colSpan={8} className="ajustes-sem-registros">
                    Nenhum ajuste encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ajustes-historico-paginacao">
          <button type="button" onClick={() => setPaginaAjuste(1)} disabled={paginaAjusteLimitada === 1}><FiChevronsLeft /></button>
          <button type="button" onClick={() => setPaginaAjuste((pagina) => Math.max(1, pagina - 1))} disabled={paginaAjusteLimitada === 1}><FiChevronLeft /></button>
          <button type="button" onClick={() => carregarDados()} title="Atualizar"><FiRefreshCw /></button>
          <button type="button" onClick={() => setPaginaAjuste((pagina) => Math.min(totalPaginasAjuste, pagina + 1))} disabled={paginaAjusteLimitada === totalPaginasAjuste}><FiChevronRight /></button>
          <button type="button" onClick={() => setPaginaAjuste(totalPaginasAjuste)} disabled={paginaAjusteLimitada === totalPaginasAjuste}><FiChevronsRight /></button>
          <span>
            {ajustesOrdenados.length ? (paginaAjusteLimitada - 1) * ajustesPorPagina + 1 : 0}
            {" - "}
            {Math.min(paginaAjusteLimitada * ajustesPorPagina, ajustesOrdenados.length)}
            {" / "}{ajustesOrdenados.length}
          </span>
        </div>
      </section>
            {mostrarProdutos && (
              <div className="ajustes-produto-overlay">
                <div className="ajustes-produto-modal" role="dialog" aria-modal="true" aria-labelledby="ajustes-produtos-titulo" onKeyDown={(event) => { if (event.key === "Escape") setMostrarProdutos(false); }}>
                  <div className="ajustes-produto-modal-header">
                    <h2 id="ajustes-produtos-titulo">Produtos</h2>
                    <button
                      type="button"
                      aria-label="Fechar seleção de produtos"
                      onClick={() => setMostrarProdutos(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="ajustes-produto-modal-toolbar">
                    <input
                      className="ajustes-produto-modal-busca"
                      value={buscaProduto}
                      onChange={(event) => {
                        setBuscaProduto(event.target.value);
                        setPaginaProduto(1);
                      }}
                      placeholder="Buscar por ID ou nome..."
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setBuscaProduto("");
                        setPaginaProduto(1);
                      }}
                    >
                      <FiRefreshCw />
                    </button>
                  <div className="ajustes-produto-paginacao">
                    <button type="button" onClick={() => setPaginaProduto(1)} disabled={paginaProdutoLimitada === 1}><FiChevronsLeft /></button>
                    <button type="button" onClick={() => setPaginaProduto((pagina) => Math.max(1, pagina - 1))} disabled={paginaProdutoLimitada === 1}><FiChevronLeft /></button>
                    <span>{produtosOrdenados.length ? (paginaProdutoLimitada - 1) * produtosPorPagina + 1 : 0} - {Math.min(paginaProdutoLimitada * produtosPorPagina, produtosOrdenados.length)} / {produtosOrdenados.length}</span>
                    <button type="button" onClick={() => setPaginaProduto((pagina) => Math.min(totalPaginasProduto, pagina + 1))} disabled={paginaProdutoLimitada === totalPaginasProduto}><FiChevronRight /></button>
                    <button type="button" onClick={() => setPaginaProduto(totalPaginasProduto)} disabled={paginaProdutoLimitada === totalPaginasProduto}><FiChevronsRight /></button>
                  </div>
                  </div>

                  <div className="ajustes-produto-resultados">
                    <table className="ajustes-produto-tabela">
                    <thead><tr>
                    <th>
                      <button type="button" onClick={() => ordenarProdutos("id")}>
                        ID {indicadorOrdenacaoProduto("id")}
                      </button>
                    </th><th>
                      <button type="button" onClick={() => ordenarProdutos("nome")}>
                        Nome {indicadorOrdenacaoProduto("nome")}
                      </button>
                    </th><th>
                      <button type="button" onClick={() => ordenarProdutos("saldo")}>
                        Quantidade em estoque {indicadorOrdenacaoProduto("saldo")}
                      </button>
                    </th></tr></thead>
                    <tbody>
                    {produtosPaginados.map((produto) => (
                      <tr
                        className={produtoSelecionado?.id === produto.id ? "selected-row" : ""}
                        key={produto.id}
                        tabIndex={0}
                        aria-selected={produtoSelecionado?.id === produto.id}
                        onClick={() => setProdutoSelecionado(produto)}
                        onDoubleClick={() => selecionarProduto(produto)}
                        onKeyDown={(event) => { if (event.key === "Enter") selecionarProduto(produto); }}
                      >
                        <td>{produto.id}</td>
                        <td>{produto.nome}</td>
                        <td>{produto.saldo === null ? "Selecione o almoxarifado" : produto.saldo.toLocaleString("pt-BR")}</td>
                      </tr>
                    ))}
                    {produtosPaginados.length === 0 && <tr><td colSpan={3}>Nenhum produto encontrado.</td></tr>}
                    </tbody></table>
                  </div>
                  <div className="ajustes-produto-footer">
                    <button type="button" disabled={!produtoSelecionado} onClick={() => selecionarProduto(produtoSelecionado)}>Selecionar</button>
                  </div>


                </div>
              </div>
            )}
    </div>
  );
};

export default Ajustes;

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
import { listarAlmoxarifadosEstoque } from "../../../services/almoxarifadoEstoqueService";
import { listarAlmoxarifados } from "../../../services/almoxarifadoService";
import {
  atualizarOrdemServicoItem,
  cadastrarOrdemServicoItem,
  deletarOrdemServicoItem,
  listarOrdemServicoItens,
} from "../../../services/ordemServicoItemService";

const itemOSInicial = {
  produtoId: "",
  produtoNome: "",
  almoxarifadoId: "",
  almoxarifadoNome: "",
  saldoDisponivel: "",
  quantidade: "",
};

const ProdutosOSTab = ({ ordemId, ordemEncerrada, mostrarMensagem }) => {
  const [produtosOS, setProdutosOS] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [itemOS, setItemOS] = useState({ ...itemOSInicial });
  const [itemEditando, setItemEditando] = useState(null);
  const [estoques, setEstoques] = useState([]);
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [seletorProdutoAberto, setSeletorProdutoAberto] = useState(false);
  const [seletorAlmoxarifadoAberto, setSeletorAlmoxarifadoAberto] =
    useState(false);
  const [produtoModalSelecionado, setProdutoModalSelecionado] = useState(null);
  const [almoxarifadoModalSelecionado, setAlmoxarifadoModalSelecionado] =
    useState(null);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [buscaAlmoxarifado, setBuscaAlmoxarifado] = useState("");
  const [paginaProdutoAtual, setPaginaProdutoAtual] = useState(1);
  const [paginaAlmoxarifadoAtual, setPaginaAlmoxarifadoAtual] = useState(1);
  const [ordenacaoProduto, setOrdenacaoProduto] = useState({
    coluna: "id",
    direcao: "asc",
  });
  const [ordenacaoAlmoxarifado, setOrdenacaoAlmoxarifado] = useState({
    coluna: "id",
    direcao: "asc",
  });
  const [confirmarDeleteAberto, setConfirmarDeleteAberto] = useState(false);

  const itensPorPagina = 10;

  const carregarProdutosOS = async () => {
    try {
      const response = await listarOrdemServicoItens();

      const itensDaOS = response.data.filter((item) => {
        return Number(item.osId) === Number(ordemId);
      });

      setProdutosOS(itensDaOS);
    } catch (error) {
      mostrarMensagem("Erro ao carregar produtos da OS.", "erro");
    }
  };

  const carregarSeletores = async () => {
    try {
      const [responseEstoques, responseAlmoxarifados] = await Promise.all([
        listarAlmoxarifadosEstoque(),
        listarAlmoxarifados(),
      ]);

      setEstoques(responseEstoques.data);
      setAlmoxarifados(responseAlmoxarifados.data);
    } catch (error) {
      mostrarMensagem("Erro ao carregar produtos e almoxarifados.", "erro");
    }
  };

  useEffect(() => {
    if (!ordemId) {
      return;
    }

    carregarProdutosOS();
  }, [ordemId]);

  useEffect(() => {
    carregarSeletores();
  }, []);

  const ordenarLista = (lista, ordenacao) => {
    return [...lista].sort((a, b) => {
      let valorA = a[ordenacao.coluna] ?? "";
      let valorB = b[ordenacao.coluna] ?? "";

      if (ordenacao.coluna === "id" || ordenacao.coluna === "saldo") {
        valorA = Number(valorA);
        valorB = Number(valorB);
      } else {
        valorA = String(valorA).toLowerCase();
        valorB = String(valorB).toLowerCase();
      }

      if (valorA < valorB) {
        return ordenacao.direcao === "asc" ? -1 : 1;
      }

      if (valorA > valorB) {
        return ordenacao.direcao === "asc" ? 1 : -1;
      }

      return 0;
    });
  };

  const calcularSaldoDisponivel = (estoqueItem) => {
    const saldoEstoque = Number(estoqueItem.saldo ?? estoqueItem.quantidade ?? 0);
    const produtoId = Number(
      estoqueItem.produtoId ?? estoqueItem.produto?.id ?? estoqueItem.id,
    );
    const almoxarifadoId = Number(
      estoqueItem.almoxarifadoId ?? estoqueItem.almoxarifado?.id ?? 0,
    );

    if (
      itemEditando &&
      Number(itemEditando.produtoId) === produtoId &&
      Number(itemEditando.almoxarifadoId) === almoxarifadoId
    ) {
      return saldoEstoque + Number(itemEditando.quantidade ?? 0);
    }

    return saldoEstoque;
  };

  const produtosDoAlmoxarifado = estoques
    .map((item) => {
      const almoxarifadoId = Number(
        item.almoxarifadoId ?? item.almoxarifado?.id ?? 0,
      );
      const saldoDisponivel = calcularSaldoDisponivel(item);

      return {
        id: item.produtoId ?? item.produto?.id ?? item.id,
        nome: item.produtoNome ?? item.produto?.nome ?? item.nome ?? "",
        almoxarifadoId,
        saldo: saldoDisponivel,
      };
    })
    .filter((produto) => {
      return (
        produto.almoxarifadoId === Number(itemOS.almoxarifadoId) &&
        produto.saldo > 0
      );
    });


  const produtosFiltrados = produtosDoAlmoxarifado.filter((produto) => {
    const busca = buscaProduto.toLowerCase();

    return (
      String(produto.id).includes(busca) ||
      String(produto.nome ?? "")
        .toLowerCase()
        .includes(busca)
    );
  });

  const almoxarifadosFiltrados = almoxarifados.filter((almoxarifado) => {
    const busca = buscaAlmoxarifado.toLowerCase();

    return (
      String(almoxarifado.id).includes(busca) ||
      String(almoxarifado.nome ?? "")
        .toLowerCase()
        .includes(busca)
    );
  });

  const produtosOrdenados = ordenarLista(produtosFiltrados, ordenacaoProduto);
  const almoxarifadosOrdenados = ordenarLista(
    almoxarifadosFiltrados,
    ordenacaoAlmoxarifado,
  );

  const indiceInicialProduto = (paginaProdutoAtual - 1) * itensPorPagina;
  const indiceFinalProduto = indiceInicialProduto + itensPorPagina;
  const produtosPaginados = produtosOrdenados.slice(
    indiceInicialProduto,
    indiceFinalProduto,
  );
  const totalPaginasProduto = Math.ceil(
    produtosOrdenados.length / itensPorPagina,
  );
  const inicioExibidoProduto =
    produtosOrdenados.length > 0 ? indiceInicialProduto + 1 : 0;
  const fimExibidoProduto = Math.min(
    indiceFinalProduto,
    produtosOrdenados.length,
  );

  const indiceInicialAlmoxarifado =
    (paginaAlmoxarifadoAtual - 1) * itensPorPagina;
  const indiceFinalAlmoxarifado = indiceInicialAlmoxarifado + itensPorPagina;
  const almoxarifadosPaginados = almoxarifadosOrdenados.slice(
    indiceInicialAlmoxarifado,
    indiceFinalAlmoxarifado,
  );
  const totalPaginasAlmoxarifado = Math.ceil(
    almoxarifadosOrdenados.length / itensPorPagina,
  );
  const inicioExibidoAlmoxarifado =
    almoxarifadosOrdenados.length > 0 ? indiceInicialAlmoxarifado + 1 : 0;
  const fimExibidoAlmoxarifado = Math.min(
    indiceFinalAlmoxarifado,
    almoxarifadosOrdenados.length,
  );

  const handleOrdenarProduto = (coluna) => {
    setOrdenacaoProduto((ordenacaoAtual) => {
      if (ordenacaoAtual.coluna === coluna) {
        return {
          coluna,
          direcao: ordenacaoAtual.direcao === "asc" ? "desc" : "asc",
        };
      }

      return { coluna, direcao: "asc" };
    });
  };

  const handleOrdenarAlmoxarifado = (coluna) => {
    setOrdenacaoAlmoxarifado((ordenacaoAtual) => {
      if (ordenacaoAtual.coluna === coluna) {
        return {
          coluna,
          direcao: ordenacaoAtual.direcao === "asc" ? "desc" : "asc",
        };
      }

      return { coluna, direcao: "asc" };
    });
  };

  const renderIconeOrdenacao = (ordenacao, coluna) => {
    if (ordenacao.coluna !== coluna) {
      return null;
    }

    return ordenacao.direcao === "asc" ? <FiChevronUp /> : <FiChevronDown />;
  };

  const extrairMensagemErro = (error, mensagemPadrao) => {
    const data = error.response?.data;

    if (!data) {
      return mensagemPadrao;
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.message) {
      return data.message;
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors
        .map((erro) => erro.defaultMessage || erro.message || erro)
        .join("\n");
    }

    return mensagemPadrao;
  };

  const formatarMoeda = (valor) => {
    if (valor == null || valor === "") {
      return "-";
    }

    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleEditarProduto = () => {
    if (!produtoSelecionado) {
      mostrarMensagem("Selecione um produto da OS antes de editar.", "erro");
      return;
    }

    const almoxarifadoEncontrado = almoxarifados.find(
      (almoxarifado) =>
        Number(almoxarifado.id) === Number(produtoSelecionado.almoxarifadoId),
    );
    const estoqueEncontrado = estoques.find((estoque) => {
      const estoqueProdutoId = Number(
        estoque.produtoId ?? estoque.produto?.id ?? estoque.id,
      );
      const estoqueAlmoxarifadoId = Number(
        estoque.almoxarifadoId ?? estoque.almoxarifado?.id ?? 0,
      );

      return (
        estoqueProdutoId === Number(produtoSelecionado.produtoId) &&
        estoqueAlmoxarifadoId === Number(produtoSelecionado.almoxarifadoId)
      );
    });
    const saldoDisponivel =
      Number(estoqueEncontrado?.saldo ?? estoqueEncontrado?.quantidade ?? 0) +
      Number(produtoSelecionado.quantidade ?? 0);

    setItemEditando(produtoSelecionado);
    setItemOS({
      produtoId: String(produtoSelecionado.produtoId ?? ""),
      produtoNome: produtoSelecionado.produtoNome ?? "",
      almoxarifadoId: String(produtoSelecionado.almoxarifadoId ?? ""),
      almoxarifadoNome: almoxarifadoEncontrado?.nome ?? "",
      saldoDisponivel: String(saldoDisponivel),
      quantidade: String(produtoSelecionado.quantidade ?? ""),
    });
    setModalAberto(true);
  };

  const handleDeletarProduto = () => {
    if (!produtoSelecionado) {
      mostrarMensagem("Selecione um produto da OS antes de deletar.", "erro");
      return;
    }

    setConfirmarDeleteAberto(true);
  };

  const confirmarDeleteProduto = async () => {
    try {
      await deletarOrdemServicoItem(produtoSelecionado.id);

      mostrarMensagem("Produto removido da OS com sucesso.", "sucesso");
      setProdutoSelecionado(null);
      setConfirmarDeleteAberto(false);
      carregarProdutosOS();
      carregarSeletores();
    } catch (error) {
      const mensagemErro = extrairMensagemErro(
        error,
        "Erro ao remover produto da OS.",
      );

      mostrarMensagem(mensagemErro, "erro");
    }
  };

  const handleChangeItemOS = (e) => {
    const { name, value } = e.target;

    if (name === "almoxarifadoId") {
      const almoxarifadoEncontrado = almoxarifados.find(
        (almoxarifado) => Number(almoxarifado.id) === Number(value),
      );

      setItemOS((itemAtual) => ({
        ...itemAtual,
        almoxarifadoId: value,
        almoxarifadoNome: almoxarifadoEncontrado
          ? almoxarifadoEncontrado.nome
          : "",
        produtoId: "",
        produtoNome: "",
        saldoDisponivel: "",
      }));
      return;
    }

    if (name === "produtoId") {
      const produtoEncontrado = produtosDoAlmoxarifado.find(
        (produto) => Number(produto.id) === Number(value),
      );

      setItemOS((itemAtual) => ({
        ...itemAtual,
        produtoId: value,
        produtoNome: produtoEncontrado ? produtoEncontrado.nome : "",
        saldoDisponivel: produtoEncontrado
          ? String(produtoEncontrado.saldo ?? "")
          : "",
      }));
      return;
    }

    setItemOS((itemAtual) => ({
      ...itemAtual,
      [name]: value,
    }));
  };

  const handleSelecionarProduto = () => {
    if (!produtoModalSelecionado) {
      mostrarMensagem("Selecione um produto.", "erro");
      return;
    }

    setItemOS((itemAtual) => ({
      ...itemAtual,
      produtoId: produtoModalSelecionado.id,
      produtoNome: produtoModalSelecionado.nome,
      saldoDisponivel: String(produtoModalSelecionado.saldo ?? ""),
    }));
    setSeletorProdutoAberto(false);
    setProdutoModalSelecionado(null);
  };

  const handleSelecionarAlmoxarifado = () => {
    if (!almoxarifadoModalSelecionado) {
      mostrarMensagem("Selecione um almoxarifado.", "erro");
      return;
    }

    setItemOS((itemAtual) => ({
      ...itemAtual,
      almoxarifadoId: almoxarifadoModalSelecionado.id,
      almoxarifadoNome: almoxarifadoModalSelecionado.nome,
      produtoId: "",
      produtoNome: "",
      saldoDisponivel: "",
    }));
    setSeletorAlmoxarifadoAberto(false);
    setAlmoxarifadoModalSelecionado(null);
  };

  const abrirSeletorAlmoxarifado = () => {
    setBuscaAlmoxarifado("");
    setPaginaAlmoxarifadoAtual(1);
    setAlmoxarifadoModalSelecionado(null);
    setSeletorAlmoxarifadoAberto(true);
  };

  const abrirSeletorProduto = () => {
    if (!itemOS.almoxarifadoId) {
      mostrarMensagem("Selecione o almoxarifado antes do produto.", "erro");
      return;
    }

    setBuscaProduto("");
    setPaginaProdutoAtual(1);
    setProdutoModalSelecionado(null);
    setSeletorProdutoAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setItemOS({ ...itemOSInicial });
    setItemEditando(null);
    setProdutoModalSelecionado(null);
    setAlmoxarifadoModalSelecionado(null);
  };

  const handleSalvarItemOS = async () => {
    if (!itemOS.almoxarifadoId || !itemOS.produtoId || !itemOS.quantidade) {
      mostrarMensagem("Preencha almoxarifado, produto e quantidade.", "erro");
      return;
    }

    if (!itemOS.almoxarifadoNome) {
      mostrarMensagem(
        "Almoxarifado não encontrado para o ID informado.",
        "erro",
      );
      return;
    }

    if (!itemOS.produtoNome) {
      mostrarMensagem(
        "Produto não encontrado nesse almoxarifado para o ID informado.",
        "erro",
      );
      return;
    }

    if (Number(itemOS.quantidade) <= 0) {
      mostrarMensagem("Quantidade deve ser maior que zero.", "erro");
      return;
    }

    if (
      itemOS.saldoDisponivel &&
      Number(itemOS.quantidade) > Number(itemOS.saldoDisponivel)
    ) {
      mostrarMensagem(
        "Quantidade maior que o saldo disponível no almoxarifado.",
        "erro",
      );
      return;
    }

    const itemParaSalvar = {
      osId: Number(ordemId),
      produtoId: Number(itemOS.produtoId),
      almoxarifadoId: Number(itemOS.almoxarifadoId),
      quantidade: Number(itemOS.quantidade),
    };

    try {
      if (itemEditando) {
        await atualizarOrdemServicoItem(itemEditando.id, itemParaSalvar);

        mostrarMensagem("Produto da OS atualizado com sucesso.", "sucesso");
      } else {
        await cadastrarOrdemServicoItem(itemParaSalvar);

        mostrarMensagem("Produto adicionado à OS com sucesso.", "sucesso");
      }

      handleFecharModal();
      carregarProdutosOS();
      carregarSeletores();
    } catch (error) {
      const mensagemErro = extrairMensagemErro(
        error,
        itemEditando
          ? "Erro ao atualizar produto da OS."
          : "Erro ao adicionar produto na OS.",
      );

      mostrarMensagem(mensagemErro, "erro");
    }
  };

  return (
    <div
      className="produtos-os-tab"
      onClick={() => setProdutoSelecionado(null)}
    >
      <div
        className="produtos-os-actions"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          disabled={ordemEncerrada}
          onClick={() => {
            setItemEditando(null);
            setItemOS({ ...itemOSInicial });
            setModalAberto(true);
          }}
        >
          Novo
        </button>

        <button
          type="button"
          disabled={ordemEncerrada}
          onClick={handleEditarProduto}
        >
          Editar
        </button>

        <button
          type="button"
          disabled={ordemEncerrada}
          onClick={handleDeletarProduto}
        >
          Deletar
        </button>
      </div>

      <div
        className="produtos-os-table-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        <table className="produtos-os-table">
          <thead>
            <tr>
              <th>ID Produto</th>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Valor Unit.</th>
              <th>Valor Total</th>
              <th>Almoxarifado ID</th>
            </tr>
          </thead>
          <tbody>
            {produtosOS.length > 0 ? (
              produtosOS.map((item) => (
                <tr
                  key={item.id}
                  className={
                    produtoSelecionado?.id === item.id ? "selected-row" : ""
                  }
                  onClick={() => setProdutoSelecionado(item)}
                >
                  <td>{item.produtoId}</td>
                  <td>{item.produtoNome}</td>
                  <td>{item.quantidade}</td>
                  <td>{formatarMoeda(item.valorUnitario)}</td>
                  <td>{formatarMoeda(item.valorTotal)}</td>
                  <td>{item.almoxarifadoId}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state-cell">
                  Nenhum produto vinculado a esta OS.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content produtos-os-modal">
            <div className="modal-header">
              <h2>
                {itemEditando ? "Editar produto da OS" : "Adicionar produto na OS"}
              </h2>
              <button type="button" onClick={handleFecharModal}>
                X
              </button>
            </div>
            <div className="modal-body produtos-os-modal-body">
              <div className="form-group">
                <label>Almoxarifado</label>
                <div
                  className="lookup-field lookup-field-clickable produtos-os-lookup-field"
                  onClick={(event) => {
                    if (
                      event.target.tagName === "INPUT" &&
                      !event.target.readOnly
                    ) {
                      return;
                    }

                    abrirSeletorAlmoxarifado();
                  }}
                >
                  <input
                    type="number"
                    name="almoxarifadoId"
                    value={itemOS.almoxarifadoId}
                    onChange={handleChangeItemOS}
                    placeholder="ID"
                  />
                  <input
                    type="text"
                    value={itemOS.almoxarifadoNome}
                    placeholder="Selecione um almoxarifado"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      abrirSeletorAlmoxarifado();
                    }}
                    aria-label="Buscar almoxarifado"
                    title="Buscar almoxarifado"
                  >
                    <FiSearch />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Produto</label>
                <div
                  className={`lookup-field produtos-os-lookup-field ${
                    itemOS.almoxarifadoId ? "lookup-field-clickable" : ""
                  }`}
                  onClick={(event) => {
                    if (
                      event.target.tagName === "INPUT" &&
                      !event.target.readOnly
                    ) {
                      return;
                    }

                    abrirSeletorProduto();
                  }}
                >
                  <input
                    type="number"
                    name="produtoId"
                    value={itemOS.produtoId}
                    onChange={handleChangeItemOS}
                    placeholder="ID"
                    disabled={!itemOS.almoxarifadoId}
                  />
                  <input
                    type="text"
                    value={itemOS.produtoNome}
                    placeholder={
                      itemOS.almoxarifadoId
                        ? "Selecione um produto"
                        : "Selecione o almoxarifado primeiro"
                    }
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      abrirSeletorProduto();
                    }}
                    disabled={!itemOS.almoxarifadoId}
                    aria-label="Buscar produto"
                    title="Buscar produto"
                  >
                    <FiSearch />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Saldo disponível</label>
                <input
                  type="text"
                  value={itemOS.saldoDisponivel}
                  placeholder="Selecione um produto"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Quantidade</label>
                <input
                  type="number"
                  name="quantidade"
                  value={itemOS.quantidade}
                  onChange={handleChangeItemOS}
                  placeholder="Digite a quantidade"
                  min="1"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={handleFecharModal}>
                Cancelar
              </button>
              <button type="button" onClick={handleSalvarItemOS}>
                {itemEditando ? "Atualizar" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmarDeleteAberto && produtoSelecionado && (
        <div
          className="modal-overlay"
          onClick={() => setConfirmarDeleteAberto(false)}
        >
          <div
            className="modal-content produtos-os-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Remover produto da OS</h2>
              <button
                type="button"
                onClick={() => setConfirmarDeleteAberto(false)}
              >
                X
              </button>
            </div>

            <div className="modal-body">
              <p>
                Tem certeza que deseja remover{" "}
                <strong>{produtoSelecionado.produtoNome}</strong> desta ordem de
                serviço?
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setConfirmarDeleteAberto(false)}
              >
                Cancelar
              </button>
              <button type="button" onClick={confirmarDeleteProduto}>
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {seletorProdutoAberto && (
        <div
          className="selector-overlay"
          onClick={() => setProdutoModalSelecionado(null)}
        >
          <div className="selector-box" onClick={(e) => e.stopPropagation()}>
            <div className="selector-header">
              <h2>Selecionar produto</h2>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSeletorProdutoAberto(false)}
              >
                X
              </button>
            </div>

            <div className="selector-actions">
              <input
                type="text"
                value={buscaProduto}
                onChange={(e) => {
                  setBuscaProduto(e.target.value);
                  setPaginaProdutoAtual(1);
                }}
                placeholder="Buscar por ID ou nome"
              />
              <div className="pagination-controls selector-pagination-controls">
                <button
                  type="button"
                  onClick={() => setPaginaProdutoAtual(1)}
                  disabled={paginaProdutoAtual === 1}
                >
                  <FiChevronsLeft />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaginaProdutoAtual((paginaAtual) =>
                      Math.max(paginaAtual - 1, 1),
                    )
                  }
                  disabled={paginaProdutoAtual === 1}
                >
                  <FiChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBuscaProduto("");
                    setProdutoModalSelecionado(null);
                    setPaginaProdutoAtual(1);
                  }}
                >
                  <FiRefreshCw />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaginaProdutoAtual((paginaAtual) =>
                      Math.min(paginaAtual + 1, totalPaginasProduto),
                    )
                  }
                  disabled={
                    totalPaginasProduto === 0 ||
                    paginaProdutoAtual === totalPaginasProduto
                  }
                >
                  <FiChevronRight />
                </button>
                <button
                  type="button"
                  onClick={() => setPaginaProdutoAtual(totalPaginasProduto)}
                  disabled={
                    totalPaginasProduto === 0 ||
                    paginaProdutoAtual === totalPaginasProduto
                  }
                >
                  <FiChevronsRight />
                </button>
                <span className="total-itens">
                  {`${inicioExibidoProduto} - ${fimExibidoProduto} / ${produtosOrdenados.length}`}
                </span>
              </div>
            </div>

            <div className="selector-table-wrapper">
              <table className="selector-table">
                <thead>
                  <tr>
                    <th onClick={() => handleOrdenarProduto("id")}>
                      <span className="sortable-header">
                        ID
                        {renderIconeOrdenacao(ordenacaoProduto, "id")}
                      </span>
                    </th>
                    <th onClick={() => handleOrdenarProduto("nome")}>
                      <span className="sortable-header">
                        Produto
                        {renderIconeOrdenacao(ordenacaoProduto, "nome")}
                      </span>
                    </th>
                    <th onClick={() => handleOrdenarProduto("saldo")}>
                      <span className="sortable-header">
                        Saldo
                        {renderIconeOrdenacao(ordenacaoProduto, "saldo")}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {produtosPaginados.map((produto) => (
                    <tr
                      key={produto.id}
                      className={
                        produtoModalSelecionado?.id === produto.id
                          ? "selected-row"
                          : ""
                      }
                      onClick={() => setProdutoModalSelecionado(produto)}
                      onDoubleClick={() => {
                        setItemOS((itemAtual) => ({
                          ...itemAtual,
                          produtoId: produto.id,
                          produtoNome: produto.nome,
                          saldoDisponivel: String(produto.saldo ?? ""),
                        }));
                        setSeletorProdutoAberto(false);
                        setProdutoModalSelecionado(null);
                      }}
                    >
                      <td>{produto.id}</td>
                      <td>{produto.nome}</td>
                      <td>{produto.saldo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="selector-footer">
              <button type="button" onClick={handleSelecionarProduto}>
                Selecionar
              </button>
            </div>
          </div>
        </div>
      )}

      {seletorAlmoxarifadoAberto && (
        <div
          className="selector-overlay"
          onClick={() => setAlmoxarifadoModalSelecionado(null)}
        >
          <div className="selector-box" onClick={(e) => e.stopPropagation()}>
            <div className="selector-header">
              <h2>Selecionar almoxarifado</h2>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSeletorAlmoxarifadoAberto(false)}
              >
                X
              </button>
            </div>

            <div className="selector-actions">
              <input
                type="text"
                value={buscaAlmoxarifado}
                onChange={(e) => {
                  setBuscaAlmoxarifado(e.target.value);
                  setPaginaAlmoxarifadoAtual(1);
                }}
                placeholder="Buscar por ID ou nome"
              />
              <div className="pagination-controls selector-pagination-controls">
                <button
                  type="button"
                  onClick={() => setPaginaAlmoxarifadoAtual(1)}
                  disabled={paginaAlmoxarifadoAtual === 1}
                >
                  <FiChevronsLeft />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaginaAlmoxarifadoAtual((paginaAtual) =>
                      Math.max(paginaAtual - 1, 1),
                    )
                  }
                  disabled={paginaAlmoxarifadoAtual === 1}
                >
                  <FiChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBuscaAlmoxarifado("");
                    setAlmoxarifadoModalSelecionado(null);
                    setPaginaAlmoxarifadoAtual(1);
                  }}
                >
                  <FiRefreshCw />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaginaAlmoxarifadoAtual((paginaAtual) =>
                      Math.min(paginaAtual + 1, totalPaginasAlmoxarifado),
                    )
                  }
                  disabled={
                    totalPaginasAlmoxarifado === 0 ||
                    paginaAlmoxarifadoAtual === totalPaginasAlmoxarifado
                  }
                >
                  <FiChevronRight />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPaginaAlmoxarifadoAtual(totalPaginasAlmoxarifado)
                  }
                  disabled={
                    totalPaginasAlmoxarifado === 0 ||
                    paginaAlmoxarifadoAtual === totalPaginasAlmoxarifado
                  }
                >
                  <FiChevronsRight />
                </button>
                <span className="total-itens">
                  {`${inicioExibidoAlmoxarifado} - ${fimExibidoAlmoxarifado} / ${almoxarifadosOrdenados.length}`}
                </span>
              </div>
            </div>

            <div className="selector-table-wrapper">
              <table className="selector-table">
                <thead>
                  <tr>
                    <th onClick={() => handleOrdenarAlmoxarifado("id")}>
                      <span className="sortable-header">
                        ID
                        {renderIconeOrdenacao(ordenacaoAlmoxarifado, "id")}
                      </span>
                    </th>
                    <th onClick={() => handleOrdenarAlmoxarifado("nome")}>
                      <span className="sortable-header">
                        Almoxarifado
                        {renderIconeOrdenacao(ordenacaoAlmoxarifado, "nome")}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {almoxarifadosPaginados.map((almoxarifado) => (
                    <tr
                      key={almoxarifado.id}
                      className={
                        almoxarifadoModalSelecionado?.id === almoxarifado.id
                          ? "selected-row"
                          : ""
                      }
                      onClick={() =>
                        setAlmoxarifadoModalSelecionado(almoxarifado)
                      }
                      onDoubleClick={() => {
                        setItemOS((itemAtual) => ({
                          ...itemAtual,
                          almoxarifadoId: almoxarifado.id,
                          almoxarifadoNome: almoxarifado.nome,
                          produtoId: "",
                          produtoNome: "",
                          saldoDisponivel: "",
                        }));
                        setSeletorAlmoxarifadoAberto(false);
                        setAlmoxarifadoModalSelecionado(null);
                      }}
                    >
                      <td>{almoxarifado.id}</td>
                      <td>{almoxarifado.nome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="selector-footer">
              <button type="button" onClick={handleSelecionarAlmoxarifado}>
                Selecionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProdutosOSTab;

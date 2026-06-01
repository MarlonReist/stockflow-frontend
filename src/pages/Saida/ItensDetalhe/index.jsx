import React, { useState, useEffect } from "react";
import "./ItensDetalhe.css";
import {
  FiChevronsLeft,
  FiChevronLeft,
  FiRefreshCw,
  FiChevronRight,
  FiChevronsRight,
  FiSearch,
  FiArrowLeft,
} from "react-icons/fi";
import { IMaskInput } from "react-imask";
import { useNavigate, useParams } from "react-router-dom";
import { listarProdutos } from "../../../services/produtoService";
import { formatarUnidadeMedida } from "../../../utils/unidadeMedida";
import {
  cadastrarSaidaItem,
  listarSaidaItens,
  deletarSaidaItem,
  atualizarSaidaItem,
} from "../../../services/saidaItemService";

const movimentacaoInicial = {
  idMov: "",
  idProduto: "",
  produtoNome: "",
  quantidade: "",
  unidade: "",
  valorUnitario: "",
  valorTotal: "",
};

const ItensDetalhe = () => {
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [movimentacao, setMovimentacao] = useState({ ...movimentacaoInicial });
  const [movimentacaoSalva, setMovimentacaoSalva] = useState(false);
  const [seletorProdutoAberto, setSeletorProdutoAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [paginaSaidaItensAtuais, setPaginaSaidaItensAtual] = useState(1);
  const [paginaProdutoAtual, setPaginaProdutoAtual] = useState(1);
  const itensPorPaginaSaida = 10;
  const itensPorPaginaProduto = 10;
  const [produtos, setProdutos] = useState([]);
  const [saidaItens, setSaidaItens] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  const saidaItensFiltrados = saidaItens;

  useEffect(() => {
    carregarSaidaItens();
  }, [id]);

  const carregarSaidaItens = async () => {
    try {
      const response = await listarSaidaItens();
      const itensDaSaida = response.data.filter((item) => {
        return item.saidaEstoqueId === Number(id);
      });
      setSaidaItens(itensDaSaida);
    } catch (error) {
      mostrarMensagem("Erro ao listar Saída Itens", "erro");
    }
  };

  useEffect(() => {
    const buscarProdutos = async () => {
      try {
        const response = await listarProdutos();
        setProdutos(response.data);
      } catch (error) {
        mostrarMensagem("Erro ao carregar produtos", "erro");
      }
    };
    buscarProdutos();
  }, []);

  const mostrarMensagem = (texto, tipo) => {
    const id = `${Date.now()}-${Math.random()}`;

    setMensagens((mensagensAtuais) => [
      ...mensagensAtuais,
      { id, texto, tipo },
    ]);

    setTimeout(() => {
      setMensagens((mensagensAtuais) =>
        mensagensAtuais.filter((mensagem) => mensagem.id !== id),
      );
    }, 3000);
  };

  const formatarPrecoParaInput = (preco) => {
    if (preco == null || preco === "") return "";
    return Number(preco).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatarMoeda = (valor) => {
    if (valor == null || valor === "") return "";
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleSalvarMovimentacao = async () => {
    if (!movimentacao.idProduto || !movimentacao.produtoNome) {
      mostrarMensagem("Selecione um produto", "erro");
      return;
    }

    if (!movimentacao.quantidade) {
      mostrarMensagem("Informe a quantidade", "erro");
      return;
    }

    if (!movimentacao.valorUnitario) {
      mostrarMensagem("Informe o valor unitario", "erro");
      return;
    }

    const payload = {
      saidaEstoqueId: Number(id),
      produtoId: Number(movimentacao.idProduto),
      quantidade: Number(movimentacao.quantidade),
      valorUnitario: Number(
        movimentacao.valorUnitario.replace(/\./g, "").replace(",", "."),
      ),
    };

    try {
      let response;
      if (movimentacao.idMov) {
        response = await atualizarSaidaItem(movimentacao.idMov, payload);
      } else {
        response = await cadastrarSaidaItem(payload);
      }

      const itemSalvo = response.data;

      setMovimentacao((movimentacaoAtual) => ({
        ...movimentacaoAtual,
        idMov: itemSalvo.id,
        produtoNome: itemSalvo.produtoNome,
        valorTotal: formatarMoeda(itemSalvo.valorTotal),
      }));
      setMovimentacaoSalva(true);
      mostrarMensagem("Item salvo com sucesso", "sucesso");
      carregarSaidaItens();
    } catch (error) {
      mostrarMensagem(error.response?.data?.message, "erro");
    }
  };

  const handleEditarItem = (item = itemSelecionado) => {
    if (!item) {
      mostrarMensagem("Selecione um registro", "erro");
      return;
    }

    setMovimentacao({
      idMov: String(item.id ?? ""),
      idProduto: String(item.produtoId ?? ""),
      produtoNome: item.produtoNome ?? "",
      quantidade: String(item.quantidade ?? ""),
      unidade: formatarUnidadeMedida(item.unidadeMedida),
      valorUnitario: formatarPrecoParaInput(item.valorUnitario),
      valorTotal: formatarMoeda(item.valorTotal),
    });

    setMovimentacaoSalva(false);
    setProdutoSelecionado(null);
    setBuscaProduto("");
    setModalAberto(true);
  };

  const handleDelete = async (id) => {
    try {
      await deletarSaidaItem(id);

      setSaidaItens((saidaItensAtuais) =>
        saidaItensAtuais.filter((saidaItem) => saidaItem.id !== id),
      );

      mostrarMensagem("Item excluido com sucesso", "sucesso");
      setItemSelecionado(null);
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao excluir item.";

      mostrarMensagem(mensagemErro, "erro");
      setItemSelecionado(null);
    }
  };

  const handleDeletarItem = async () => {
    if (!itemSelecionado) {
      mostrarMensagem("Selecione um registro", "erro");
      return;
    }

    await handleDelete(itemSelecionado.id);
  };

  const produtosFiltrados = produtos.filter((produto) => {
    const buscaFormatada = buscaProduto.toLowerCase();

    return (
      produto.nome.toLowerCase().includes(buscaFormatada) ||
      String(produto.id).includes(buscaFormatada)
    );
  });

  const indiceInicial = (paginaSaidaItensAtuais - 1) * itensPorPaginaSaida;
  const indiceInicialProduto = (paginaProdutoAtual - 1) * itensPorPaginaProduto;

  const indiceFinal = indiceInicial + itensPorPaginaSaida;
  const indiceFinalProduto = indiceInicialProduto + itensPorPaginaProduto;

  const saidaItensPaginados = saidaItensFiltrados.slice(
    indiceInicial,
    indiceFinal,
  );
  const produtosPaginados = produtosFiltrados.slice(
    indiceInicialProduto,
    indiceFinalProduto,
  );

  const totalPaginasSaidasItens = Math.ceil(
    saidaItensFiltrados.length / itensPorPaginaSaida,
  );
  const totalPaginasProduto = Math.ceil(
    produtosFiltrados.length / itensPorPaginaProduto,
  );

  const inicioExibidoSaida =
    saidaItensFiltrados.length > 0 ? indiceInicial + 1 : 0;
  const inicioExibidoProduto =
    produtosFiltrados.length > 0 ? indiceInicialProduto + 1 : 0;

  const fimExibidoSaidaItens = Math.min(
    indiceFinal,
    saidaItensFiltrados.length,
  );
  const fimExibidoProduto = Math.min(
    indiceFinalProduto,
    produtosFiltrados.length,
  );

  const handlePrimeiraPaginaSaidaItens = () => {
    setPaginaSaidaItensAtual(1);
  };
  const handlePrimeiraPaginaProduto = () => {
    setPaginaProdutoAtual(1);
  };

  const handlePaginaAnteriorSaidaItens = () => {
    if (paginaSaidaItensAtuais > 1) {
      setPaginaSaidaItensAtual(paginaSaidaItensAtuais - 1);
    }
  };
  const handlePaginaAnteriorProduto = () => {
    if (paginaProdutoAtual > 1) {
      setPaginaProdutoAtual(paginaProdutoAtual - 1);
    }
  };

  const handleRecarregarSaidaItens = () => {
    setItemSelecionado(null);
    setPaginaSaidaItensAtual(1);
    carregarSaidaItens();
  };
  const handleRecarregarProduto = () => {
    setBuscaProduto("");
    setProdutoSelecionado(null);
    setPaginaProdutoAtual(1);
  };

  const handleProximaPaginaSaidaItens = () => {
    if (paginaSaidaItensAtuais < totalPaginasSaidasItens)
      setPaginaSaidaItensAtual(paginaSaidaItensAtuais + 1);
  };
  const handleProximaPaginaProduto = () => {
    if (paginaProdutoAtual < totalPaginasProduto)
      setPaginaProdutoAtual(paginaProdutoAtual + 1);
  };

  const handleUltimaPaginaSaidaItens = () => {
    setPaginaSaidaItensAtual(totalPaginasSaidasItens);
  };
  const handleUltimaPaginaProduto = () => {
    setPaginaProdutoAtual(totalPaginasProduto);
  };

  const confirmarProduto = (produto) => {
    setMovimentacao((movimentacaoAtual) => ({
      ...movimentacaoAtual,
      idProduto: produto.id,
      produtoNome: produto.nome,
      unidade: produto.unidadeMedida || "",
      valorUnitario: formatarPrecoParaInput(produto.preco),
    }));

    setSeletorProdutoAberto(false);
    setProdutoSelecionado(null);
    setBuscaProduto("");
  };

  const handleProdutoIdChange = (e) => {
    const valorDigitado = e.target.value;
    const produtoEncontrado = produtos.find(
      (produto) => String(produto.id) === valorDigitado,
    );

    setMovimentacao((movimentacaoAtual) => ({
      ...movimentacaoAtual,
      idProduto: valorDigitado,
      produtoNome: produtoEncontrado ? produtoEncontrado.nome : "",
      unidade: produtoEncontrado ? produtoEncontrado.unidadeMedida || "" : "",
      valorUnitario: produtoEncontrado
        ? formatarPrecoParaInput(produtoEncontrado.preco)
        : "",
    }));
  };

  return (
    <div className="saida-itens-page">
      <div className="saida-itens-header">
        <div className="saida-itens-header-top">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/saida/itens")}
            aria-label="Voltar para saída"
            title="Voltar"
          >
            <FiArrowLeft />
          </button>
          <h1>Itens da Saída</h1>
        </div>
        <p>Gerencie os itens vinculados a esta saída</p>
      </div>
      <div className="saida-itens-actions">
        <button
          type="button"
          className="new-item-button"
          onClick={() => {
            setMovimentacao({ ...movimentacaoInicial });
            setMovimentacaoSalva(false);
            setProdutoSelecionado(null);
            setBuscaProduto("");
            setModalAberto(true);
          }}
        >
          Novo
        </button>
        <button
          type="button"
          className="edit-item-button"
          onClick={() => handleEditarItem()}
        >
          Editar
        </button>
        <button
          type="button"
          className="delete-item-button"
          onClick={handleDeletarItem}
        >
          Deletar
        </button>
        <div className="pagination-controls">
          <button
            className="first"
            onClick={handlePrimeiraPaginaSaidaItens}
            disabled={paginaSaidaItensAtuais === 1}
          >
            <FiChevronsLeft />
          </button>
          <button
            className="previous"
            onClick={handlePaginaAnteriorSaidaItens}
            disabled={paginaSaidaItensAtuais === 1}
          >
            <FiChevronLeft />
          </button>
          <button className="refresh" onClick={handleRecarregarSaidaItens}>
            <FiRefreshCw />
          </button>
          <button
            className="next"
            onClick={handleProximaPaginaSaidaItens}
            disabled={
              totalPaginasSaidasItens === 0 ||
              paginaSaidaItensAtuais === totalPaginasSaidasItens
            }
          >
            <FiChevronRight />
          </button>
          <button
            className="last"
            onClick={handleUltimaPaginaSaidaItens}
            disabled={
              totalPaginasSaidasItens === 0 ||
              paginaSaidaItensAtuais === totalPaginasSaidasItens
            }
          >
            <FiChevronsRight />
          </button>
          <span className="total-itens">
            {`${inicioExibidoSaida} - ${fimExibidoSaidaItens} / ${saidaItensFiltrados.length}`}
          </span>
        </div>
      </div>
      <div className="saida-itens-card">
        <div className="saida-itens-table-wrapper">
          <table className="saida-itens-table">
            <thead>
              <tr>
                <th>ID Mov.</th>
                <th>ID Produto</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Unidade</th>
                <th>Valor Unit.</th>
                <th>Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {saidaItensPaginados.map((item) => (
                <tr
                  key={item.id}
                  className={
                    itemSelecionado?.id === item.id ? "selected-row" : ""
                  }
                  onClick={() => {
                    setItemSelecionado(item);
                  }}
                  onDoubleClick={() => handleEditarItem(item)}
                >
                  <td>{item.id}</td>
                  <td>{item.produtoId}</td>
                  <td>{item.produtoNome}</td>
                  <td>{item.quantidade}</td>
                  <td>{formatarUnidadeMedida(item.unidadeMedida)}</td>
                  <td>{formatarMoeda(item.valorUnitario)}</td>
                  <td>{formatarMoeda(item.valorTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modalAberto && (
        <div className="overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h1>Movimentação de Produtos</h1>
              <button
                className="close-modal-btn"
                onClick={() => {
                  setModalAberto(false);
                }}
              >
                X
              </button>
            </div>
            <div className="modal-actions">
              <button
                className="new-modal-btn"
                onClick={() => {
                  setMovimentacao({ ...movimentacaoInicial });
                  setMovimentacaoSalva(false);
                }}
              >
                Novo
              </button>
              <button
                className="cancel-modal-btn"
                disabled={movimentacaoSalva}
                onClick={() => {
                  setModalAberto(false);
                }}
              >
                Cancelar
              </button>
              <button
                className="save-modal-btn"
                disabled={movimentacaoSalva}
                onClick={handleSalvarMovimentacao}
              >
                {movimentacaoSalva ? "Salvo" : "Salvar"}
              </button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>ID Mov.</label>
                <input type="text" value={movimentacao.idMov} readOnly />
              </div>
              <div className="form-group">
                <label>Produto</label>
                <div className="lookup-field">
                  <input
                    type="text"
                    name="idProduto"
                    value={movimentacao.idProduto}
                    onChange={handleProdutoIdChange}
                    readOnly={movimentacaoSalva}
                  />
                  <input
                    type="text"
                    name="produtoNome"
                    value={movimentacao.produtoNome}
                    readOnly={true}
                  />
                  <button
                    name="magnifier"
                    type="button"
                    onClick={() => {
                      setSeletorProdutoAberto(true);
                      setBuscaProduto("");
                      setProdutoSelecionado(null);
                    }}
                  >
                    <FiSearch />
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Unidade</label>
                <input type="text" value={movimentacao.unidade} readOnly />
              </div>
              <div className="form-group">
                <label>Quantidade</label>
                <IMaskInput
                  mask={Number}
                  name="quantidade"
                  placeholder="Digite a quantidade do produto"
                  value={movimentacao.quantidade}
                  onAccept={(value) => {
                    setMovimentacao((movimentacaoAtual) => ({
                      ...movimentacaoAtual,
                      quantidade: value,
                    }));
                  }}
                  readOnly={movimentacaoSalva}
                />
              </div>
              <div className="form-group">
                <label>Valor Unitário</label>
                <div className="currency-field">
                  <span className="currency-prefix">R$</span>
                  <IMaskInput
                    mask={Number}
                    scale={2}
                    radix=","
                    thousandsSeparator="."
                    name="valorUnitario"
                    placeholder="Digite o valor unitário"
                    value={movimentacao.valorUnitario}
                    onAccept={(value) => {
                      setMovimentacao((movimentacaoAtual) => ({
                        ...movimentacaoAtual,
                        valorUnitario: value,
                      }));
                    }}
                    readOnly={movimentacaoSalva}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Valor Total</label>
                <input type="text" value={movimentacao.valorTotal} readOnly />
              </div>
            </div>
          </div>
        </div>
      )}
      {seletorProdutoAberto && (
        <div className="produto-overlay">
          <div className="produto-box">
            <div className="produto-header">
              <h1>Produtos</h1>
              <button
                className="close-modal-btn"
                onClick={() => {
                  setSeletorProdutoAberto(false);
                }}
              >
                X
              </button>
            </div>
            <div className="produto-actions">
              <input
                type="text"
                placeholder="Buscar por ID ou Nome..."
                value={buscaProduto}
                onChange={(e) => {
                  setBuscaProduto(e.target.value);
                  setPaginaProdutoAtual(1);
                }}
              />
              <div className="pagination-controls produto-pagination-controls">
                <button
                  className="first"
                  onClick={handlePrimeiraPaginaProduto}
                  disabled={paginaProdutoAtual === 1}
                >
                  <FiChevronsLeft />
                </button>
                <button
                  className="previous"
                  onClick={handlePaginaAnteriorProduto}
                  disabled={paginaProdutoAtual === 1}
                >
                  <FiChevronLeft />
                </button>
                <button className="refresh" onClick={handleRecarregarProduto}>
                  <FiRefreshCw />
                </button>
                <button
                  className="next"
                  onClick={handleProximaPaginaProduto}
                  disabled={
                    totalPaginasProduto === 0 ||
                    paginaProdutoAtual === totalPaginasProduto
                  }
                >
                  <FiChevronRight />
                </button>
                <button
                  className="last"
                  onClick={handleUltimaPaginaProduto}
                  disabled={
                    totalPaginasProduto === 0 ||
                    paginaProdutoAtual === totalPaginasProduto
                  }
                >
                  <FiChevronsRight />
                </button>
                <span className="total-itens">
                  {`${inicioExibidoProduto} - ${fimExibidoProduto} / ${produtosFiltrados.length}`}
                </span>
              </div>
            </div>
            <div className="produto-table-wrapper">
              <table className="produto-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Preco</th>
                    <th>Categoria</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosPaginados.map((produto) => (
                    <tr
                      key={produto.id}
                      className={
                        produtoSelecionado?.id === produto.id
                          ? "selected-row"
                          : ""
                      }
                      onClick={() => {
                        produtoSelecionado?.id === produto.id
                          ? setProdutoSelecionado(null)
                          : setProdutoSelecionado(produto);
                      }}
                      onDoubleClick={() => confirmarProduto(produto)}
                    >
                      <td>{produto.id}</td>
                      <td>{produto.nome}</td>
                      <td>{produto.preco}</td>
                      <td>{produto.categoria}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="produto-footer">
              <button
                onClick={() => {
                  if (produtoSelecionado) {
                    confirmarProduto(produtoSelecionado);
                  } else {
                    mostrarMensagem("Selecione um registro", "erro");
                  }
                }}
              >
                Selecionar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="toast-container">
        {mensagens.map((mensagem) => (
          <div
            key={mensagem.id}
            className={`form-message form-message-${mensagem.tipo}`}
          >
            {mensagem.texto}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItensDetalhe;

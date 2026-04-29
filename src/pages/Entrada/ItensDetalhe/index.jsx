import React, { useState } from "react";
import "./ItensDetalhe.css";
import {
  FiChevronsLeft,
  FiChevronLeft,
  FiRefreshCw,
  FiChevronRight,
  FiChevronsRight,
} from "react-icons/fi";

const itensMock = [
  {
    idMov: 1,
    idProduto: 1,
    produtoNome: "Roteador",
    quantidade: 1,
    unidade: "Unidade",
    almoxarifado: "Técnico",
    valorUnitario: "250,00",
    valorTotal: "250,00",
  },
  {
    idMov: 2,
    idProduto: 2,
    produtoNome: "Alça",
    quantidade: 25,
    unidade: "Unidade",
    almoxarifado: "Carro",
    valorUnitario: "3,00",
    valorTotal: "75,00",
  },
];

const ItensDetalhe = () => {
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [mensagens, setMensagens] = useState([]);

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

  const handleEditarItem = () => {
    if (!itemSelecionado) {
      mostrarMensagem("Selecione um registro", "erro");
      return;
    }
    console.log(itemSelecionado);
  };

  const handleDeletarItem = () => {
    if (!itemSelecionado) {
      mostrarMensagem("Selecione um registro", "erro");
      return;
    }
    console.log(itemSelecionado);
  };

  return (
    <div className="entrada-itens-page">
      <div className="entrada-itens-header">
        <h1>Itens da Entrada</h1>
        <p>Gerencie os itens vinculados a esta entrada</p>
      </div>
      <div className="entrada-itens-actions">
        <button
          type="button"
          className="new-item-button"
          onClick={() => console.log("Novo produto")}
        >
          Novo
        </button>
        <button
          type="button"
          className="edit-item-button"
          onClick={handleEditarItem}
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
          <button className="first">
            <FiChevronsLeft />
          </button>
          <button className="previous">
            <FiChevronLeft />
          </button>
          <button className="refresh">
            <FiRefreshCw />
          </button>
          <button className="next">
            <FiChevronRight />
          </button>
          <button className="last">
            <FiChevronsRight />
          </button>
          <span className="total-itens">1 - 2 / 2</span>
        </div>
      </div>
      <div className="entrada-itens-card">
        <div className="entrada-itens-table-wrapper">
          <table className="entrada-itens-table">
            <thead>
              <tr>
                <th>ID Mov.</th>
                <th>ID Produto</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Unidade</th>
                <th>Almoxarifado</th>
                <th>Valor Unit.</th>
                <th>Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {itensMock.map((item) => (
                <tr
                  key={item.idMov}
                  className={
                    itemSelecionado?.idMov === item.idMov ? "selected-row" : ""
                  }
                  onClick={() => {
                    itemSelecionado?.idMov === item.idMov
                      ? setItemSelecionado(null)
                      : setItemSelecionado(item);
                  }}
                >
                  <td>{item.idMov}</td>
                  <td>{item.idProduto}</td>
                  <td>{item.produtoNome}</td>
                  <td>{item.quantidade}</td>
                  <td>{item.unidade}</td>
                  <td>{item.almoxarifado}</td>
                  <td>{item.valorUnitario}</td>
                  <td>{item.valorTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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

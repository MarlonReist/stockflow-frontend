import React, { useEffect, useRef, useState } from "react";
import { FiClock, FiEdit2, FiWifi, FiX } from "react-icons/fi";
import {
  atualizarRoteadorPrincipal,
  buscarSugestoesRoteador,
  listarHistoricoRoteador,
} from "../../../services/clientesService";

const formatarPropriedade = (valor) => {
  if (valor === "PROPRIO") return "Próprio";
  if (valor === "COMODATO") return "Comodato";
  return "Não informado";
};

const formatarDataHora = (valor) => {
  if (!valor) return "Não informado";
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
};

const RoteadorPrincipalModal = ({
  cliente,
  podeAdministrar,
  onClose,
  onAtualizado,
  mostrarMensagem,
}) => {
  const [modoEdicao, setModoEdicao] = useState(false);
  const [modelo, setModelo] = useState(cliente.modeloRoteadorPrincipal || "");
  const [propriedade, setPropriedade] = useState(
    cliente.propriedadeRoteadorPrincipal || "",
  );
  const [sugestoes, setSugestoes] = useState([]);
  const [carregandoSugestoes, setCarregandoSugestoes] = useState(false);
  const [erroSugestoes, setErroSugestoes] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [erroHistorico, setErroHistorico] = useState("");
  const requisicaoSugestoesRef = useRef(0);

  useEffect(() => {
    if (!modoEdicao || !modelo.trim()) {
      setSugestoes([]);
      setCarregandoSugestoes(false);
      setErroSugestoes("");
      return undefined;
    }

    const requisicaoAtual = ++requisicaoSugestoesRef.current;
    const timeout = setTimeout(async () => {
      setCarregandoSugestoes(true);
      setErroSugestoes("");
      try {
        const response = await buscarSugestoesRoteador(modelo.trim());
        if (requisicaoAtual === requisicaoSugestoesRef.current) {
          setSugestoes(response.data || []);
        }
      } catch {
        if (requisicaoAtual === requisicaoSugestoesRef.current) {
          setSugestoes([]);
          setErroSugestoes("Não foi possível carregar as sugestões.");
        }
      } finally {
        if (requisicaoAtual === requisicaoSugestoesRef.current) {
          setCarregandoSugestoes(false);
        }
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [modelo, modoEdicao]);

  const cancelarEdicao = () => {
    setModelo(cliente.modeloRoteadorPrincipal || "");
    setPropriedade(cliente.propriedadeRoteadorPrincipal || "");
    setSugestoes([]);
    setErroSugestoes("");
    setModoEdicao(false);
  };

  const salvar = async (event) => {
    event.preventDefault();
    const modeloNormalizado = modelo.trim();
    if (!modeloNormalizado || !propriedade) {
      mostrarMensagem("Informe o modelo e a propriedade do roteador.", "erro");
      return;
    }

    setSalvando(true);
    try {
      const response = await atualizarRoteadorPrincipal(cliente.id, {
        modelo: modeloNormalizado,
        propriedade,
      });
      onAtualizado(response.data);
      setModoEdicao(false);
      setSugestoes([]);
      mostrarMensagem("Roteador principal atualizado com sucesso.", "sucesso");
    } catch (error) {
      mostrarMensagem(
        error.response?.data?.message || "Erro ao atualizar o roteador principal.",
        "erro",
      );
    } finally {
      setSalvando(false);
    }
  };

  const abrirHistorico = async () => {
    setHistoricoAberto(true);
    setCarregandoHistorico(true);
    setErroHistorico("");
    try {
      const response = await listarHistoricoRoteador(cliente.id);
      setHistorico(response.data || []);
    } catch (error) {
      setErroHistorico(
        error.response?.data?.message || "Não foi possível carregar o histórico.",
      );
    } finally {
      setCarregandoHistorico(false);
    }
  };

  return (
    <div className="modal-overlay roteador-modal-overlay" onMouseDown={onClose}>
      <section
        className="roteador-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="roteador-modal-titulo"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="roteador-modal-header">
          <div className="roteador-modal-title">
            <span className="roteador-modal-icon"><FiWifi /></span>
            <div>
              <span>Cliente #{cliente.id}</span>
              <h2 id="roteador-modal-titulo">Roteador principal</h2>
              <p>{cliente.nome}</p>
            </div>
          </div>
          <button type="button" className="roteador-close" onClick={onClose} aria-label="Fechar">
            <FiX />
          </button>
        </header>

        {!historicoAberto ? (
          <>
            <div className="roteador-current-card">
              <div><span>Modelo atual</span><strong>{cliente.modeloRoteadorPrincipal || "Não informado"}</strong></div>
              <div><span>Propriedade</span><strong>{formatarPropriedade(cliente.propriedadeRoteadorPrincipal)}</strong></div>
              <div><span>Última atualização</span><strong>{formatarDataHora(cliente.dataAtualizacaoRoteador)}</strong></div>
              <div><span>Responsável</span><strong>{cliente.usuarioAtualizacaoRoteadorNome || "Não informado"}</strong></div>
            </div>

            {modoEdicao && (
              <form className="roteador-form" onSubmit={salvar}>
                <div className="roteador-field roteador-autocomplete">
                  <label htmlFor="roteador-modelo">Modelo</label>
                  <input
                    id="roteador-modelo"
                    value={modelo}
                    maxLength={150}
                    autoComplete="off"
                    onChange={(event) => setModelo(event.target.value)}
                    placeholder="Ex.: TP-Link Archer C6"
                    autoFocus
                  />
                  {(carregandoSugestoes || erroSugestoes || sugestoes.length > 0) && (
                    <div className="roteador-suggestions">
                      {carregandoSugestoes && <span>Buscando sugestões...</span>}
                      {!carregandoSugestoes && erroSugestoes && <span className="roteador-suggestion-error">{erroSugestoes}</span>}
                      {!carregandoSugestoes && sugestoes.map((sugestao) => (
                        <button
                          type="button"
                          key={sugestao.modelo}
                          onClick={() => {
                            setModelo(sugestao.modelo);
                            setSugestoes([]);
                          }}
                        >
                          <strong>{sugestao.modelo}</strong>
                          <small>{sugestao.frequencia} uso(s)</small>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="roteador-field">
                  <label htmlFor="roteador-propriedade">Propriedade</label>
                  <select id="roteador-propriedade" value={propriedade} onChange={(event) => setPropriedade(event.target.value)}>
                    <option value="">Selecione</option>
                    <option value="PROPRIO">Próprio</option>
                    <option value="COMODATO">Comodato</option>
                  </select>
                </div>
                <div className="roteador-edit-note">O modelo pode ser digitado livremente. Esta alteração não movimenta o estoque.</div>
                <div className="roteador-form-actions">
                  <button type="button" className="roteador-secondary" onClick={cancelarEdicao} disabled={salvando}>Cancelar</button>
                  <button type="submit" className="roteador-primary" disabled={salvando}>{salvando ? "Salvando..." : "Salvar alterações"}</button>
                </div>
              </form>
            )}

            {!modoEdicao && podeAdministrar && (
              <div className="roteador-modal-actions">
                <button type="button" className="roteador-secondary" onClick={abrirHistorico}><FiClock /> Histórico do roteador</button>
                <button type="button" className="roteador-primary" onClick={() => setModoEdicao(true)}><FiEdit2 /> Editar roteador</button>
              </div>
            )}
          </>
        ) : (
          <div className="roteador-history">
            <div className="roteador-history-heading">
              <div><h3>Histórico do roteador</h3><p>Alterações mais recentes aparecem primeiro.</p></div>
              <button type="button" className="roteador-secondary" onClick={() => setHistoricoAberto(false)}>Voltar</button>
            </div>
            {carregandoHistorico && <div className="roteador-feedback">Carregando histórico...</div>}
            {!carregandoHistorico && erroHistorico && <div className="roteador-feedback roteador-error">{erroHistorico}</div>}
            {!carregandoHistorico && !erroHistorico && historico.length === 0 && <div className="roteador-feedback">Nenhuma alteração registrada.</div>}
            {!carregandoHistorico && !erroHistorico && historico.map((item) => (
              <article className="roteador-history-item" key={item.id}>
                <div className="roteador-history-meta">
                  <strong>{formatarDataHora(item.dataAlteracao)}</strong>
                  <span>{item.usuarioNome || "Responsável não informado"}</span>
                  {item.ordemServicoId && <span className="roteador-os-origin">Origem: OS #{item.ordemServicoId}</span>}
                </div>
                <div className="roteador-history-change">
                  <div><span>Anterior</span><strong>{item.modeloAnterior || "Não informado"}</strong><small>{formatarPropriedade(item.propriedadeAnterior)}</small></div>
                  <span className="roteador-history-arrow">→</span>
                  <div><span>Novo</span><strong>{item.modeloNovo || "Não informado"}</strong><small>{formatarPropriedade(item.propriedadeNova)}</small></div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RoteadorPrincipalModal;

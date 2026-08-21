import React, { useEffect, useRef, useState } from "react";
import {
  convidarUsuario,
  listarUsuarios,
  bloquearUsuario,
  desbloquearUsuario,
  reenviarConviteUsuario,
} from "../../services/usuarioService";
import {
  FiMail,
  FiShield,
  FiUserPlus,
  FiLock,
  FiSearch,
  FiUnlock,
  FiChevronUp,
  FiChevronDown,
  FiRefreshCw,
} from "react-icons/fi";
import "./Acessos.css";

const Acessos = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const [conviteGerado, setConviteGerado] = useState(null);
  const [busca, setBusca] = useState("");
  const [temposReenvio, setTemposReenvio] = useState({});
  const [camposInvalidos, setCamposInvalidos] = useState({});
  const [ordenacao, setOrdenacao] = useState({
    coluna: "id",
    direcao: "asc",
  });
  const nomeInputRef = useRef(null);
  const loginInputRef = useRef(null);
  const perfilSelectRef = useRef(null);

  const [form, setForm] = useState({
    nome: "",
    login: "",
    perfil: "USUARIO",
  });

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

  const carregarUsuarios = async () => {
    try {
      setCarregando(true);

      const response = await listarUsuarios();
      setUsuarios(response.data);

      const temposIniciais = {};

      response.data.forEach((usuario) => {
        if (
          usuario.status === "CONVIDADO" &&
          !usuario.podeReenviarConvite &&
          usuario.segundosParaReenviarConvite > 0
        ) {
          temposIniciais[usuario.id] = usuario.segundosParaReenviarConvite;
        }
      });

      setTemposReenvio(temposIniciais);
    } catch (error) {
      mostrarMensagem("Erro ao carregar usuários.", "erro");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      const usuariosLiberados = [];

      setTemposReenvio((temposAtuais) => {
        const novosTempos = {};

        Object.entries(temposAtuais).forEach(([usuarioId, segundos]) => {
          const novoTempo = Math.max(0, segundos - 1);

          if (segundos > 0 && novoTempo === 0) {
            usuariosLiberados.push(Number(usuarioId));
            return;
          }

          novosTempos[usuarioId] = novoTempo;
        });

        return novosTempos;
      });

      if (usuariosLiberados.length > 0) {
        setUsuarios((usuariosAtuais) =>
          usuariosAtuais.map((usuario) =>
            usuariosLiberados.includes(usuario.id)
              ? {
                  ...usuario,
                  podeReenviarConvite: true,
                  segundosParaReenviarConvite: 0,
                }
              : usuario,
          ),
        );

        carregarUsuarios();
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((formAtual) => ({
      ...formAtual,
      [name]: value,
    }));

    if (camposInvalidos[name]) {
      setCamposInvalidos((camposAtuais) => ({
        ...camposAtuais,
        [name]: false,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setConviteGerado(null);
    const camposComErro = {};

    if (!form.nome.trim()) {
      camposComErro.nome = true;
      mostrarMensagem("Nome é obrigatório.", "erro");
    }

    if (!form.login.trim()) {
      camposComErro.login = true;
      mostrarMensagem("Login é obrigatório.", "erro");
    }

    if (!form.perfil) {
      camposComErro.perfil = true;
      mostrarMensagem("Perfil é obrigatório.", "erro");
    }

    setCamposInvalidos(camposComErro);

    if (Object.keys(camposComErro).length > 0) {
      if (camposComErro.nome) {
        nomeInputRef.current?.focus();
      } else if (camposComErro.login) {
        loginInputRef.current?.focus();
      } else if (camposComErro.perfil) {
        perfilSelectRef.current?.focus();
      }

      return;
    }

    if (!form.nome.trim()) {
      mostrarMensagem("Nome é obrigatório.", "erro");
      return;
    }

    if (!form.login.trim()) {
      mostrarMensagem("Login é obrigatório.", "erro");
      return;
    }

    try {
      setCarregando(true);

      const response = await convidarUsuario({
        nome: form.nome,
        login: form.login,
        perfil: form.perfil,
      });

      setConviteGerado(response.data);
      mostrarMensagem("Convite gerado com sucesso.", "sucesso");

      setForm({
        nome: "",
        login: "",
        perfil: "USUARIO",
      });
      setCamposInvalidos({});

      carregarUsuarios();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao gerar convite.";

      mostrarMensagem(mensagemErro, "erro");
    } finally {
      setCarregando(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const termo = busca.toLowerCase();

    return (
      usuario.nome?.toLowerCase().includes(termo) ||
      usuario.login?.toLowerCase().includes(termo)
    );
  });

  const handleOrdenar = (coluna) => {
    setOrdenacao((ordenacaoAtual) => {
      if (ordenacaoAtual.coluna === coluna) {
        return {
          coluna,
          direcao: ordenacaoAtual.direcao === "asc" ? "desc" : "asc",
        };
      }

      return {
        coluna,
        direcao: "asc",
      };
    });
  };

  const usuariosOrdenados = [...usuariosFiltrados].sort((a, b) => {
    let valorA = a[ordenacao.coluna] ?? "";
    let valorB = b[ordenacao.coluna] ?? "";

    if (ordenacao.coluna === "id") {
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

  const renderIconeOrdenacao = (coluna) => {
    if (ordenacao.coluna !== coluna) {
      return null;
    }

    return ordenacao.direcao === "asc" ? <FiChevronUp /> : <FiChevronDown />;
  };

  const getStatusExibido = (usuario) => {
    if (usuario.status === "CONVIDADO" && usuario.conviteExpirado) {
      return "EXPIRADO";
    }

    if (usuario.status === "CONVIDADO") {
      return "PENDENTE";
    }

    return usuario.status;
  };

  const formatarTempoReenvio = (segundos) => {
    const tempo = Math.max(0, Number(segundos) || 0);
    const minutos = Math.floor(tempo / 60);
    const segundosRestantes = tempo % 60;

    return `${String(minutos).padStart(2, "0")}:${String(segundosRestantes).padStart(2, "0")}`;
  };

  const handleBloquearUsuario = async (id) => {
    try {
      setCarregando(true);

      await bloquearUsuario(id);
      mostrarMensagem("Usuário bloqueado com sucesso.", "sucesso");
      carregarUsuarios();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao bloquear usuário.";

      mostrarMensagem(mensagemErro, "erro");
    } finally {
      setCarregando(false);
    }
  };

  const handleDesbloquearUsuario = async (id) => {
    try {
      setCarregando(true);

      await desbloquearUsuario(id);
      mostrarMensagem("Usuário desbloqueado com sucesso.", "sucesso");
      carregarUsuarios();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao desbloquear usuário.";

      mostrarMensagem(mensagemErro, "erro");
    } finally {
      setCarregando(false);
    }
  };

  const handleReenviarConvite = async (id) => {
    try {
      setCarregando(true);

      const response = await reenviarConviteUsuario(id);

      setConviteGerado(response.data);
      mostrarMensagem("Convite reenviado com sucesso.", "sucesso");

      setUsuarios((usuariosAtuais) =>
        usuariosAtuais.map((usuario) =>
          usuario.id === id
            ? {
                ...usuario,
                podeReenviarConvite: false,
                segundosParaReenviarConvite: 300,
              }
            : usuario,
        ),
      );

      setTemposReenvio((temposAtuais) => ({
        ...temposAtuais,
        [id]: 300,
      }));

      await carregarUsuarios();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao reenviar convite.";

      mostrarMensagem(mensagemErro, "erro");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="acessos-page">
      <div className="acessos-header">
        <div className="acessos-header-icon">
          <FiShield />
        </div>

        <div>
          <h1>Acessos</h1>
          <p>Gerencie os acessos ao sistema e convide novos usuários.</p>
        </div>
      </div>

      <div className="acessos-card acessos-invite-card">
        <div className="acessos-card-title">
          <FiUserPlus />
          <div>
            <h2>Convidar novo usuário</h2>
            <p>
              Preencha os dados do usuário para enviar um convite de acesso ao
              sistema.
            </p>
          </div>
        </div>

        <form
          className="acessos-form acessos-invite-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label>Nome</label>
            <input
              ref={nomeInputRef}
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Digite o nome completo"
              className={camposInvalidos.nome ? "input-error" : ""}
            />
          </div>

          <div className="form-group">
            <label>Login</label>
            <input
              ref={loginInputRef}
              type="text"
              name="login"
              value={form.login}
              onChange={handleChange}
              placeholder="Digite o login ou e-mail"
              className={camposInvalidos.login ? "input-error" : ""}
            />
          </div>

          <div className="form-group">
            <label>Perfil</label>
            <select
              ref={perfilSelectRef}
              name="perfil"
              value={form.perfil}
              onChange={handleChange}
              className={camposInvalidos.perfil ? "input-error" : ""}
            >
              <option value="USUARIO">Usuário</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <button type="submit" disabled={carregando}>
            <FiMail />
            {carregando ? "Gerando..." : "Convidar usuário"}
          </button>
        </form>
        {conviteGerado && (
          <div className="convite-gerado">
            <strong>Convite enviado para {conviteGerado.nome}</strong>
            <span>
              O link de ativação foi enviado para {conviteGerado.login}.
            </span>
          </div>
        )}
      </div>
      <div className="acessos-card acessos-list-card">
        <div className="acessos-list-header">
          <div className="acessos-card-title">
            <FiShield />
            <div>
              <h2>Usuários convidados</h2>
              <p>
                Lista de todos os usuários convidados e seus respectivos
                acessos.
              </p>
            </div>
          </div>

          <div className="acessos-search">
            <input
              type="text"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por nome ou login..."
            />
            <FiSearch />
          </div>
        </div>
        <div className="acessos-table-wrapper">
          <table className="acessos-table">
            <thead>
              <tr>
                <th onClick={() => handleOrdenar("id")}>
                  <span className="sortable-header">
                    #{renderIconeOrdenacao("id")}
                  </span>
                </th>
                <th onClick={() => handleOrdenar("nome")}>
                  <span className="sortable-header">
                    Nome
                    {renderIconeOrdenacao("nome")}
                  </span>
                </th>
                <th onClick={() => handleOrdenar("login")}>
                  <span className="sortable-header">
                    Login
                    {renderIconeOrdenacao("login")}
                  </span>
                </th>
                <th onClick={() => handleOrdenar("perfil")}>
                  <span className="sortable-header">
                    Perfil
                    {renderIconeOrdenacao("perfil")}
                  </span>
                </th>
                <th onClick={() => handleOrdenar("status")}>
                  <span className="sortable-header">
                    Status
                    {renderIconeOrdenacao("status")}
                  </span>
                </th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {usuariosOrdenados.map((usuario, index) => (
                <tr key={usuario.id}>
                  <td>{index + 1}</td>
                  <td>{usuario.nome}</td>
                  <td>{usuario.login}</td>
                  <td>
                    <span className={`perfil-badge perfil-${usuario.perfil}`}>
                      {usuario.perfil}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${
                        usuario.status === "CONVIDADO" &&
                        usuario.conviteExpirado
                          ? "EXPIRADO"
                          : usuario.status
                      }`}
                    >
                      {getStatusExibido(usuario)}
                    </span>
                  </td>
                  <td>
                    <div className="acessos-actions">
                      {usuario.status === "BLOQUEADO" && (
                        <button
                          type="button"
                          className="acessos-action-button desbloquear"
                          onClick={() => handleDesbloquearUsuario(usuario.id)}
                          disabled={carregando}
                        >
                          <FiUnlock />
                          Desbloquear
                        </button>
                      )}

                      {usuario.status === "ATIVO" && (
                        <button
                          type="button"
                          className="acessos-action-button bloquear"
                          onClick={() => handleBloquearUsuario(usuario.id)}
                          disabled={carregando}
                        >
                          <FiLock />
                          Bloquear
                        </button>
                      )}

                      {usuario.status === "CONVIDADO" &&
                        usuario.podeReenviarConvite && (
                          <button
                            type="button"
                            className="acessos-action-button reenviar"
                            onClick={() => handleReenviarConvite(usuario.id)}
                            disabled={carregando}
                          >
                            <FiRefreshCw />
                            Reenviar convite
                          </button>
                        )}

                      {usuario.status === "CONVIDADO" &&
                        !usuario.podeReenviarConvite && (
                          <span className="acessos-action-waiting">
                            {(temposReenvio[usuario.id] ??
                              usuario.segundosParaReenviarConvite) <= 0 ? (
                              "Liberando reenvio..."
                            ) : (
                              <>
                                Reenviar convite -{" "}
                                {formatarTempoReenvio(
                                  temposReenvio[usuario.id] ??
                                    usuario.segundosParaReenviarConvite,
                                )}{" "}
                                min
                              </>
                            )}
                          </span>
                        )}
                    </div>
                  </td>
                </tr>
              ))}

              {usuariosOrdenados.length === 0 && (
                <tr>
                  <td colSpan="6" className="acessos-empty">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
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

export default Acessos;

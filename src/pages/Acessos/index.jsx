import React, { useEffect, useRef, useState } from "react";
import {
  convidarUsuario,
  listarUsuarios,
  bloquearUsuario,
  desbloquearUsuario,
  reenviarConviteUsuario,
  buscarUsuarioPorId,
  atualizarUsuario,
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
  FiEdit2,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import { listarColaboradores } from "../../services/colaboradorService";
import "./Acessos.css";

const Acessos = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
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
  const colaboradorIdInputRef = useRef(null);
  const nomeEdicaoInputRef = useRef(null);
  const loginEdicaoInputRef = useRef(null);
  const colaboradorEdicaoInputRef = useRef(null);
  const [seletorColaboradorAberto, setSeletorColaboradorAberto] =
    useState(false);
  const [buscaColaborador, setBuscaColaborador] = useState("");
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState(null);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [formEdicao, setFormEdicao] = useState({
    nome: "",
    login: "",
    perfil: "USUARIO",
    colaboradorId: "",
    colaboradorNome: "",
  });
  const [camposEdicaoInvalidos, setCamposEdicaoInvalidos] = useState({});
  const [modoSeletorColaborador, setModoSeletorColaborador] =
    useState("convite");
  const [paginaColaborador, setPaginaColaborador] = useState(1);
  const [ordenacaoColaborador, setOrdenacaoColaborador] = useState({
    coluna: "id",
    direcao: "asc",
  });

  const colaboradoresPorPagina = 8;

  const [form, setForm] = useState({
    nome: "",
    login: "",
    perfil: "USUARIO",
    colaboradorId: "",
    colaboradorNome: "",
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

    const carregarColaboradores = async () => {
      try {
        const response = await listarColaboradores();
        setColaboradores(response.data);
      } catch (error) {
        mostrarMensagem(
          error.response?.data?.message ||
            "Não foi possível carregar os colaboradores.",
          "erro",
        );
      }
    };

    carregarColaboradores();
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

  const colaboradoresDisponiveis = colaboradores.filter(
    (colaborador) =>
      !usuarios.some(
        (usuario) =>
          usuario.colaboradorId != null &&
          Number(usuario.colaboradorId) === Number(colaborador.id),
      ),
  );

  const colaboradoresDisponiveisNoSeletor = colaboradores.filter(
    (colaborador) =>
      !usuarios.some(
        (usuario) =>
          usuario.colaboradorId != null &&
          Number(usuario.colaboradorId) === Number(colaborador.id) &&
          !(
            modoSeletorColaborador === "edicao" &&
            usuario.id === usuarioEditando?.id
          ),
      ),
  );

  const colaboradoresFiltrados = colaboradoresDisponiveisNoSeletor.filter(
    (colaborador) => {
      const termo = buscaColaborador.trim().toLocaleLowerCase("pt-BR");

      return (
        String(colaborador.id).includes(termo) ||
        String(colaborador.nome ?? "")
          .toLocaleLowerCase("pt-BR")
          .includes(termo)
      );
    },
  );

  const colaboradoresOrdenados = [...colaboradoresFiltrados].sort((a, b) => {
    const valorA = a[ordenacaoColaborador.coluna] ?? "";
    const valorB = b[ordenacaoColaborador.coluna] ?? "";

    const resultado =
      ordenacaoColaborador.coluna === "id"
        ? Number(valorA) - Number(valorB)
        : String(valorA).localeCompare(String(valorB), "pt-BR");

    return ordenacaoColaborador.direcao === "asc" ? resultado : -resultado;
  });

  const totalPaginasColaborador = Math.max(
    1,
    Math.ceil(colaboradoresOrdenados.length / colaboradoresPorPagina),
  );

  const paginaColaboradorLimitada = Math.min(
    paginaColaborador,
    totalPaginasColaborador,
  );

  const inicioColaborador =
    (paginaColaboradorLimitada - 1) * colaboradoresPorPagina;

  const colaboradoresPaginados = colaboradoresOrdenados.slice(
    inicioColaborador,
    inicioColaborador + colaboradoresPorPagina,
  );

  const ordenarColaboradores = (coluna) => {
    setOrdenacaoColaborador((ordenacaoAtual) => {
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

    setPaginaColaborador(1);
  };

  const indicadorOrdenacaoColaborador = (coluna) => {
    if (ordenacaoColaborador.coluna !== coluna) {
      return null;
    }

    return ordenacaoColaborador.direcao === "asc" ? (
      <FiChevronUp />
    ) : (
      <FiChevronDown />
    );
  };

  const abrirSeletorColaborador = (modo = "convite") => {
    setModoSeletorColaborador(modo);
    setBuscaColaborador("");
    setPaginaColaborador(1);

    const colaboradorIdAtual =
      modo === "edicao" ? formEdicao.colaboradorId : form.colaboradorId;

    const colaboradorAtual = colaboradores.find(
      (colaborador) => String(colaborador.id) === String(colaboradorIdAtual),
    );

    setColaboradorSelecionado(colaboradorAtual ?? null);
    setSeletorColaboradorAberto(true);
  };

  const confirmarColaborador = (colaborador) => {
    if (!colaborador) {
      mostrarMensagem("Selecione um colaborador.", "erro");
      return;
    }

    const usuarioAtual =
      modoSeletorColaborador === "edicao" ? usuarioEditando : null;

    const colaboradorVinculadoAOutroUsuario = usuarios.some(
      (usuario) =>
        usuario.id !== usuarioAtual?.id &&
        usuario.colaboradorId &&
        Number(usuario.colaboradorId) === Number(colaborador.id),
    );

    if (colaboradorVinculadoAOutroUsuario) {
      mostrarMensagem(
        "Este colaborador já está vinculado a outro usuário.",
        "erro",
      );
      return;
    }

    const dadosColaborador = {
      colaboradorId: String(colaborador.id),
      colaboradorNome: colaborador.nome,
    };

    if (modoSeletorColaborador === "edicao") {
      setFormEdicao((atual) => ({
        ...atual,
        ...dadosColaborador,
      }));
    } else {
      setForm((atual) => ({
        ...atual,
        ...dadosColaborador,
      }));
    }

    setColaboradorSelecionado(colaborador);
    setSeletorColaboradorAberto(false);
  };

  const handleColaboradorIdChange = (event) => {
    const valor = event.target.value.replace(/\D/g, "");

    const colaborador = valor
      ? colaboradoresDisponiveis.find(
          (item) => Number(item.id) === Number(valor),
        )
      : null;

    setForm((atual) => ({
      ...atual,
      colaboradorId: valor,
      colaboradorNome: colaborador?.nome ?? "",
    }));

    setCamposInvalidos((atual) => ({
      ...atual,
      colaboradorId: valor !== "" && !colaborador,
    }));
  };

  const abrirEdicaoUsuario = async (usuario) => {
    try {
      setCarregando(true);

      const response = await buscarUsuarioPorId(usuario.id);
      const usuarioAtual = response.data;

      setUsuarioEditando(usuarioAtual);
      setFormEdicao({
        nome: usuarioAtual.nome ?? "",
        login: usuarioAtual.login ?? "",
        perfil: usuarioAtual.perfil ?? "USUARIO",
        colaboradorId: usuarioAtual.colaboradorId
          ? String(usuarioAtual.colaboradorId)
          : "",
        colaboradorNome: usuarioAtual.colaboradorNome ?? "",
      });
      setCamposEdicaoInvalidos({});
    } catch (error) {
      mostrarMensagem(
        error.response?.data?.message || "Não foi possível carregar o usuário.",
        "erro",
      );
    } finally {
      setCarregando(false);
    }
  };

  const handleChangeEdicao = (event) => {
    const { name, value } = event.target;

    setFormEdicao((formAtual) => ({
      ...formAtual,
      [name]: value,
    }));

    if (camposEdicaoInvalidos[name]) {
      setCamposEdicaoInvalidos((camposAtuais) => ({
        ...camposAtuais,
        [name]: false,
      }));
    }
  };

  const handleColaboradorEdicaoIdChange = (event) => {
    const valor = event.target.value.replace(/\D/g, "");

    const colaborador = valor
      ? colaboradores.find(
          (item) =>
            Number(item.id) === Number(valor) &&
            !usuarios.some(
              (usuario) =>
                usuario.id !== usuarioEditando?.id &&
                Number(usuario.colaboradorId) === Number(item.id),
            ),
        )
      : null;

    setFormEdicao((formAtual) => ({
      ...formAtual,
      colaboradorId: valor,
      colaboradorNome: colaborador?.nome ?? "",
    }));

    setCamposEdicaoInvalidos((camposAtuais) => ({
      ...camposAtuais,
      colaboradorId: valor !== "" && !colaborador,
    }));
  };

  const handleSalvarEdicao = async (event) => {
    event.preventDefault();

    if (!usuarioEditando) {
      return;
    }

    const camposComErro = {};

    if (!formEdicao.nome.trim()) {
      camposComErro.nome = true;
      mostrarMensagem("Nome é obrigatório.", "erro");
    }

    if (!formEdicao.login.trim()) {
      camposComErro.login = true;
      mostrarMensagem("Login é obrigatório.", "erro");
    }

    if (formEdicao.login.trim() && !emailValido(formEdicao.login)) {
      camposComErro.login = true;
      mostrarMensagem("Informe um e-mail válido.", "erro");
    }

    if (formEdicao.perfil === "TECNICO" && !formEdicao.colaboradorId) {
      camposComErro.colaboradorId = true;
      mostrarMensagem(
        "Selecione um colaborador para usuários com perfil Técnico.",
        "erro",
      );
    }

    const colaboradorExiste = formEdicao.colaboradorId
      ? colaboradores.some(
          (colaborador) =>
            Number(colaborador.id) === Number(formEdicao.colaboradorId),
        )
      : true;

    if (!colaboradorExiste) {
      camposComErro.colaboradorId = true;
      mostrarMensagem("Selecione um colaborador válido.", "erro");
    }

    const colaboradorVinculadoAOutroUsuario = usuarios.some(
      (usuario) =>
        usuario.id !== usuarioEditando.id &&
        usuario.colaboradorId &&
        Number(usuario.colaboradorId) === Number(formEdicao.colaboradorId),
    );

    if (formEdicao.colaboradorId && colaboradorVinculadoAOutroUsuario) {
      camposComErro.colaboradorId = true;
      mostrarMensagem(
        "Este colaborador já está vinculado a outro usuário.",
        "erro",
      );
    }

    setCamposEdicaoInvalidos(camposComErro);

    if (Object.keys(camposComErro).length > 0) {
      if (camposComErro.nome) {
        nomeEdicaoInputRef.current?.focus();
      } else if (camposComErro.login) {
        loginEdicaoInputRef.current?.focus();
      } else if (camposComErro.colaboradorId) {
        colaboradorEdicaoInputRef.current?.focus();
      }

      return;
    }

    try {
      setCarregando(true);

      await atualizarUsuario(usuarioEditando.id, {
        nome: formEdicao.nome.trim(),
        login: formEdicao.login.trim(),
        perfil: formEdicao.perfil,
        colaboradorId: formEdicao.colaboradorId
          ? Number(formEdicao.colaboradorId)
          : null,
      });

      setUsuarioEditando(null);
      mostrarMensagem("Usuário atualizado com sucesso.", "sucesso");
      await carregarUsuarios();
    } catch (error) {
      mostrarMensagem(
        error.response?.data?.message ||
          "Não foi possível atualizar o usuário.",
        "erro",
      );
    } finally {
      setCarregando(false);
    }
  };

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

  const emailValido = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

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

    if (form.login.trim() && !emailValido(form.login)) {
      camposComErro.login = true;
      mostrarMensagem("Informe um e-mail válido.", "erro");
    }

    if (!form.perfil) {
      camposComErro.perfil = true;
      mostrarMensagem("Perfil é obrigatório.", "erro");
    }

    if (form.perfil === "TECNICO" && !form.colaboradorId) {
      camposComErro.colaboradorId = true;
      mostrarMensagem(
        "Selecione um colaborador para usuários com perfil Técnico.",
        "erro",
      );
    } else if (
      form.colaboradorId &&
      !colaboradoresDisponiveis.some(
        (colaborador) => Number(colaborador.id) === Number(form.colaboradorId),
      )
    ) {
      camposComErro.colaboradorId = true;
      mostrarMensagem("Selecione um colaborador disponível.", "erro");
    }

    setCamposInvalidos(camposComErro);

    if (Object.keys(camposComErro).length > 0) {
      if (camposComErro.nome) {
        nomeInputRef.current?.focus();
      } else if (camposComErro.login) {
        loginInputRef.current?.focus();
      } else if (camposComErro.perfil) {
        perfilSelectRef.current?.focus();
      } else if (camposComErro.colaboradorId) {
        colaboradorIdInputRef.current?.focus();
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
        colaboradorId: form.colaboradorId ? Number(form.colaboradorId) : null,
      });

      setConviteGerado(response.data);
      mostrarMensagem("Convite gerado com sucesso.", "sucesso");

      setForm({
        nome: "",
        login: "",
        perfil: "USUARIO",
        colaboradorId: "",
        colaboradorNome: "",
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

      <div className="toast-container" role="status" aria-live="polite">
        {mensagens.map((mensagem) => (
          <div
            key={mensagem.id}
            className={`form-message form-message-${mensagem.tipo}`}
          >
            {mensagem.texto}
          </div>
        ))}
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
              <option value="TECNICO">Técnico</option>
            </select>
          </div>
          <div className="form-group acessos-colaborador-group">
            <label htmlFor="convite-colaborador-id">
              Colaborador vinculado
              {form.perfil === "TECNICO" ? " (obrigatório)" : " (opcional)"}
            </label>

            <div className="acessos-colaborador-lookup">
              <input
                ref={colaboradorIdInputRef}
                id="convite-colaborador-id"
                type="text"
                inputMode="numeric"
                value={form.colaboradorId}
                onChange={handleColaboradorIdChange}
                className={camposInvalidos.colaboradorId ? "input-error" : ""}
                aria-invalid={Boolean(camposInvalidos.colaboradorId)}
                aria-required={form.perfil === "TECNICO"}
                disabled={carregando}
              />

              <input
                type="text"
                value={form.colaboradorNome}
                readOnly
                aria-label="Nome do colaborador; abrir seleção"
                onClick={abrirSeletorColaborador}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    abrirSeletorColaborador();
                  }
                }}
                disabled={carregando}
              />

              <button
                type="button"
                onClick={abrirSeletorColaborador}
                aria-label="Selecionar colaborador"
                disabled={carregando}
              >
                <FiSearch />
              </button>
            </div>
          </div>
          <div className="acessos-form-actions">
            <button type="submit" disabled={carregando}>
              <FiMail />
              {carregando ? "Gerando..." : "Convidar usuário"}
            </button>

            <button
              type="button"
              className="acessos-editar-selecionado"
              onClick={() => abrirEdicaoUsuario(usuarioSelecionado)}
              disabled={carregando || !usuarioSelecionado}
            >
              <FiEdit2 />
              Editar usuário
            </button>
          </div>
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
        <div
          className="acessos-table-wrapper"
          role="region"
          aria-label="Lista de usuários"
          tabIndex={0}
        >
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
                <tr
                  key={usuario.id}
                  className={
                    usuarioSelecionado?.id === usuario.id ? "selected-row" : ""
                  }
                  onClick={() => setUsuarioSelecionado(usuario)}
                >
                  <td>{index + 1}</td>
                  <td>
                    <div className="acessos-usuario-identidade">
                      <span className="acessos-usuario-nome">
                        {usuario.nome}
                      </span>

                      {usuario.colaboradorNome && (
                        <span className="acessos-usuario-colaborador">
                          Colaborador: {usuario.colaboradorNome}
                        </span>
                      )}
                    </div>
                  </td>{" "}
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
          {seletorColaboradorAberto && (
            <div className="acessos-colaborador-overlay">
              <div
                className="acessos-colaborador-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="seletor-colaborador-titulo"
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setSeletorColaboradorAberto(false);
                  }
                }}
              >
                <div className="acessos-colaborador-header">
                  <h2 id="seletor-colaborador-titulo">
                    Selecionar colaborador
                  </h2>

                  <button
                    type="button"
                    onClick={() => setSeletorColaboradorAberto(false)}
                    aria-label="Fechar seleção"
                  >
                    ×
                  </button>
                </div>

                <div className="acessos-colaborador-toolbar">
                  <input
                    type="text"
                    value={buscaColaborador}
                    onChange={(event) => {
                      setBuscaColaborador(event.target.value);
                      setPaginaColaborador(1);
                    }}
                    placeholder="Buscar por ID ou nome..."
                    aria-label="Buscar colaborador"
                    autoFocus
                  />
                </div>

                <div className="acessos-colaborador-table-wrapper">
                  <table className="acessos-colaborador-table">
                    <thead>
                      <tr>
                        <th>
                          <button
                            type="button"
                            className="acessos-colaborador-sort"
                            onClick={() => ordenarColaboradores("id")}
                          >
                            ID {indicadorOrdenacaoColaborador("id")}
                          </button>
                        </th>
                        <th>
                          <button
                            type="button"
                            className="acessos-colaborador-sort"
                            onClick={() => ordenarColaboradores("nome")}
                          >
                            Nome {indicadorOrdenacaoColaborador("nome")}
                          </button>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {colaboradoresPaginados.map((colaborador) => (
                        <tr
                          key={colaborador.id}
                          className={
                            colaboradorSelecionado?.id === colaborador.id
                              ? "selected-row"
                              : ""
                          }
                          onClick={() => setColaboradorSelecionado(colaborador)}
                          onDoubleClick={() =>
                            confirmarColaborador(colaborador)
                          }
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              confirmarColaborador(colaborador);
                            }
                          }}
                        >
                          <td>{colaborador.id}</td>
                          <td>{colaborador.nome}</td>
                        </tr>
                      ))}

                      {colaboradoresPaginados.length === 0 && (
                        <tr>
                          <td colSpan={2}>
                            Nenhum colaborador disponível encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="acessos-colaborador-footer">
                  <div
                    className="acessos-colaborador-pagination"
                    aria-label="Paginação de colaboradores"
                  >
                    <button
                      type="button"
                      aria-label="Primeira página"
                      title="Primeira página"
                      disabled={paginaColaboradorLimitada === 1}
                      onClick={() => setPaginaColaborador(1)}
                    >
                      <FiChevronsLeft />
                    </button>
                    <button
                      type="button"
                      aria-label="Página anterior"
                      title="Página anterior"
                      disabled={paginaColaboradorLimitada === 1}
                      onClick={() =>
                        setPaginaColaborador((paginaAtual) =>
                          Math.max(1, paginaAtual - 1),
                        )
                      }
                    >
                      <FiChevronLeft />
                    </button>

                    <span>
                      {paginaColaboradorLimitada} / {totalPaginasColaborador}
                    </span>

                    <button
                      type="button"
                      aria-label="Próxima página"
                      title="Próxima página"
                      disabled={
                        paginaColaboradorLimitada === totalPaginasColaborador
                      }
                      onClick={() =>
                        setPaginaColaborador((paginaAtual) =>
                          Math.min(totalPaginasColaborador, paginaAtual + 1),
                        )
                      }
                    >
                      <FiChevronRight />
                    </button>
                    <button
                      type="button"
                      aria-label="Última página"
                      title="Última página"
                      disabled={
                        paginaColaboradorLimitada === totalPaginasColaborador
                      }
                      onClick={() =>
                        setPaginaColaborador(totalPaginasColaborador)
                      }
                    >
                      <FiChevronsRight />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="acessos-colaborador-confirmar"
                    disabled={!colaboradorSelecionado}
                    onClick={() => confirmarColaborador(colaboradorSelecionado)}
                  >
                    Selecionar
                  </button>
                </div>
              </div>
            </div>
          )}
          {usuarioEditando && (
            <div className="acessos-edicao-overlay">
              <div
                className="acessos-edicao-modal"
                role="dialog"
                aria-modal="true"
              >
                <div className="acessos-edicao-header">
                  <h2>Editar usuário</h2>

                  <button
                    type="button"
                    onClick={() => setUsuarioEditando(null)}
                    aria-label="Fechar edição"
                  >
                    ×
                  </button>
                </div>

                <form
                  className="acessos-edicao-form"
                  onSubmit={handleSalvarEdicao}
                >
                  <label>
                    Nome
                    <input
                      ref={nomeEdicaoInputRef}
                      name="nome"
                      value={formEdicao.nome}
                      onChange={handleChangeEdicao}
                      className={
                        camposEdicaoInvalidos.nome ? "input-error" : ""
                      }
                    />
                  </label>

                  <label>
                    Login
                    <input
                      ref={loginEdicaoInputRef}
                      name="login"
                      value={formEdicao.login}
                      onChange={handleChangeEdicao}
                      className={
                        camposEdicaoInvalidos.login ? "input-error" : ""
                      }
                    />
                  </label>

                  <label>
                    Perfil
                    <select
                      name="perfil"
                      value={formEdicao.perfil}
                      onChange={handleChangeEdicao}
                    >
                      <option value="USUARIO">Usuário</option>
                      <option value="ADMIN">Administrador</option>
                      <option value="TECNICO">Técnico</option>
                    </select>
                  </label>

                  <div className="acessos-edicao-colaborador">
                    <label htmlFor="edicao-colaborador-id">
                      Colaborador vinculado
                      {formEdicao.perfil === "TECNICO"
                        ? " (obrigatório)"
                        : " (opcional)"}
                    </label>

                    <div className="acessos-colaborador-lookup">
                      <input
                        ref={colaboradorEdicaoInputRef}
                        id="edicao-colaborador-id"
                        value={formEdicao.colaboradorId}
                        inputMode="numeric"
                        onChange={handleColaboradorEdicaoIdChange}
                        className={
                          camposEdicaoInvalidos.colaboradorId
                            ? "input-error"
                            : ""
                        }
                      />

                      <input
                        value={formEdicao.colaboradorNome}
                        readOnly
                        onClick={() => abrirSeletorColaborador("edicao")}
                        aria-label="Nome do colaborador"
                      />

                      <button
                        type="button"
                        onClick={() => abrirSeletorColaborador("edicao")}
                        aria-label="Selecionar colaborador"
                      >
                        <FiSearch />
                      </button>
                    </div>
                  </div>

                  <div className="acessos-edicao-actions">
                    <button
                      type="button"
                      onClick={() => setUsuarioEditando(null)}
                    >
                      Cancelar
                    </button>

                    <button type="submit" disabled={carregando}>
                      {carregando ? "Salvando..." : "Salvar alterações"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Acessos;

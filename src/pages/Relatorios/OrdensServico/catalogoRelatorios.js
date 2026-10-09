export const gruposRelatorios = [
  {
    id: "atendimentos-equipe",
    nome: "Atendimentos e equipe",
    relatorios: [
      {
        id: "atendimentos-colaborador",
        nome: "Atendimentos por Colaborador",
        descricao:
          "Liste as OS realizadas no período, como responsável, ajudante ou ambos.",
        rota: "/relatorios/tecnicos/atendimentos-colaborador",
      },
      {
        id: "resumo-responsavel",
        nome: "Resumo por Técnico Responsável",
        descricao:
          "Consulte a quantidade de atendimentos concluídos por responsável.",
        rota: "/relatorios/tecnicos/resumo-responsavel",
      },
      {
        id: "atendimentos-tipo",
        nome: "Atendimentos por Tipo de Serviço",
        descricao:
          "Consulte os atendimentos realizados por tipo de ordem de serviço.",
        rota: "/relatorios/tecnicos/atendimentos-tipo",
      },
      {
        id: "tempo-atendimento",
        nome: "Tempo de Atendimento",
        descricao:
          "Consulte início, conclusão e duração dos atendimentos realizados.",
        rota: "/relatorios/tecnicos/tempo-atendimento",
      },
    ],
  },
  {
    id: "acompanhamento",
    nome: "Acompanhamento das OS",
    relatorios: [
      {
        id: "pendentes-agendadas",
        nome: "OS Pendentes e Agendadas",
        descricao:
          "Consulte os serviços que ainda precisam ser atendidos ou concluídos.",
        rota: "/relatorios/tecnicos/pendentes-agendadas",
      },
      {
        id: "aguardando-conferencia",
        nome: "Atendimentos Aguardando Conferência",
        descricao:
          "Identifique os atendimentos concluídos que aguardam validação administrativa.",
        rota: "/relatorios/tecnicos/aguardando-conferencia",
      },
      {
        id: "canceladas",
        nome: "OS Canceladas",
        descricao:
          "Consulte as ordens canceladas e suas informações de fechamento.",
        rota: "/relatorios/tecnicos/canceladas",
      },
      {
        id: "status-atual",
        nome: "Distribuição Atual por Status",
        descricao:
          "Consulte a quantidade atual de OS em cada status, sem recorte histórico.",
        rota: "/relatorios/tecnicos/status-atual",
      },
    ],
  },
  {
    id: "clientes-materiais",
    nome: "Clientes e materiais",
    relatorios: [
      {
        id: "historico-cliente",
        nome: "Histórico de Atendimentos por Cliente",
        descricao:
          "Consulte os serviços realizados para um cliente e os técnicos envolvidos.",
        rota: "/relatorios/tecnicos/historico-cliente",
      },
      {
        id: "materiais-utilizados",
        nome: "Materiais Utilizados nos Atendimentos",
        descricao:
          "Consulte os produtos e as quantidades utilizadas nas ordens de serviço.",
        rota: "/relatorios/tecnicos/materiais-utilizados",
      },
    ],
  },
];

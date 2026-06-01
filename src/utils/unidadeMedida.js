export const formatarUnidadeMedida = (unidade) => {
  const unidades = {
    UNIDADES: "Unidades",
    METRO: "Metro",
  };

  return unidades[unidade] || unidade || "";
};

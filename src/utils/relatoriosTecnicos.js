export function formatarTempoAtendimento(segundos) {
  if (
    typeof segundos !== "number" ||
    !Number.isFinite(segundos) ||
    segundos < 0
  ) {
    return "—";
  }

  if (segundos === 0) {
    return "0min";
  }

  if (segundos < 60) {
    return "menos de 1min";
  }

  const minutosTotais = Math.floor(segundos / 60);
  const horas = Math.floor(minutosTotais / 60);
  const minutos = minutosTotais % 60;

  if (horas === 0) {
    return `${minutos}min`;
  }

  return minutos === 0 ? `${horas}h` : `${horas}h ${minutos}min`;
}
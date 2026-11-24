const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const camposPermitidos = (parametro, permitidos) =>
  String(parametro || "")
    .split(",")
    .map((campo) => campo.trim())
    .filter((campo) => permitidos.includes(campo));

const ordenPermitido = (parametro, permitidos, porDefecto) => {
  const campo = String(parametro || "").replace(/^-/, "");
  return permitidos.includes(campo) ? parametro : porDefecto;
};

module.exports = { escaparRegex, camposPermitidos, ordenPermitido };

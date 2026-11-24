const mongoose = require("mongoose");

const esObjectId = (valor) =>
  typeof valor === "string" &&
  valor.length === 24 &&
  mongoose.isValidObjectId(valor);

const aEnteroPositivo = (valor) => {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
};

module.exports = { esObjectId, aEnteroPositivo };

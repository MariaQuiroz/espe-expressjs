const Medicamento = require("../models/medicamento");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");
const { esObjectId } = require("../utils/ids");

const etiqueta = (presentacion) =>
  `${presentacion.forma} ${presentacion.concentracion}`;

const cargarMedicamento = async (medicamentoId) => {
  if (!esObjectId(medicamentoId)) {
    throw new HttpError(400, "medicamentoId no es un ObjectId válido");
  }
  const medicamento = await Medicamento.findById(medicamentoId).lean();
  if (!medicamento) throw new HttpError(404, "Medicamento no encontrado");
  return medicamento;
};

const definir = async ({ medicamentoId, presentacion, unidades }) => {
  if (!Number.isInteger(unidades) || unidades < 0) {
    throw new HttpError(400, "unidades debe ser un entero mayor o igual a 0");
  }
  const medicamento = await cargarMedicamento(medicamentoId);
  if (!medicamento.presentaciones.some((p) => etiqueta(p) === presentacion)) {
    throw new HttpError(400, "La presentación no existe en este medicamento");
  }
  return prisma.stock.upsert({
    where: { medicamentoId_presentacion: { medicamentoId, presentacion } },
    update: { unidades },
    create: { medicamentoId, presentacion, unidades },
  });
};

const listar = async (medicamentoId) => {
  await cargarMedicamento(medicamentoId);
  return prisma.stock.findMany({
    where: { medicamentoId },
    orderBy: { presentacion: "asc" },
  });
};

module.exports = { definir, listar, cargarMedicamento, etiqueta };

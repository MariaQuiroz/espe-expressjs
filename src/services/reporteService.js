const mongoose = require("mongoose");
const Reporte = require("../models/reporte");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");
const { esObjectId, aEnteroPositivo } = require("../utils/ids");
const { ordenPermitido } = require("../utils/query");

const CAMPOS_ORDEN = ["createdAt", "gravedad"];

const crear = async (user, { ventaId, gravedad, descripcion, sintomas }) => {
  const id = aEnteroPositivo(ventaId);
  if (!id) throw new HttpError(400, "ventaId debe ser un entero mayor a 0");

  const venta = await prisma.venta.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });
  if (!venta) throw new HttpError(404, "La venta no existe");
  if (venta.userId !== user.id) {
    throw new HttpError(403, "La venta pertenece a otro usuario");
  }
  if (!venta.medicamentoId) {
    throw new HttpError(400, "La venta no tiene un medicamento asociado");
  }

  try {
    return await Reporte.create({
      ventaId: id,
      userId: user.id,
      medicamento: venta.medicamentoId,
      clienteNombre: venta.user.name,
      gravedad,
      descripcion,
      sintomas,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new HttpError(409, "Ya existe un reporte para esta venta");
    }
    throw error;
  }
};

const listar = async (user, { medicamento, gravedad, sort }) => {
  const filtro = {};
  if (user.role !== "ADMIN") filtro.userId = user.id;
  if (medicamento) {
    if (!esObjectId(medicamento)) {
      throw new HttpError(400, "medicamento no es un ObjectId válido");
    }
    filtro.medicamento = new mongoose.Types.ObjectId(medicamento);
  }
  if (gravedad) filtro.gravedad = String(gravedad);

  const orden = ordenPermitido(sort, CAMPOS_ORDEN, "-createdAt");

  const [reportes, resumen] = await Promise.all([
    Reporte.find(filtro)
      .populate("medicamento", "nombre principioActivo")
      .sort(orden),
    Reporte.aggregate([
      { $match: filtro },
      { $group: { _id: "$gravedad", total: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return { total: reportes.length, resumen, reportes };
};

module.exports = { crear, listar };

const Medicamento = require("../models/medicamento");
const Reporte = require("../models/reporte");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");
const { aEnteroPositivo } = require("../utils/ids");
const { cargarMedicamento, etiqueta } = require("./stockService");

const formatear = (venta) => ({
  ...venta,
  precioUnitario: Number(venta.precioUnitario),
  total: Number(venta.total),
});

const crear = async (userId, { medicamentoId, presentacion, cantidad }) => {
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    throw new HttpError(400, "cantidad debe ser un entero mayor a 0");
  }
  if (typeof presentacion !== "string" || !presentacion) {
    throw new HttpError(400, "presentacion es obligatoria");
  }

  const medicamento = await cargarMedicamento(medicamentoId);
  const elegida = medicamento.presentaciones.find(
    (p) => etiqueta(p) === presentacion,
  );
  if (!elegida) {
    throw new HttpError(400, "La presentación no existe en este medicamento");
  }

  const centavos = Math.round(elegida.precio * 100);
  const precioUnitario = (centavos / 100).toFixed(2);
  const total = ((centavos * cantidad) / 100).toFixed(2);

  const venta = await prisma.$transaction(async (tx) => {
    const { count } = await tx.stock.updateMany({
      where: { medicamentoId, presentacion, unidades: { gte: cantidad } },
      data: { unidades: { decrement: cantidad } },
    });
    if (count === 0) {
      throw new HttpError(409, "Stock insuficiente para la presentación");
    }
    return tx.venta.create({
      data: { userId, medicamentoId, presentacion, cantidad, precioUnitario, total },
    });
  });

  return formatear(venta);
};

const listar = async (user) => {
  const ventas = await prisma.venta.findMany({
    where: user.role === "ADMIN" ? {} : { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const ids = [...new Set(ventas.map((v) => v.medicamentoId).filter(Boolean))];
  const catalogo = await Medicamento.find({ _id: { $in: ids } })
    .select("nombre principioActivo requiereReceta")
    .lean();
  const porId = new Map(catalogo.map((m) => [String(m._id), m]));

  return ventas.map((venta) => ({
    ...formatear(venta),
    medicamento: porId.get(venta.medicamentoId) ?? null,
  }));
};

const anular = async (user, idParam) => {
  const id = aEnteroPositivo(idParam);
  if (!id) throw new HttpError(400, "El id de la venta no es válido");

  const venta = await prisma.venta.findUnique({ where: { id } });
  if (!venta) throw new HttpError(404, "Venta no encontrada");
  if (venta.userId !== user.id && user.role !== "ADMIN") {
    throw new HttpError(403, "La venta pertenece a otro usuario");
  }

  await prisma.$transaction([
    prisma.stock.updateMany({
      where: {
        medicamentoId: venta.medicamentoId,
        presentacion: venta.presentacion,
      },
      data: { unidades: { increment: venta.cantidad } },
    }),
    prisma.venta.delete({ where: { id } }),
  ]);
  await Reporte.deleteMany({ ventaId: id });
};

module.exports = { crear, listar, anular };

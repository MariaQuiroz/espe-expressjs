const Medicamento = require("../models/medicamento");
const Reporte = require("../models/reporte");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");
const { esObjectId } = require("../utils/ids");
const {
  escaparRegex,
  camposPermitidos,
  ordenPermitido,
} = require("../utils/query");

const CAMPOS_EDITABLES = [
  "nombre",
  "codigo",
  "principioActivo",
  "categoria",
  "requiereReceta",
  "contraindicaciones",
  "presentaciones",
];
const CAMPOS_CONSULTA = [
  "nombre",
  "slug",
  "codigo",
  "principioActivo",
  "categoria",
  "requiereReceta",
  "contraindicaciones",
  "presentaciones",
  "createdAt",
];
const CAMPOS_ORDEN = ["nombre", "codigo", "categoria", "createdAt"];

const seleccionar = (datos) =>
  Object.fromEntries(
    CAMPOS_EDITABLES.filter((campo) => datos[campo] !== undefined).map(
      (campo) => [campo, datos[campo]],
    ),
  );

const validarId = (id) => {
  if (!esObjectId(id)) throw new HttpError(400, "El id no es un ObjectId válido");
};

const crear = (datos) => Medicamento.create(seleccionar(datos));

const listar = ({ q, categoria, fields, sort }) => {
  const filtro = {};
  if (q) {
    const regex = new RegExp(escaparRegex(String(q)), "i");
    filtro.$or = [{ nombre: regex }, { principioActivo: regex }];
  }
  if (categoria) filtro.categoria = String(categoria);

  const proyeccion = camposPermitidos(fields, CAMPOS_CONSULTA).join(" ");
  const orden = ordenPermitido(sort, CAMPOS_ORDEN, "nombre");

  return Medicamento.find(filtro).select(proyeccion).sort(orden);
};

const obtener = async (id) => {
  validarId(id);
  const medicamento = await Medicamento.findById(id);
  if (!medicamento) throw new HttpError(404, "Medicamento no encontrado");
  return medicamento;
};

const actualizar = async (id, datos) => {
  const medicamento = await obtener(id);
  medicamento.set(seleccionar(datos));
  return medicamento.save();
};

const eliminar = async (id) => {
  const medicamento = await obtener(id);
  const ventas = await prisma.venta.count({ where: { medicamentoId: id } });
  if (ventas > 0) {
    throw new HttpError(
      409,
      `No se puede eliminar: tiene ${ventas} venta(s) registrada(s)`,
    );
  }
  await Reporte.deleteMany({ medicamento: medicamento._id });
  await prisma.stock.deleteMany({ where: { medicamentoId: id } });
  await medicamento.deleteOne();
};

module.exports = { crear, listar, obtener, actualizar, eliminar };

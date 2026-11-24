const service = require("../services/medicamentoService");

const crear = async (req, res) => {
  res.status(201).json(await service.crear(req.body));
};

const listar = async (req, res) => {
  res.json(await service.listar(req.query));
};

const obtener = async (req, res) => {
  res.json(await service.obtener(req.params.id));
};

const actualizar = async (req, res) => {
  res.json(await service.actualizar(req.params.id, req.body));
};

const eliminar = async (req, res) => {
  await service.eliminar(req.params.id);
  res.status(204).send();
};

module.exports = { crear, listar, obtener, actualizar, eliminar };

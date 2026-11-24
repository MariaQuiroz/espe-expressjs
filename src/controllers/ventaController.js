const service = require("../services/ventaService");

const crear = async (req, res) => {
  res.status(201).json(await service.crear(req.user.id, req.body));
};

const listar = async (req, res) => {
  res.json(await service.listar(req.user));
};

const anular = async (req, res) => {
  await service.anular(req.user, req.params.id);
  res.status(204).send();
};

module.exports = { crear, listar, anular };

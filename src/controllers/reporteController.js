const service = require("../services/reporteService");

const crear = async (req, res) => {
  res.status(201).json(await service.crear(req.user, req.body));
};

const listar = async (req, res) => {
  res.json(await service.listar(req.user, req.query));
};

module.exports = { crear, listar };

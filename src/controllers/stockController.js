const service = require("../services/stockService");

const definir = async (req, res) => {
  res.json(await service.definir(req.body));
};

const listar = async (req, res) => {
  res.json(await service.listar(req.params.medicamentoId));
};

module.exports = { definir, listar };

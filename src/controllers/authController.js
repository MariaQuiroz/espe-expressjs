const authService = require("../services/authService");

const registrar = async (req, res) => {
  res.status(201).json(await authService.registrar(req.body));
};

const login = async (req, res) => {
  res.json(await authService.login(req.body));
};

module.exports = { registrar, login };

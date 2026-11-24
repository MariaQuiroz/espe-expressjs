const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

const registrar = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new HttpError(400, "name, email y password son obligatorios");
  }
  if (String(password).length < 6) {
    throw new HttpError(400, "La contraseña debe tener al menos 6 caracteres");
  }
  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) throw new HttpError(409, "El correo ya está registrado");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: "USER",
    },
  });
  return { id: user.id, name: user.name, email: user.email, role: user.role };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new HttpError(400, "email y password son obligatorios");
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(401, "Credenciales inválidas");
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" },
  );
  return { token };
};

module.exports = { registrar, login };

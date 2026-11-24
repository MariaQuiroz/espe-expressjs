const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let mensaje = err.message;
  let errores;

  if (err.name === "ValidationError") {
    status = 400;
    mensaje = "Datos inválidos";
    errores = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === "CastError") {
    status = 400;
    mensaje = `Valor inválido para ${err.path}`;
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    mensaje = "El cuerpo de la petición no es un JSON válido";
  } else if (err.code === 11000 || err.code === "P2002") {
    status = 409;
    mensaje = "Ya existe un registro con esos datos";
  }

  if (status >= 500) {
    console.error(err);
    mensaje = "Error interno del servidor";
  }

  res.status(status).json({ error: mensaje, ...(errores && { errores }) });
};

module.exports = errorHandler;

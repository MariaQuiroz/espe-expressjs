const { Router } = require("express");

const router = Router();

router.use("/auth", require("./authRoutes"));
router.use("/medicamentos", require("./medicamentoRoutes"));
router.use("/stock", require("./stockRoutes"));
router.use("/ventas", require("./ventaRoutes"));
router.use("/reportes", require("./reporteRoutes"));

module.exports = router;

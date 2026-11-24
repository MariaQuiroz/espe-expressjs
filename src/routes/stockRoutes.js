const { Router } = require("express");
const controller = require("../controllers/stockController");
const authenticateToken = require("../middlewares/auth");

const router = Router();

router.use(authenticateToken);
router.put("/", controller.definir);
router.get("/:medicamentoId", controller.listar);

module.exports = router;

const { Router } = require("express");
const controller = require("../controllers/ventaController");
const authenticateToken = require("../middlewares/auth");

const router = Router();

router.use(authenticateToken);
router.get("/", controller.listar);
router.post("/", controller.crear);
router.delete("/:id", controller.anular);

module.exports = router;

const { Router } = require("express");
const controller = require("../controllers/reporteController");
const authenticateToken = require("../middlewares/auth");

const router = Router();

router.use(authenticateToken);
router.get("/", controller.listar);
router.post("/", controller.crear);

module.exports = router;

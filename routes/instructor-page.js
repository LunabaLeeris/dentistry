const express = require("express");
const router = express.Router();
const instructor_controller = require("../controllers/instructor");

router.get("/laboratory-logs", instructor_controller.send_laboratory_logs);
router.get("/procedure-logs",  instructor_controller.send_procedure_logs);
router.get("/clinicians",  instructor_controller.send_clinicians);
router.get("/patients",  instructor_controller.send_patients);

module.exports = router;

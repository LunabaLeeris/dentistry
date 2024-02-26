const express = require("express");
const router = express.Router();
const clinician_controller = require("../controllers/clinician");

router.get("/laboratory-logs", clinician_controller.send_laboratory_logs);
router.get("/procedure-logs",  clinician_controller.send_procedure_logs);
router.get("/patient-chart",   clinician_controller.send_patient_chart);
router.get("/grades",          clinician_controller.send_grades);
router.get("/tally-sheet",     clinician_controller.send_tally_sheet);
router.get("/cor",             clinician_controller.send_cor);

// for adding
router.get("/add-new-laboratory-log", clinician_controller.send_new_laboratory_log_template);
router.post("/add-new-laboratory-log", clinician_controller.add_new_laboratory_log)
router.get("/add-new-procedure-log", clinician_controller.send_new_procedure_log_template);
router.post("/add-new-procedure-log", clinician_controller.add_new_procedure_log)
router.get("/add-new-patient", clinician_controller.send_new_patient_template);
router.post("/add-new-patient", clinician_controller.add_new_patient)

module.exports = router;

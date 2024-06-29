const express = require("express");
const router = express.Router();
const clinician_controller = require("../controllers/clinician");

router.get("/laboratory-logs/:table_index/:filter_by/:order_by/:search?", (req, res) => clinician_controller.send_laboratory_logs
                            (req, res, parseInt(req.params.table_index, 10), req.params.filter_by, req.params.order_by, req.params.search));
router.get("/patient-chart/:table_index/:filter_by/:order_by/:search?", (req, res) => clinician_controller.send_patient_chart
                            (req, res, parseInt(req.params.table_index, 10), req.params.filter_by, req.params.order_by, req.params.search));
router.get("/procedure-logs/:table_index/:filter_by/:order_by/:search?/:level?",  (req, res) => clinician_controller.send_procedure_logs
                            (req, res, parseInt(req.params.table_index, 10), req.params.filter_by, req.params.order_by, req.params.search, req.params.level));

router.get("/grades",          clinician_controller.send_grades);
router.get("/tally-sheets",     clinician_controller.send_tally_sheet);
router.get("/cor",             clinician_controller.send_cor);

// for adding
router.get("/add-new-laboratory-log",(req, res) => clinician_controller.send_new_laboratory_log_template(req, res, null));
router.post("/add-new-laboratory-log", clinician_controller.add_new_laboratory_log);
router.get("/add-new-patient", clinician_controller.send_new_patient_template);
router.post("/add-new-patient", clinician_controller.add_new_patient)

// for actions
router.get("/view-laboratory-log/:report_id", (req, res) => clinician_controller.send_view_laboratory_log(req, res, req.params.report_id));
router.get("/edit-laboratory-log/:report_id", (req, res) => clinician_controller.send_edit_laboratory_log(req, res, req.params.report_id));
router.get("/delete-laboratory-log/:report_id", (req, res) => clinician_controller.delete_laboratory_log(req, res, req.params.report_id));
router.post("/edit-laboratory-log/:report_id", (req, res) => clinician_controller.edit_laboratory_log(req, res, req.params.report_id));

router.get("/view-patient-chart/:report_id", (req, res) => clinician_controller.send_view_patient_chart(req, res, req.params.report_id, true));
router.get("/edit-patient-chart/:report_id", (req, res) => clinician_controller.send_view_patient_chart(req, res, req.params.report_id, false));
router.get("/delete-patient-chart/:report_id", (req, res) => clinician_controller.delete_patient_chart(req, res, req.params.report_id));
router.post("/edit-patient-chart/:report_id", (req, res) => clinician_controller.edit_patient_chart(req, res, req.params.report_id));

router.get("/edit-procedure-log/:report_id", (req, res) => clinician_controller.edit_procedure_log_template(req, res, req.params.report_id));
router.post("/edit-procedure-log/:report_id", (req, res) => clinician_controller.edit_procedure_log(req, res, req.params.report_id));

module.exports = router;

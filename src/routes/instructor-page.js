const express = require("express");
const router = express.Router();
const instructor_controller = require("../controllers/instructor");

router.get("/laboratory-logs/:table_index/:filter_by/:order_by/:date/:search?", (req, res) => instructor_controller.send_laboratory_logs
                            (req, res, parseInt(req.params.table_index, 10), req.params.filter_by, req.params.order_by, req.params.date, req.params.search));
router.get("/procedure-logs",  instructor_controller.send_procedure_logs);
router.get("/clinicians/:table_index/:filter_by/:order_by/:search?",  (req, res) => instructor_controller.send_clinicians
                            (req, res, parseInt(req.params.table_index, 10), req.params.filter_by, req.params.order_by, req.params.search));
router.get("/patients/:table_index/:filter_by/:order_by/:search?",  (req, res) => instructor_controller.send_patients
                            (req, res, parseInt(req.params.table_index, 10), req.params.filter_by, req.params.order_by, req.params.search));

// for actions
router.get("/view-clinician/:report_id", (req, res) => instructor_controller.send_view_clinician(req, res, req.params.report_id));
router.get("/get-clinician/:table/:clinician_id", (req, res) => instructor_controller.get_clinician_table(req, res, req.params.table, req.params.clinician_id));

module.exports = router;

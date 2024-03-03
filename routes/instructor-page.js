const express = require("express");
const router = express.Router();
const instructor_controller = require("../controllers/instructor");

router.get("/laboratory-logs/:table_index/:filter_by/:order_by/:date/:search?", (req, res) => instructor_controller.send_laboratory_logs
                            (req, res, parseInt(req.params.table_index, 10), req.params.filter_by, req.params.order_by, req.params.date, req.params.search));
router.get("/procedure-logs",  instructor_controller.send_procedure_logs);
router.get("/clinicians/:table_index/:filter_by/:order_by/:search?",  (req, res) => instructor_controller.send_clinicians
                            (req, res, parseInt(req.params.table_index, 10), req.params.filter_by, req.params.order_by, req.params.search));
router.get("/patients",  instructor_controller.send_patients);

// for actions
router.get("/view-laboratory-log/:report_id", (req, res) => instructor_controller.send_view_laboratory_log(req, res, req.params.report_id));

module.exports = router;

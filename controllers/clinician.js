
const fs = require('fs');
const path = require('path');
const { report } = require('../routes/clinician-page');
const public = path.join(__dirname, 'templates', 'clinician');

// ================== LABORATORY LOG FUNCTIONS =================
exports.get_laboratory_logs = (req) => {
    const data = fs.readFileSync(path.join(public, "laboratory_logs.hbs"), 'utf8');
    const last_query_date = "12345"; 
    const table_data =  // GENERATE TABLE
    ``;

    const render_data = data
        .replace('{{LAST-DATE}}', last_query_date)
        .replace('{{TABLE-DATA}}', table_data)
        .replace('{{EMPTY-TAG}}', () => {
            if (!table_data){
                return `<div class="col d-flex justify-content-center align-items-center">
                            <h6 class="w-100 alert alert-light mt-4  d-flex justify-content-center" role"alert">No laboratory logs to show...</h6>
                        </div>`
            }
            else return "";
        });

    return render_data;
}

exports.send_laboratory_logs = (req, res) => {
    if (!req.session.userId) {
        console.log(req.session.userId);
        return res.sendStatus(401); 
    }

    return res.send(this.get_laboratory_logs(req));
}
exports.send_new_laboratory_log_template = (req, res) => {
    return res.send(fs.readFileSync(path.join(public, "new_laboratory_log.hbs"), 'utf8'));
}

exports.add_new_laboratory_log = (req, res) => {
    // create the new laboratory log then somehow retrieve its id
    const report_id = "something";  // then view that laboratory log id
    return res.send(this.view_laboratory_log(report_id));
}

exports.view_laboratory_log = (report_id) => {
    const data = fs.readFileSync(path.join(public, "view_laboratory_log.hbs"), 'utf8');
    // get value on db then change data
    return data;
} 

exports.edit_laboratory_log = (report_id) => {
    // get send_new_lab_log_template 
    // Get values on db then places them on the template
    // if edit is clicked we change the value on teh db
    // then call view
}

// ===========================================================

// ================== PROCEDURE LOG FUNCTIONS ================

exports.get_procedure_logs = (req) => {
    const data = fs.readFileSync(path.join(public, "procedure_logs.hbs"), 'utf8');
    const last_query_date = "12345"; 
    const table_data = 
    ``;

    const render_data = data
        .replace('{{LAST-DATE}}', last_query_date)
        .replace('{{TABLE-DATA}}', table_data)
        .replace('{{EMPTY-TAG}}', () => {
            if (!table_data){
                return `<div class="col d-flex justify-content-center align-items-center">
                            <h6 class="w-100 alert alert-light mt-4  d-flex justify-content-center" role"alert">No procedure logs to show...</h6>
                        </div>`
            }
            else return "";
        });

    return render_data;
}

exports.send_procedure_logs = (req, res) => {
    if (!req.session.userId) {
        console.log(req.session.userId);
        return res.sendStatus(401); 
    }

    return res.send(this.get_procedure_logs(req));
}

exports.send_new_procedure_log_template = (req, res) => {
    return res.send(fs.readFileSync(path.join(public, "new_procedure_log.hbs"), 'utf8'));
}

exports.add_new_procedure_log = (req, res) => {
     // create the new laboratory log then somehow retrieve its id
     const report_id = "something";  // then view that laboratory log id
     return res.send(this.view_procedure_log(report_id));
}

exports.view_procedure_log = (report_id) => {
    const data = fs.readFileSync(path.join(public, "view_procedure_log.hbs"), 'utf8');
    // get value on db then change data
    return data;
} 

// ===========================================================

// ===================== PATIENT FUNCTIONS ===================

exports.get_patient_chart = (req) => {
    const data = fs.readFileSync(path.join(public, "patient_chart.hbs"), 'utf8');
    const last_query_date = "12345"; 
    const table_data =  // GENERATE TABLE
    ``;

    const render_data = data
        .replace('{{LAST-DATE}}', last_query_date)
        .replace('{{TABLE-DATA}}', table_data)
        .replace('{{EMPTY-TAG}}', () => {
            if (!table_data){
                return `<div class="col d-flex justify-content-center align-items-center">
                            <h6 class="w-100 alert alert-light mt-4  d-flex justify-content-center" role"alert">No patients to show...</h6>
                        </div>`
            }
            else return "";
        });

    return render_data;
}

exports.send_patient_chart = (req, res) => {
    if (!req.session.userId) {
        console.log(req.session.userId);
        return res.sendStatus(401); 
    }

    return res.send(this.get_patient_chart(req));
}

exports.send_new_patient_template = (req, res) => {
    return res.send(fs.readFileSync(path.join(public, "new_patient.hbs"), 'utf8'));
}

exports.add_new_patient = (req, res) => {
     // create the new patient  then somehow retrieve its id
     const report_id = "something";  // then view that patient
     return res.send(this.view_patient(report_id));
}

exports.view_patient = (report_id) => {
    const data = fs.readFileSync(path.join(public, "view_patient.hbs"), 'utf8');
    // get value on db then change data
    return data;
}

// ===========================================================

exports.get_grades = (req) => {
    const data = fs.readFileSync(path.join(public, "grades.hbs"), 'utf8');

    return data;
}

exports.send_grades = (req, res) => {
    if (!req.session.userId) {
        console.log(req.session.userId);
        return res.sendStatus(401); 
    }

    return res.send(this.get_grades(req));
}


exports.get_tally_sheet = (req) => {
    const data = fs.readFileSync(path.join(public, "tally_sheets.hbs"), 'utf8');

    return data;
}

exports.send_tally_sheet = (req, res) => {
    if (!req.session.userId) {
        console.log(req.session.userId);
        return res.sendStatus(401); 
    }

    return res.send(this.get_tally_sheet(req));
}

exports.get_cor = (req) => {
    const data = fs.readFileSync(path.join(public, "cor.hbs"), 'utf8');

    return data;
}

exports.send_cor = (req, res) => {
    if (!req.session.userId) {
        console.log(req.session.userId);
        return res.sendStatus(401); 
    }

    return res.send(this.get_cor(req));
}
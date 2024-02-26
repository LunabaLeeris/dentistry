const fs = require('fs');
const path = require('path');
const public = path.join(__dirname, 'templates', 'instructor');

exports.get_laboratory_logs = (req) => {
    const data = fs.readFileSync(path.join(public, "laboratory_logs.hbs"), 'utf8');
    const last_query_date = "12345"; 
    const table_data = 
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

exports.get_procedure_logs = (req) => {
    const data = fs.readFileSync(path.join(public, "procedure_logs.hbs"), 'utf8');
    const last_query_date = "12345"; 
    const table_data =  // GENERATE TABLE
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


exports.get_clinicians = (req) => {
     const data = fs.readFileSync(path.join(public, "clinicians.hbs"), 'utf8');
     const table_data =  // GENERATE TABLE
     ``;
 
     const render_data = data
         .replace('{{TABLE-DATA}}', table_data)
         .replace('{{EMPTY-TAG}}', () => {
             if (!table_data){
                 return `<div class="col d-flex justify-content-center align-items-center">
                             <h6 class="w-100 alert alert-light mt-4  d-flex justify-content-center" role"alert">No Clinicians to show...</h6>
                         </div>`
             }
             else return "";
         });
 
     return render_data;
}

exports.send_clinicians = (req, res) => {
    if (!req.session.userId) {
        console.log(req.session.userId);
        return res.sendStatus(401); 
    }

    return res.send(this.get_clinicians(req));
}

exports.get_patients = (req) => {
    const data = fs.readFileSync(path.join(public, "patients.hbs"), 'utf8');
    const table_data =  // GENERATE TABLE
    ``;

    const render_data = data
        .replace('{{TABLE-DATA}}', table_data)
        .replace('{{EMPTY-TAG}}', () => {
            if (!table_data){
                return `<div class="col d-flex justify-content-center align-items-center">
                            <h6 class="w-100 alert alert-light mt-4  d-flex justify-content-center" role"alert">No Patients to show...</h6>
                        </div>`
            }
            else return "";
        });

    return render_data;
}

exports.send_patients = (req, res) => {
    if (!req.session.userId) {
        console.log(req.session.userId);
        return res.sendStatus(401); 
    }

    return res.send(this.get_patients(req));
}
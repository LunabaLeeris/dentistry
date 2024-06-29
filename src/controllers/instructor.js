const fs = require('fs');
const path = require('path');
const database = require('../../db');
const public = path.join(__dirname, 'templates', 'instructor');
const clinician_controller = require('./clinician');
const date_formatter = require('./date_format');
const max = 5;

exports.get_clinician_table = async (req, res, table, id) => {
    try{
        let table_to_return = ``;

        switch(table){
            case "laboratory-logs" : 
                table_to_return = await this.get_laboratory_log_table(id);
                break;
            case "patient-chart":
                table_to_return = await this.get_patient_chart_table(id);
                break;
        }
        
        console.log(table_to_return);
        res.send(table_to_return);
    }
    catch (error) {
        console.error('Error sending laboratory logs:', error);
        return res.sendStatus(500);
    }
}

// ============== LABORATORY FUNCTIONS ===========================

exports.get_laboratory_logs = async (req, table_index, filter_by, order_by, date="-", search=undefined) => {
    const data = fs.readFileSync(path.join(public, "laboratory_logs.hbs"), 'utf8');
    let last_query_date = ``;
    let table_data = ``;
    let table_nav = ``;
    let search_condition = ``;
    let search_route = ``;
    let date_filter = ``;
    let today = ``, all = ``;

    try {
        // get table content 
        if (search != undefined){
            search_route = `/${search}`;
            search_condition = `AND laboratory_report_id = "${search}" OR laboratory_time_in = "${search}" OR laboratory_time_out = "${search}"
            OR laboratory_remarks = "${search}" OR instructor_name = "${search}" OR clinician_name = "${search}" OR clinician_id= "${search}"`
        };

        if (date != "-"){
            date_filter = `AND laboratory_date = ${date} `;
            today = `checked`;
        }
        else all = `checked`;

        
        const results = await database.query(`select * from laboratory_logs_view where instructor_id = "${req.session.userId}" ${search_condition} ${date_filter}
        order by ${filter_by} ${order_by} limit ${table_index*max}, ${max}`);

        console.log(`select * from laboratory_logs_view where instructor_id = "${req.session.userId}" ${search_condition} ${date_filter}
        order by ${filter_by} ${order_by} limit ${table_index*max}, ${max}`);
                                           
        for (let i = 0; i < results.length; i++) {
            
            table_data += 
            `
                <tr>
                    <th scope="row">${(table_index*max) + i + 1}</th>
                    <td>${results[i].laboratory_report_id}</td>
                    <td>${results[i].clinician_name}</td>
                    <td>${results[i].clinician_id}</td>
                    <td>${results[i].laboratory_time_in}</td>
                    <td>${results[i].laboratory_time_out}</td>
                    <td>${results[i].laboratory_remarks}</td>
                    <td>
                        <div class="col d-flex justify-content-center align-items-center">
                            <button type="button" id="lab-view" name="${results[i].laboratory_report_id}" class="action btn btn-light rounded-0 border me-2">
                                <img src="./assets/icons/view.svg" class="svg">
                            </button>
                        </div>
                    </td>
                </tr>
            `; 
        }

        // construct table nav
        const size = await database.query(`SELECT COUNT(*) as size FROM laboratory_logs_view where instructor_id = "${req.session.userId}" ${search_condition}  ${date_filter};`);
        const remaining =  Math.ceil(Math.max(0, size[0].size - (table_index + 1)*max)/max);
        console.log(size);

        if (size[0].size > max){
            if (table_index > 0)
                table_nav += `<button type="button" id="lab-table-nav" name="${table_index - 1}/${filter_by}/${order_by}/${date}${search_route}"  class="action btn btn-light rounded-0 border">
                                <span class="text-primary"><b>&lt</b></span>
                                </button>`
            table_nav += `<button type="button" id="lab-table-nav" name="${table_index}/${filter_by}/${order_by}/${date}${search_route}" class="action btn btn-primary rounded-0 border border-primary">
                            <span>${table_index + 1}</span>
                            </button>`
            for (let i = 1; i <= remaining; i++){
                table_nav += `
                    <button type="button" id="lab-table-nav" name="${table_index + i}/${filter_by}/${order_by}/${date}${search_route}" class="action btn btn-light rounded-0 border border">
                        <span>${table_index + 1 + i}</span>
                    </button>
                `
            }
            
            if (table_index < table_index + remaining)
                table_nav += `<button type="button" id="lab-table-nav" name="${table_index + 1}/${filter_by}/${order_by}/${date}${search_route}" class="action btn btn-light rounded-0 border">
                                <span class="text-primary"><b>&gt</b></span>
                                </button>`
        }

        const render_data = data
            .replace('{{LAST-DATE}}', last_query_date)
            .replace('{{TABLE-DATA}}', table_data)
            .replace('{{TODAY}}', today)
            .replace('{{ALL}}', all)
            .replace('{{SEARCH-BUTTON}}', `/instructor/laboratory-logs/0/${filter_by}/${order_by}/${date}`)
            .replace(/{{SEARCH}}/g, search_route)
            .replace(/{{DATE-FILTER}}/g, date)
            .replace('{{EMPTY-TAG}}', () => {
                if (!table_data) {
                    return `<div class="col d-flex justify-content-center align-items-center">
                                <h6 class="w-100 alert alert-light mt-4  d-flex justify-content-center" role"alert">No laboratory logs to show...</h6>
                            </div>`;
                } else return "";
            })
            .replace('{{TABLE-NAV}}', table_nav);
        
        return render_data; // Return the render_data

    } catch (error) {
        console.log("Error sending query\n");
        console.log(error);
        return 404 // Return empty string in case of error
    }
}

exports.send_laboratory_logs = async (req, res, start, filter_by, order_by, date="-", search=undefined) => {
    if (!req.session.userId) {
        console.log(req.session.userId);
        return res.sendStatus(401); 
    }

    try {
        const render_data = await this.get_laboratory_logs(req, start, filter_by, order_by, date, search);
        return res.send(render_data);
    } catch (error) {
        console.error('Error sending laboratory logs:', error);
        return res.sendStatus(500);
    }
}

exports.view_laboratory_log = async (report_id) => { 
    try{
        const data = fs.readFileSync(path.join(public, "view_laboratory_log.hbs"), 'utf8');
        const results = await database.query('call get_specific_laboratory_log(?)', [report_id]);

        const render_data = data
            .replace('{{LAST-DATE}}',       date_formatter.convert_to_date_time(results[0][0].laboratory_last_updated))
            .replace(/{{REPORT-ID}}/g,      report_id)
            .replace('{{CLINICIAN-NAME}}',            results[0][0].clinician_name)
            .replace('{{CLINICIAN-ID}}',            results[0][0].clinician_id)
            .replace('{{DATE}}',            results[0][0].laboratory_date)
            .replace('{{TIME-IN}}',         results[0][0].laboratory_time_in)
            .replace('{{TIME-OUT}}',        results[0][0].laboratory_time_out)
            .replace('{{INSTRUCTOR-NAME}}', results[0][0].instructor_name)
            .replace('{{REMARKS}}',         results[0][0].laboratory_remarks)

        return render_data;
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return 404; // Send response with default data in case of error
    };
} 

exports.send_view_laboratory_log = async (req, res, report_id) => {
    try{
        const laboratory_log = await this.view_laboratory_log(report_id);
        return res.send(laboratory_log);
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
}

// ==============================================================

// ============== PROCEDURE LOG FUNCTIONS =======================
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
// ==============================================================

// =============== CLINICIANS FUNCTIONS =========================

exports.get_patient_chart_table = async (clinician_id) => {
    try{
        const table = await clinician_controller.get_patient_table_data(clinician_id, 0, "patient_admission_date", "desc", undefined, false);

        const table_data = `
                <div class="col mt-1 table-responsive">
                <table class="table w-100 table-md table-bordered mt-3">
                    <thead>
                        <tr class="table-primary">
                        <th scope="col">No.</th>
                        <th scope="col">Patient ID</th>
                        <th scope="col">Patient Name</th>
                        <th scope="col">Admission Date</th>
                        <th scope="col">Most Recent Procedure</th>
                        <th scope="col">Instructor Name</th>
                        <th scope="col">Last Updated</th>
                        <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                            ${table[0]}
                    </tbody>
                </table>
                </div>
                ${ !table[0] ? `<div class="col d-flex justify-content-center align-items-center">
                    <h6 class="w-100 alert alert-light mt-4  d-flex justify-content-center" role"alert">No Patients to show...</h6>
                </div>` :  ""}
                <div class="col d-flex justify-content-center mt-5">
                ${table[1]}
            </div>
        `

        return table_data;
    }
    catch (error) {
        console.error('Error sending laboratory logs:', error);
        return res.sendStatus(500);
    }
}

exports.get_laboratory_log_table = async (clinician_id) => {
    try{
        const table = await clinician_controller.get_laboratory_table_data(clinician_id, 0, "laboratory_date", "desc", undefined, false);

        const table_data = `
                <div class="col mt-1 table-responsive">
                <table class="table w-100 table-md table-bordered mt-3">
                    <thead>
                        <tr class="table-primary">
                        <th scope="col">#</th>
                        <th scope="col">ReportID</th>
                        <th scope="col">Laboratory Date</th>
                        <th scope="col">Time In</th>
                        <th scope="col">Time out</th>
                        <th scope="col">Instructor Name</th>
                        <th scope="col">Remarks</th>
                        <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                            ${table[0]}
                    </tbody>
                </table>
                </div>
                ${ !table[0] ? `<div class="col d-flex justify-content-center align-items-center">
                    <h6 class="w-100 alert alert-light mt-4  d-flex justify-content-center" role"alert">No laboratory logs to show...</h6>
                </div>` :  ""}
                <div class="col d-flex justify-content-center mt-5">
                ${table[1]}
            </div>
        `

        return table_data;
    }
     catch (error) {
    console.error('Error sending laboratory logs:', error);
    return res.sendStatus(500);
}
}

exports.get_clinicians = async (req, table_index, filter_by, order_by, search=undefined) => {
    const data = fs.readFileSync(path.join(public, "clinicians.hbs"), 'utf8');
    let table_data = ``;
    let table_nav = ``;
    let search_condition = ``;
    let search_route = ``;
    
    try {
        // get table content 
        if (search != undefined){
            search_route = `/${search}`;
            search_condition = `WHERE c.clinician_name = "${search}" OR c.clinician_id = "${search}" OR c.clinic_level_enrolled = "${search}"`
        };
        
        const QUERY = `
                select c.clinician_name, c.clinician_id, c.clinic_level_enrolled from clinicians_view as c
                LEFT JOIN 
                    (select * from laboratory_logs_view 
                WHERE 
                    instructor_id = "${req.session.userId}") as i
                ON 
                    c.clinician_id = i.clinician_id
                ${search_condition}
                UNION
                select c.clinician_name, c.clinician_id, c.clinic_level_enrolled from clinicians_view as c
                LEFT JOIN 
                    (select * from procedure_logs_view 
                WHERE 
                    instructor_id = "${req.session.userId}") as p
                ON 
                    c.clinician_id = p.clinician_id
                ${search_condition}
        `
        const results = await database.query(`${QUERY} order by ${filter_by} ${order_by} limit ${table_index*max}, ${max};`);

        for (let i = 0; i < results.length; i++) {
            
            table_data += 
            `
                <tr>
                    <th scope="row">${(table_index*max) + i + 1}</th>
                    <td>${results[i].clinician_name}</td>
                    <td>${results[i].clinician_id}</td>
                    <td>${results[i].clinic_level_enrolled}</td>
                    <td>
                        <div class="col d-flex justify-content-center align-items-center">
                            <button type="button" id="cl-view" name="${results[i].clinician_id}" class="action btn btn-light rounded-0 border me-2">
                                <img src="./assets/icons/view.svg" class="svg">
                            </button>
                        </div>
                    </td>
                </tr>
            `; 
        }

        // construct table nav
        const size = await database.query(`SELECT COUNT(*) as size FROM (${QUERY}) as c;`);
        const remaining =  Math.ceil(Math.max(0, size[0].size - (table_index + 1)*max)/max);
        
        if (size[0].size > max){
            if (table_index > 0)
                table_nav += `<button type="button" id="cl-table-nav" name="${table_index - 1}/${filter_by}/${order_by}${search_route}"  class="action btn btn-light rounded-0 border">
                                <span class="text-primary"><b>&lt</b></span>
                                </button>`
            table_nav += `<button type="button" id="cl-table-nav" name="${table_index}/${filter_by}/${order_by}${search_route}" class="action btn btn-primary rounded-0 border border-primary">
                            <span>${table_index + 1}</span>
                            </button>`
            for (let i = 1; i <= remaining; i++){
                table_nav += `
                    <button type="button" id="cl-table-nav" name="${table_index + i}/${filter_by}/${order_by}${search_route}" class="action btn btn-light rounded-0 border border">
                        <span>${table_index + 1 + i}</span>
                    </button>
                `
            }
            
            if (table_index < table_index + remaining)
                table_nav += `<button type="button" id="cl-table-nav" name="${table_index + 1}/${filter_by}/${order_by}${search_route} class="action btn btn-light rounded-0 border">
                                <span class="text-primary"><b>&gt</b></span>
                                </button>`
        }

        const render_data = data
            .replace('{{TABLE-DATA}}', table_data)
            .replace('{{SEARCH-BUTTON}}', `/instructor/clinicians/0/${filter_by}/${order_by}`)
            .replace(/{{SEARCH}}/g, search_route)
            .replace('{{EMPTY-TAG}}', () => {
                if (!table_data) {
                    return `<div class="col d-flex justify-content-center align-items-center">
                                <h6 class="w-100 alert alert-light mt-4  d-flex justify-content-center" role"alert">No laboratory logs to show...</h6>
                            </div>`;
                } else return "";
            })
            .replace('{{TABLE-NAV}}', table_nav);

        return render_data; // Return the render_data
    } 
    catch (error) {
        console.log("Error sending query\n");
        console.log(error);
        return 404 // Return empty string in case of error
    }
}

exports.send_clinicians = async (req, res, table_index, filter_by, order_by, search=undefined) => { 
    if (!req.session.userId) {
        console.log(req.session.userId);
        return res.sendStatus(401); 
    }

    try {
        const render_data = await this.get_clinicians(req, table_index, filter_by, order_by, search);
        return res.send(render_data);
    } catch (error) {
        console.error('Error sending laboratory logs:', error);
        return res.sendStatus(500);
    }
}

exports.view_clinician = async (clinician_id) => {
    try{
        const data = fs.readFileSync(path.join(public, "view_clinician.hbs"), 'utf8');
        const clinician_data = await database.query(`select * from clinicians_view where clinician_id = "${clinician_id}";`);
        
        const render_data = data
            .replace(/{{CLINICIAN-NAME}}/g, clinician_data[0].clinician_name)
            .replace(/{{CLINICIAN-ID}}/g, clinician_data[0].clinician_id)
            .replace(`{{CLINIC-LEVEL}}`, clinician_data[0].clinic_level_enrolled)
            .replace(`{{EMAIL}}`, clinician_data[0].clinician_email)
            .replace('{{TABLE-DATA}}', await this.get_laboratory_log_table(clinician_id))

        return render_data;
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return 404; // Send response with default data in case of error
    };
}

exports.send_view_clinician = async (req, res, report_id) => {
    try{
        const clinician = await this.view_clinician(report_id);
        return res.send(clinician);
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
}

// ==============================================================

exports.get_patients = async (req, table_index, filter_by, order_by, search=undefined) => {
    try{
        const data = fs.readFileSync(path.join(public, "patients.hbs"), 'utf8');
        let table_data = ``;
        let search_route = ``;
        let search_condition = ``;
        let table_nav = ``;

        if (search != undefined){
            search_route = `/${search}`;
            search_condition = `WHERE p.patient_id = "${search}" OR p.patient_name = "${search}"
            OR pv.procedure_report_id as most_recent_procedure = "${search}"`
        };

        const QUERY = `
        select p.patient_name, p.patient_index, p.patient_admission_date, pv.procedure_report_id as most_recent_procedure from instructors as i
        left join
            procedure_logs_view as pv
        on
            i.instructor_id = pv.instructor_id
        left join
            patients as p
        on
            pv.patient_id = p.patient_index
        `;
        const results = await database.query(`${QUERY} ${search_condition}
                                                order by p.${filter_by} ${order_by} limit ${table_index*max}, ${max};`);
                                                

        console.log(results);
                    
        if (results.length > 0){
            for (let i = 0; i < results.length; i++) {
                if (results[i].patient_name == null) break;
                table_data += 
                `
                    <tr>
                        <th scope="row">${(table_index*max) + i + 1}</th>
                        <td>${results[i].patient_id}</td> 
                        <td>${results[i].patient_name}</td>
                        <td>${date_formatter.convert_to_date(results[i].patient_admission_date)}</td>
                        <td>${results[i].most_recent_procedure}</td>
                        <td>
                            <div class="col d-flex justify-content-center align-items-center">
                                <button type="button" id="pat-view"  name="${results[i].patient_id}" class="action btn btn-light rounded-0 border me-2">
                                    <img src="./assets/icons/view.svg" class="svg">
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
                
            }
        }

        // construct table nav
        const size = await database.query(`SELECT COUNT(*) as size FROM (${QUERY} ${search_condition}) as res`);
        const remaining =  Math.ceil(Math.max(0, size[0].size - (table_index + 1)*max)/max);
        
        if (size[0].size > max){
            if (table_index > 0)
                table_nav += `<button type="button" id="pat-table-nav" name="${table_index - 1}/${filter_by}/${order_by}${search_route}"  class="action btn btn-light rounded-0 border">
                                <span class="text-primary"><b>&lt</b></span>
                                </button>`
            table_nav += `<button type="button" id="pat-table-nav" name="${table_index}/${filter_by}/${order_by}${search_route}" class="action btn btn-primary rounded-0 border border-primary">
                            <span>${table_index + 1}</span>
                            </button>`
            for (let i = 1; i <= remaining; i++){
                table_nav += `
                    <button type="button" id="pat-table-nav" name="${table_index + i}/${filter_by}/${order_by}${search_route}" class="action btn btn-light rounded-0 border border">
                        <span>${table_index + 1 + i}</span>
                    </button>
                `
            }
            
            if (table_index < table_index + remaining)
                table_nav += `<button type="button" id="pat-table-nav" name="${table_index + 1}/${filter_by}/${order_by}${search_route}" class="action btn btn-light rounded-0 border">
                                <span class="text-primary"><b>&gt</b></span>
                                </button>`
        }
    
        const render_data = data
            .replace('{{TABLE-DATA}}', table_data)
            .replace('{{SEARCH-BUTTON}}', `/clinician/patient-chart/0/${filter_by}/${order_by}`)
            .replace(/{{SEARCH}}/g, search_route)
            .replace('{{EMPTY-TAG}}', () => {
                if (!table_data) {
                    return `<div class="col d-flex justify-content-center align-items-center">
                                <h6 class="w-100 alert alert-light mt-4  d-flex justify-content-center" role"alert">No patients to show...</h6>
                            </div>`;
                } else return "";
            })
            .replace('{{TABLE-NAV}}', table_nav);
        
        return render_data;
    } 
    catch (error) {
        console.log("Error sending query\n");
        console.log(error);
        return 404 // Return empty string in case of error
    }
}

exports.send_patients = async (req, res, table_index, filter_by, order_by, search=undefined) => {
    if (!req.session.userId) {
        console.log(req.session.userId);
        return res.sendStatus(401); 
    }

    try {
        const render_data = await this.get_patients(req, table_index, filter_by, order_by, search=undefined);
        return res.send(render_data);
    } catch (error) {
        console.error('Error sending laboratory logs:', error);
        return res.sendStatus(500);
    }
}
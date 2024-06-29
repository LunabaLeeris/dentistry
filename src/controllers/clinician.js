
const fs = require('fs');
const path = require('path');
const database = require('../../db');
const { report } = require('../routes/clinician-page');
const public = path.join(__dirname, 'templates', 'clinician');
const date_formatter = require("./date_format");
const util = require('util');
const { get_procedure_logs } = require('./instructor');
const max = 5;

// ================== LABORATORY LOG FUNCTIONS =================

exports.get_laboratory_table_data = async (clinician_id, table_index, filter_by, order_by, search=undefined, editable=true) => {
    try{
        let table_data = ``;
        let search_condition = ``;
        let table_nav = ``;
        let search_route = ``;
        
        if (search != undefined){
            search_route = `/${search}`;
            search_condition = `AND laboratory_report_id = "${search}" OR laboratory_time_in = "${search}" OR laboratory_time_out = "${search}"
            OR laboratory_remarks = "${search}" OR instructor_name = "${search}"`
        };

        
        const results = await database.query(`select * from laboratory_logs_view where clinician_id = "${clinician_id}" ${search_condition}
        order by ${filter_by} ${order_by} limit ${table_index*max}, ${max}`);
                                        
        for (let i = 0; i < results.length; i++) {
            
            table_data += 
            `
                <tr>
                    <th scope="row">${(table_index*max) + i + 1}</th>
                    <td>${results[i].laboratory_report_id}</td>
                    <td>${date_formatter.convert_to_date(results[i].laboratory_date)}</td>
                    <td>${results[i].laboratory_time_in}</td>
                    <td>${results[i].laboratory_time_out}</td>
                    <td>${results[i].instructor_name}</td>
                    <td>${results[i].laboratory_remarks}</td>
                    <td>
                        <div class="col d-flex justify-content-center align-items-center">
                            <button type="button" id="lab-view" name="${results[i].laboratory_report_id}" class="action btn btn-light rounded-0 border me-2">
                                <img src="./assets/icons/view.svg" class="svg">
                            </button>
                            ${
                                editable ? 
                            `<button type="button" id="lab-edit" name="${results[i].laboratory_report_id}" class="action btn btn-light rounded-0 border me-2">
                                <img src="./assets/icons/submit.svg" class="svg">
                            </button>
                            <button type="button" id="lab-ask-delete" name="${results[i].laboratory_report_id}" class="action btn btn-light rounded-0 border">
                                <img src="./assets/icons/delete.svg" class="svg">
                            </button>`
                            : ``
                            }
                        </div>
                    </td>
                </tr>
            `;
        }

        // construct table nav
        const size = await database.query(`SELECT COUNT(*) as size FROM laboratory_logs_view where clinician_id = "${clinician_id}" ${search_condition};`);
        const remaining =  Math.ceil(Math.max(0, size[0].size - (table_index + 1)*max)/max);
        
        if (size[0].size > max){
            if (table_index > 0)
                table_nav += `<button type="button" id="lab-table-nav" name="${table_index - 1}/${filter_by}/${order_by}${search_route}"  class="action btn btn-light rounded-0 border">
                                <span class="text-primary"><b>&lt</b></span>
                                </button>`
            table_nav += `<button type="button" id="lab-table-nav" name="${table_index}/${filter_by}/${order_by}${search_route}" class="action btn btn-primary rounded-0 border border-primary">
                            <span>${table_index + 1}</span>
                            </button>`
            for (let i = 1; i <= remaining; i++){
                table_nav += `
                    <button type="button" id="lab-table-nav" name="${table_index + i}/${filter_by}/${order_by}${search_route}" class="action btn btn-light rounded-0 border border">
                        <span>${table_index + 1 + i}</span>
                    </button>
                `
            }
            
            if (table_index < table_index + remaining)
                table_nav += `<button type="button" id="lab-table-nav" name="${table_index + 1}/${filter_by}/${order_by}${search_route}" class="action btn btn-light rounded-0 border">
                                <span class="text-primary"><b>&gt</b></span>
                                </button>`
        }

        return [table_data, table_nav];
    }
    catch (error) {
        console.log("Error sending query\n");
        console.log(error);
        return 404 // Return empty string in case of error
    }
}

exports.get_laboratory_logs = async (req, table_index, filter_by, order_by, search=undefined) => {
    const data = fs.readFileSync(path.join(public, "laboratory_logs.hbs"), 'utf8');
    let last_query_date = ``;
    let search_route = ``;
    
    try {
        const table = await this.get_laboratory_table_data(req.session.userId, table_index, filter_by, order_by, search);

        const render_data = data
            .replace('{{LAST-DATE}}', last_query_date)
            .replace('{{TABLE-DATA}}', table[0])
            .replace('{{SEARCH-BUTTON}}', `/clinician/laboratory-logs/0/${filter_by}/${order_by}`)
            .replace(/{{SEARCH}}/g, search_route)
            .replace('{{EMPTY-TAG}}', () => {
                if (!table[0]) {
                    return `<div class="col d-flex justify-content-center align-items-center">
                                <h6 class="w-100 alert alert-light mt-4  d-flex justify-content-center" role"alert">No laboratory logs to show...</h6>
                            </div>`;
                } else return "";
            })
            .replace('{{TABLE-NAV}}', table[1]);
        
        return render_data; // Return the render_data

    } catch (error) {
        console.log("Error sending query\n");
        console.log(error);
        return 404 // Return empty string in case of error
    }
};

exports.send_laboratory_logs = async (req, res, start, filter_by, order_by, search=undefined) => {
    if (!req.session.userId) {
        console.log(req.session.userId);
        return res.sendStatus(401); 
    }

    try {
        const render_data = await this.get_laboratory_logs(req, start, filter_by, order_by, search);
        return res.send(render_data);
    } catch (error) {
        console.error('Error sending laboratory logs:', error);
        return res.sendStatus(500);
    }
}

exports.send_new_laboratory_log_template = (req, res, filled=null) => {
    const data = fs.readFileSync(path.join(public, "new_laboratory_log.hbs"), 'utf8');
    options = ``;
    render_data = ``;

    (async () => {
        try {
            // FOR OPTIONS
            const results = await database.query(`select instructor_id, instructor_name from instructors`);
            if (results <= 0) return;

            let type="", header="", laboratory_id="", laboratory_date="", laboratory_time_in="", laboratory_time_out="", options="",
                laboratory_remarks="", laboratory_last_update="", button_type="";

            // EDIT INFORMATION
            if (filled != null){ 
                options = `<option disabled>Select instructor</option>`   
                options += `<option selected value="${filled.instructor_id}">${filled.instructor_name}</option>`; 
                for (let i = 0; i < results.length; i++){
                    if (results[i]['instructor_name'] == filled.instructor_name) continue;
                    options += `<option value="${results[i]['instructor_id']}">${results[i]['instructor_name']}</option>`;
                };
                
                type = "Edit";
                button_type = "edit-laboratory-log";
                laboratory_id = filled.laboratory_report_id;
                laboratory_time_in = filled.laboratory_time_in;
                laboratory_time_out = filled.laboratory_time_out;
                laboratory_remarks = filled.laboratory_remarks;
                laboratory_date = date_formatter.convert_to_date(filled.laboratory_date);
                laboratory_last_update = date_formatter.convert_to_date_time(filled.laboratory_last_updated);
                header = `
                    <div class="col-md-8 d-flex justify-content-between mt-4">
                        <div class="col">
                            <p3 class="display-7"><b>Report ID:</b> 
                            <span class="bg-secondary bg-opacity-25 px-1">${filled.laboratory_report_id}</span> </p3>
                        </div>
                        <div class="col d-flex justify-content-end">
                            <p3 class="display-7">Last Version Saved: ${laboratory_last_update} </p3>
                        </div>
                    </div>
                    `;
            }
            // ADD NEW
            else {
                type = "Add new";
                button_type = "add-laboratory-log";

                options = `<option selected disabled>Select instructor</option>`    
                for (let i = 0; i < results.length; i++){
                    options += `<option value="${results[i]['instructor_id']}">${results[i]['instructor_name']}</option>`;
                };
            }

            const render_data = data
                                .replace(/{{TYPE}}/g, type)
                                .replace("{{HEADER}}", header)
                                .replace(`{{DATE}}`, laboratory_date)
                                .replace(`{{TIME_IN}}`, laboratory_time_in)
                                .replace(`{{TIME_OUT}}`, laboratory_time_out)
                                .replace(`{{OPTIONS}}`, options)
                                .replace(`{{REMARKS}}`, laboratory_remarks)
                                .replace(`{{BUTTON-TYPE}}`, button_type)
                                .replace(`{{REPORT-ID}}`, laboratory_id);
                                

            return res.send(render_data); // Send response inside the async function
        } 
        catch (error) {
            console.log("error sending query\n");
            console.log(error);
            return res.send(data); // Send response with default data in case of error
        } 
    })();
}

exports.add_new_laboratory_log = async (req, res) => {
    try{
        await database.query('call create_laboratory_log(?, ?, ?, ?, ?, ?, ?)', 
        [req.body.date, req.body['time-in'], req.body['time-out'], req.body.remarks, null, req.session.userId, req.body['instructor-id']]);
        const results = await database.query(`select CONCAT(cf.classification, "-", LAST_INSERT_ID()) as last_inserted_lab_log from laboratory_logs as ll
        LEFT JOIN classifications as cf ON ll.classification_id = cf.classification_id;`);

        const report_id = `${results[0].last_inserted_lab_log}`; // raw report ID
        const laboratory_log = await this.view_laboratory_log(report_id);
        return res.send(laboratory_log);
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
}

exports.view_laboratory_log = async (report_id) => { 
    try{
        const data = fs.readFileSync(path.join(public, "view_laboratory_log.hbs"), 'utf8');
        const results = await database.query(`call get_specific_laboratory_log("${report_id}")`);

        const render_data = data
            .replace('{{LAST-DATE}}',       date_formatter.convert_to_date_time(results[0][0].laboratory_last_updated))
            .replace(/{{REPORT-ID}}/g,      report_id)
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

exports.edit_laboratory_log = async (req, res, report_id) => { // post method
    try{
        await database.query("call edit_laboratory_log(?, ?, ?, ?, ?, ?)", 
            [report_id, req.body.date, req.body['time-out'], req.body['time-in'], req.body['instructor-id'], req.body.remarks]);

        const laboratory_log = await this.view_laboratory_log(report_id);
        return res.send(laboratory_log);
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
    // if edit is clicked we change the value on teh db
    // then call view
}

exports.send_edit_laboratory_log = async (req, res, report_id) => {
    try{
        const results = await database.query('call get_specific_laboratory_log_clinician(?)', [report_id]);
        return this.send_new_laboratory_log_template(req, res, results[0][0]);
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
}

exports.delete_laboratory_log = async (req, res, report_id) => {
    try{

        await database.query('call delete_laboratory_log(?)', [report_id]);
        const laboratory_logs = await this.get_laboratory_logs(req, 0, "laboratory_date", "desc");
        res.send(laboratory_logs);
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
}

// ===========================================================

// ================== PROCEDURE LOG FUNCTIONS ================


exports.get_procedure_logs =  async (req, table_index, filter_by, order_by, search=undefined, at=0) => {
    try{
        const data = fs.readFileSync(path.join(public, "procedure_logs.hbs"), 'utf8');
        const clinic_levels = await database.query(`select clinic_level_id, level from clinic_levels;`);
        const logs = await database.query(`select * from procedure_logs_view
                            where clinician_id = "${req.session.userId}" AND clinic_level = "${clinic_levels[at].level}"
                            ORDER BY CASE 
                                WHEN procedure_type IN ("Pediatric") THEN 0 
                                ELSE 1 
                                END,
                            procedure_type;`);

        console.log(logs);

        let table_data = ``;
        let clinic_level_nav = ``;
        let tag = ``;

        for (let i = 0; i < clinic_levels.length; i++){
            clinic_level_nav += `<input type="radio" class="btn-check" name="btnradio" onclick="insert_to_table('/clinician/procedure-logs/0/procedure_report_index/desc/${undefined}/${i}')" id="c-${clinic_levels[i].clinic_level_id}" autocomplete="off" ${i == at ? `checked` : ""}>
                                 <label class="btn rounded-0 border-bottom-0 px-4" for="c-${clinic_levels[i].clinic_level_id}">${clinic_levels[i].level}</label>`
        }
        
        let visited = new Set();
        let table_container = ``;
        let no = 1;

        for (let i = 0; i < logs.length; i++, no++){
            console.log(i + " " + logs.length);
            if (!visited.has(logs[i].procedure_type)){
                no = 1;
                visited.add(logs[i].procedure_type);
                if (i > 0)
                table_container += ` </tbody>
                                </table>
                            </div>`

                console.log(table_container);

                table_data += table_container;
                table_container = `<h4 class="display-7 custom">${logs[i].procedure_type}</h4>
                                    <div class="col mt-1 mb-3 table-responsive">
                                        <table class="table w-100 table-md table-bordered mt-3">
                                            <thead>
                                                <tr class="table-primary">
                                                <th scope="col">#</th>
                                                <th scope="col">Procedure Report ID</th>
                                                <th scope="col">Procedure Name</th>
                                                <th scope="col">Status</th>
                                                <th scope="col">Grade</th>
                                                <th scope="col" class="d-flex justify-content-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>`
            }

            table_container += `<tr">
                                <th >${no}</th>
                                <td >${logs[i].procedure_report_id}</td>
                                <td >${logs[i].procedure_name}</td>
                                <td >${"not yet taken"}</td>
                                <td >${logs[i].grade}</td>
                                <td class="d-flex justify-content-center">
                                    <button type="button" id="proced-edit" name="${logs[i].procedure_report_id}" class="action btn btn-light rounded-0 border me-2">
                                        <img src="./assets/icons/submit.svg" class="svg">
                                    </button>
                                    </div>
                                </td>
                                </tr>`
        }

        table_data += table_container + ` </tbody>
                                    </table>
                                </div>`


        const render_data = data
            .replace('{{CLINIC-LEVELS}}', clinic_level_nav)
            .replace('{{TAGS}}', tag)
            .replace('{{TABLE-DATA}}', table_data);

        return render_data;
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }

}

exports.send_procedure_logs = async (req, res, table_index, filter_by, order_by, search=undefined, at=0) => {
    if (!req.session.userId) {
        console.log(req.session.userId);
        return res.sendStatus(401); 
    }

    try{
        const render_data = await this.get_procedure_logs(req, table_index, filter_by, order_by, search, at);

        return res.send(render_data);
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
}

exports.edit_procedure_log_template = async (req, res, id) => {
    try{
        const data = fs.readFileSync(path.join(public, "edit_procedure_log.hbs"), 'utf8');
        const instructors_data = await database.query(`select instructor_id, instructor_name from instructors;`);
        const patients_data = await database.query(`select patient_index, patient_name from patients;`);

        let instructors = `<option selected disabled>Select instructor</option>`
        for (let i = 0; i < instructors_data.length; i++){
            instructors += `<option value="${instructors_data[i]['instructor_id']}">${instructors_data[i]['instructor_name']}</option>`;
        };

        let patients = `<option selected disabled>Select patient</option>`
        for (let i = 0; i < patients_data.length; i++){
            patients += `<option value="${patients_data[i]['patient_index']}">${patients_data[i]['patient_name']}</option>`;
        };

        const render_data = data.replace(`{{PROCEDURE-INDEX}}`, parseInt(id.substring(5)))
                                .replace(`{{PROCEDURE-ID}}`, id)
                                .replace(`{{INSTRUCTORS}}`, instructors)
                                .replace(`{{PATIENTS}}`, patients);
        res.send(render_data);
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
}

exports.edit_procedure_log = async (req, res, id) => {
    try{
        console.log(req.body);
        await database.query("call edit_procedure_log(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [parseInt(id), req.body['procedure-date'], parseInt(req.body['room-number']), parseInt(req.body['chair-number']), req.body['time-start'], req.body['time-completion'], parseInt(req.body['tooth-number']), req.body['chief-complaint'], req.body['history-of-present-illness'],
        req.body['blood-pressure'], req.body['pulse-rate'], req.body['respiratory-rate'], parseInt(req.body.temperature), req.body['instructor-name'], req.body['patient-index']]);
        
        res.send(this.view_procedure_log(id));
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
}

exports.view_procedure_log = (report_id) => {
    const data = fs.readFileSync(path.join(public, "view_procedure_log.hbs"), 'utf8');
    return data;
} 

// ===========================================================

// ===================== PATIENT FUNCTIONS ===================
exports.get_patient_table_data = async (clinician_id, table_index, filter_by, order_by, search=undefined, editable=true) => {
    try{
        let table_data = ``;
        let search_condition = ``;
        let table_nav = ``;
        let search_route = ``;

        if (search != undefined){
            search_route = `/${search}`;
            search_condition = `WHERE pv.patient_id = "${search}" OR pv.patient_name = "${search}"
            OR pv.most_recent_procedure = "${search}" OR pv.instructor_name = "${search}"`
        };

        const QUERY = `
            select pv.patient_id, pv.patient_name, pv.patient_admission_date, cl.procedure_report_id as most_recent_procedure,
            cl.instructor_name, pv.patient_last_updated from
            (select *  from procedure_logs_view as pl
            where 
                pl.clinician_id = "${clinician_id}") as cl
            left join
                patients_view as pv
            on 
                cl.patient_id = pv.patient_index
        `;
        const results = await database.query(`${QUERY}  ${search_condition}
                                                order by pv.${filter_by} ${order_by} limit ${table_index*max}, ${max};`);

                                    console.log(results);
        if (results.length > 0){
            for (let i = 0; i < results.length; i++) {
                if (results[i].patient_id == null) break;

                table_data += 
                `
                    <tr>
                        <th scope="row">${(table_index*max) + i + 1}</th>
                        <td>${results[i].patient_id}</td> 
                        <td>${results[i].patient_name}</td>
                        <td>${date_formatter.convert_to_date(results[i].patient_admission_date)}</td>
                        <td>${results[i].most_recent_procedure}</td>
                        <td>${results[i].instructor_name}</td>
                        <td>${date_formatter.convert_to_date_time(results[i].patient_last_updated)}</td>
                        <td>
                            <div class="col d-flex justify-content-center align-items-center">
                                <button type="button" id="pat-view"  name="${results[i].patient_id}" class="action btn btn-light rounded-0 border me-2">
                                    <img src="./assets/icons/view.svg" class="svg">
                                </button>
                                <button type="button" id="pat-edit" name="${results[i].patient_id}" class="action btn btn-light rounded-0 border me-2">
                                    <img src="./assets/icons/submit.svg" class="svg">
                                </button>
                                <button type="button" id="pat-ask-delete" name="${results[i].patient_id}" class="action btn btn-light rounded-0 border">
                                    <img src="./assets/icons/delete.svg" class="svg">
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

        return [table_data, table_nav];
    }
    catch (error) {
        console.log("Error sending query\n");
        console.log(error);
        return 404 // Return empty string in case of error
    }
}

exports.get_patient_chart = async (req, table_index, filter_by, order_by, search=undefined) => {
    const data = fs.readFileSync(path.join(public, "patient_chart.hbs"), 'utf8');
    let last_query_date = ``;
    let table_data = ``;
    let search_route = ``;

    try {
        const table = await this.get_patient_table_data(req.session.userId, table_index, filter_by, order_by, search, true)

        const render_data = data
            .replace('{{LAST-DATE}}', last_query_date)
            .replace('{{TABLE-DATA}}', table[0])
            .replace('{{SEARCH-BUTTON}}', `/clinician/patient-chart/0/${filter_by}/${order_by}`)
            .replace(/{{SEARCH}}/g, search_route)
            .replace('{{EMPTY-TAG}}', () => {
                if (!table[0]) {
                    return `<div class="col d-flex justify-content-center align-items-center">
                                <h6 class="w-100 alert alert-light mt-4  d-flex justify-content-center" role"alert">No patients to show...</h6>
                            </div>`;
                } else return "";
            })
            .replace('{{TABLE-NAV}}', table[1]);
        
        return render_data;
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
}

exports.send_patient_chart = async (req, res, table_index, filter_by, order_by, search=undefined) => {
    console.log(search);
    if (!req.session.userId) {
        console.log(req.session.userId);
        return res.sendStatus(401); 
    }

    try{
        const patient_chart = await this.get_patient_chart(req, table_index, filter_by, order_by, search);
        return res.send(patient_chart);
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
}

exports.send_new_patient_template = async (req, res) => {
    try {
        const render_data = await fs.readFileSync(path.join(public, "new_patient.hbs"), 'utf8');
        return res.send(render_data);
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
    
}

exports.add_new_patient = async (req, res) => {
     try{
        await database.query(`call dentistry_db.create_patient('${req.body.first_name}', '${req.body.middle_name}', '${req.body.last_name}', '${req.body.preferred_name}', 
                            '${req.body.date_of_birth}', ${req.body.age}, '${req.body.sex}', ${req.body.weight}, ${req.body.height}, '${req.body.occupation}', '${req.body.religion}', '${req.body.marital_status}', ${req.body.number_of_children}, 
                            '${req.body.cellphone_number}', '${req.body.email}', '${req.body.province}', '${req.body.city_municipality}', '${req.body.house_number_st}', '${req.body.barangay}', '${req.body.postal_code}');
        `);

        const results = await database.query(`select CONCAT(cf.classification, "-", LAST_INSERT_ID()) as last_inserted_patient from patients as p
        LEFT JOIN classifications as cf ON p.classification_id = cf.classification_id;`);

        const report_id = `${results[0].last_inserted_patient}`; // raw report ID
        const procedure_log = await this.view_patient_chart(report_id, true);
        return res.send(procedure_log);
     }
     catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
}

exports.view_patient_chart = async (report_id, readonly=true) => {
    try{
        const data = fs.readFileSync(path.join(public, "view_patient_chart.hbs"), 'utf8');
        const response = await database.query('call get_specific_patient_chart(?)', [report_id]);
        const results = response[0][0];
        
        let edit_button = ``, readonly_tag = ``, border = ``;
        if (readonly){
            edit_button = `<button id="pat-edit" name=${results.patient_id} type="button" class="btn btn-success rounded-0">
                                Edit information
                            </button>`;
            readonly_tag = 'readonly';
            border = `border-0`
        }
        else{
            edit_button = `<button id="pat-save-changes" name=${results.patient_id} type="button" class="btn btn-danger rounded-0">
                                Save Changes
                            </button>`;
            border = `border-1`
        }

        const render_data = data
            .replace('{{EDIT-BUTTON}}', edit_button)
            .replace(/{{READONLY}}/g, readonly_tag)
            .replace(/{{BORDER}}/g, border)
            .replace('{{LAST-DATE}}',       date_formatter.convert_to_date_time(results.patient_last_updated))
            .replace(/{{PATIENT-NAME}}/g,            results.patient_name)
            .replace('{{PATIENT-ID}}',         results.patient_id)
            .replace('{{ADMISSION-DATE}}', `value = "${date_formatter.convert_to_date(results.patient_admission_date)}"`)
            .replace('{{PATIENT-SEX}}',  `value = "${results.patient_sex}"`)
            .replace('{{CONTACT-NUMBER}}', `value = "${results.patient_phone_number}"`)
            .replace('{{E-MAIL}}',  `value = "${results.patient_email}"`)
            .replace('{{MOST-RECENT-PROCEDURE}}',  `value = "${results.most_recent_procedure}"`)
            .replace(`{{LAST-NAME}}`, `value = "${results.patient_last_name}"`)
            .replace(`{{WEIGHT}}`, `value = "${results.patient_weight_kg}"`)
            .replace(`{{MIDDLE-NAME}}`, `value = "${results.patient_middle_name}"`)
            .replace(`{{HEIGHT}}`, `value = "${results.patient_height_cm}"`)
            .replace(`{{FIRST-NAME}}`, `value = "${results.patient_first_name}"`)
            .replace(`{{OCCUPATION}}`, `value = "${results.patient_occupation}"`)
            .replace(`{{PREFERRED-NAME}}`, `value = "${results.patient_preffered_name}"`)
            .replace(`{{RELIGION}}`, `value = "${results.patient_religion}"`)
            .replace(`{{DATE-OF-BIRTH}}`, `value = "${date_formatter.convert_to_date(results.patient_birthdate)}"`)
            .replace(`{{MARITAL-STATUS}}`, `value = "${results.patient_marital_status}"`)
            .replace(`{{AGE}}`, `value = "${results.patient_age}"`)
            .replace(`{{NUMBER-OF-CHILDREN}}`, `value = "${results.patient_number_of_children}"`)
            .replace(`{{PROVINCE}}`, `value = "${results.patient_province}"`)
            .replace(`{{BARANGAY}}`, `value = "${results.patient_barangay}"`)
            .replace(`{{CITY-MUNICIPALITY}}`, `value = "${results.patient_city}"`)
            .replace(`{{POSTAL-CODE}}`, `value = "${results.patient_postal_code}"`)
            .replace(`{{HOUSE-NUMBER}}`, `value = ${results.patient_house_street}`)
            
        return render_data;
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return 404; // Send response with default data in case of error
    };
}

exports.send_view_patient_chart = async (req, res, report_id, readonly) => {
    try{
        const patient_chart = await this.view_patient_chart(report_id, readonly);
        return res.send(patient_chart);
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
}

exports.edit_patient_chart = async (req, res, report_id) => {
    try{
        console.log(req.body);
        await database.query(`call edit_patient_chart('${report_id}', '${req.body.first_name}', '${req.body.middle_name}', '${req.body.last_name}', '${req.body.preferred_name}', 
                            '${req.body.date_of_birth}', ${req.body.age}, '${req.body.sex}', ${req.body.weight}, ${req.body.height}, '${req.body.occupation}', '${req.body.religion}', '${req.body.marital_status}', ${req.body.number_of_children}, 
                            '${req.body.cellphone_number}', '${req.body.email}', '${req.body.province}', '${req.body.city_municipality}', '${req.body.house_number_st}', '${req.body.barangay}', '${req.body.postal_code}');
        `);
        
        const procedure_log = await this.view_patient_chart(report_id, true);
        return res.send(procedure_log);
     }
     catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
}

exports.delete_patient_chart =  async (req, res, report_id) => {
    try{
        await database.query('call delete_patient_chart(?)', [report_id]);
        const patient_chart = await this.get_patient_chart(req, 0, "patient_admission_date", "desc");
        res.send(patient_chart);
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
}

// ===========================================================

exports.get_grades = async (req) => {
    try{
        const data = fs.readFileSync(path.join(public, "grades.hbs"), 'utf8');
        const grades = await database.query("select * from grades_view;");
        
        const render_data = data
                    .replace(`{{0}}`, grades[0].grade)
                    .replace(`{{1}}`, grades[1].grade)
                    .replace(`{{2}}`, grades[2].grade)
                    .replace(`{{3}}`, grades[3].grade)
                    .replace(`{{4}}`, grades[4].grade)
                    .replace(`{{5}}`, grades[5].grade)
                    .replace(`{{6}}`, grades[6].grade)
                    .replace(`{{7}}`, grades[7].grade)   

        return render_data;
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
}

exports.send_grades = async (req, res) => {
    if (!req.session.userId) {
        console.log(req.session.userId);
        return res.sendStatus(401); 
    }
    try{
        const render_data = await this.get_grades(req);
        return res.send(render_data);
    }
    catch (error) {
        console.log("error sending query\n");
        console.log(error);
        return res.send(404); 
    }
    
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
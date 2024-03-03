const fs = require('fs');
const path = require('path');
const database = require('../db');
const public = path.join(__dirname, 'templates', 'instructor');
const date_formatter = require('./date_format');
const max = 5;

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
        console.log(last_query_date)

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
                table_nav += `<button type="button" id="lab-table-nav" name="${table_index + 1}/${filter_by}/${order_by}/${date}${search_route} class="action btn btn-light rounded-0 border">
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
            search_condition = `AND clinician_name = "${search}" OR clinician_id = "${search}" OR clinic_level_enrolled = "${search}"`
        };
        
        const QUERY = `
                select c.clinician_name, c.clinician_id, c.clinic_level_enrolled from clinicians_view as c
                LEFT JOIN 
                    (select * from laboratory_logs_view 
                WHERE 
                    instructor_id = "${req.session.userId}") as i
                ON 
                    c.clinician_id = i.clinician_id
                UNION
                select c.clinician_name, c.clinician_id, c.clinic_level_enrolled from clinicians_view as c
                LEFT JOIN 
                    (select * from procedure_logs_view 
                WHERE 
                    instructor_id = "${req.session.userId}") as p
                ON 
                    c.clinician_id = p.clinician_id
        `

        const results = await database.query(`${QUERY} ${search_condition} order by ${filter_by} ${order_by} limit ${table_index*max}, ${max};`);
                                           
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
                            <button type="button" id="clinician-view" name="${results[i].clinician_id}" class="action btn btn-light rounded-0 border me-2">
                                <img src="./assets/icons/view.svg" class="svg">
                            </button>
                        </div>
                    </td>
                </tr>
            `; 
        }

        // construct table nav
        const size = await database.query(`SELECT COUNT(*) as size FROM (${QUERY} ${search_condition}) as c;`);
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
            .replace('{{SEARCH-BUTTON}}', `/instructor/clincians/0/${filter_by}/${order_by}/`)
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
        const render_data = await this.get_clinicians(req, table_index, filter_by, order_by, search=undefined);
        return res.send(render_data);
    } catch (error) {
        console.error('Error sending laboratory logs:', error);
        return res.sendStatus(500);
    }
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
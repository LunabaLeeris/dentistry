const database = require("../../db");
const clinician_controller = require("./clinician");
const instructor_controller = require("./instructor");

exports.login = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user_type = (req.body.user_type).toLowerCase();

    if (!database.test_connection()){
        return res.send(404)
    }

    (async () => {
        try {
            const results = await database.query(`SELECT * FROM ${user_type}s_view WHERE 
                                                 ${user_type}_email = ? AND password = ?`, [email, password]);
            
            if (results <= 0){
                return res.render("login-page", {
                    login_error_message: "incorrect email or password"
                });
            }

            // creates a unique session id for the use using user's id
            req.session.userId = results[0][`${user_type}_id`];
            console.log(req.session.userId);
    
            switch (user_type){
                case "clinician": return this.display_clinician(req, res, results[0]);
                case "admin": return this.display_admin(req, res, results[0]);
                case "instructor": return this.display_instructor(req, res, results[0]);
                default: return console.log("udefined user type");
            }
        } 
        catch (error) {
            console.log("error sending query\n");
            console.log(error);
            return res.send(404); // Send response with default data in case of error
        } 
    })();   
};

exports.display_clinician = async (req, res, data) => {
    try{
        const laboratory_logs = await clinician_controller.get_laboratory_logs(req, 0, "laboratory_last_updated", "desc", undefined);
        return res.render("clinician", {
            clinician_name                   : data[`clinician_name`],
            id_number                        : data[`clinician_id`],
            email_address                    : data[`clinician_email`],
            clinic_level_enrolled            : data[`clinic_level_enrolled`],
            render_laboratory_logs_clinician : laboratory_logs
        });
    }
    catch{
        console.log("Error sending query\n");
        console.log(error);
        return res.send("error parsing lab logs");
    }
}

exports.display_admin = (req, res, data) => {
    
}

exports.display_instructor = async (req, res, data) => {
    try{
        const laboratory_logs = await instructor_controller.get_laboratory_logs(req, 0, "laboratory_last_updated", "desc", "current_date", undefined);
        return res.render("instructor", {
            instructor_name                   : data[`instructor_name`],
            id_number                         : data[`instructor_id`],
            email_address                     : data[`instructor_email`],
            render_laboratory_logs_instructor : laboratory_logs});
    }
    catch{
        console.log("Error sending query\n");
        console.log(error);
        return res.send("error parsing lab logs");
    }
}
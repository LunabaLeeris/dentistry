const database = require("../db");
const clinician_controller = require("./clinician");
const instructor_controller = require("./instructor");

exports.login = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user_type = (req.body.user_type).toLowerCase();

    database.db.query(`SELECT id FROM login_info_${user_type} WHERE email = ? AND password = ?`, [email, password], (error, results) => {
        if (error){
            console.log("error sending query\n");
            console.log(error);
            return;
        }
        
        if (results <= 0){
            return res.render("login-page", {
                login_error_message: "incorrect email or password"
            });
        }
        // creates a unique session id for the use using user's id
        req.session.userId = results[0].id;

        switch (user_type){
            case "clinician": return this.display_clinician(req, res);
            case "admin": return this.display_admin(req, res);
            case "instructor": return this.display_instructor(req, res);
            default: return console.log("udefined user type");
        }
    });    
};

exports.display_clinician = (req, res) => {
    const laboratory_logs = clinician_controller.get_laboratory_logs(req);
    return res.render("clinician", {render_laboratory_logs_clinician: laboratory_logs});
}

exports.display_admin = (req, res, id) => {
    
}

exports.display_instructor = (req, res, id) => {
    const laboratory_logs = instructor_controller.get_laboratory_logs(req);
    return res.render("instructor", {render_laboratory_logs_instructor: laboratory_logs});
}
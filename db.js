const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config({path: './config.env'});

const db_data = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_LOGIN_INFO
}
// Connects to the mysql database
const db = mysql.createConnection(db_data);

function test_connection(){
    db.connect((err) => {
        if (err){
            console.log("unable to connect to db")
            console.log(err);
        }
        else console.log("connection to database successful");
    })
}

module.exports = {db_data, db, test_connection};
const mysql = require("mysql2");
const dotenv = require("dotenv");
const util = require("util");

dotenv.config({path: './config.env'});

const db_data = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
}
// Connects to the mysql database
const db = mysql.createConnection(db_data);
const query = util.promisify(db.query).bind(db);

function test_connection(){
    return db.connect((err) => {
        if (err){
            console.log("unable to connect to db")
            console.log(err);
            return false;
        }
        else {
            console.log("connection to database successful")
            return true;
        }
    })
}

module.exports = {db_data, db,query,test_connection};
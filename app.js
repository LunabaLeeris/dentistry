const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({path: './config.env'});
const clinician = require("./routes/clinician-page");
const instructor = require("./routes/instructor-page");
const login =  require("./routes/login-page");

// stages the database
const database = require("./db.js");
database.test_connection();

// starts the app
const app = express();
// specifies that express should use this file for the static views (css, jscript)
const public_directory = path.join(__dirname, "./public");
app.use(express.static(public_directory));
// specify which viewing engine to  use
app.set('view engine', 'hbs'); 
// uses a url decoder to read POSTS
app.use(express.urlencoded({extended: false}));
// makes posts in json format
app.use(express.json());

// stages session store
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const uuid = require('uuid');

const sessionStore = new MySQLStore(database.db_data);

app.use(session({
    genid: () => uuid.v4(),
    store: sessionStore,
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
}));

// open routes
app.use('/clinician', clinician);
app.use('/instructor', instructor);
app.use('/', login);

// starts web
app.listen(process.env.WEB_PORT, () => {
    console.log("listening properly at port " + process.env.WEB_PORT);
});

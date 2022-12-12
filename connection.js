const mysql = require("mysql2")
require('dotenv').config();

const con = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    port: process.env.PORT
});

con.connect((err) => {
    if(err){
        console.log(process.env.HOST);
        throw err;}
    console.log("Connection created");
})

// connect()
module.exports.con = con;
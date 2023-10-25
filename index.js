const express = require("express");
const mysql = require("mysql");
const app = express();
const pool = require("./dbPool");
const fetch = import("node-fetch");
const session = require('express-session');
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");
app.use(express.static("public"));
//line below allows express to parse values sent in form
app.use(express.urlencoded({ extended: true }));

//routes
app.get('/', (req, res) => {
    res.render('index');
});//welcome

app.get('/about', (req, res) => {
    res.render('about');
});//about

app.get('/portfolio', (req, res) => {
    res.render('portfolio');
});//portfolio

app.get('/contact', (req, res) => {
    res.render('contact');
});//contact

app.get("/dbTest", async function(req, res) {
    let sql = "SELECT CURDATE()";
    let rows = await executeSQL(sql);
    res.send(rows);
});//dbTest

//functions
async function executeSQL(sql, params) {
    return new Promise(function(resolve, reject) {
        pool.query(sql, params, function(err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
}//executeSQL

//start server
app.listen(3000, () => {
    console.log("Expresss server running...")
})
const express = require("express");
const mysql = require("mysql");
const fileUpload = require('express-fileupload');
const app = express();
const pool = require("./dbPool");
const fetch = import("node-fetch");
const session = require("express-session");
const bcrypt = require("bcrypt");
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
//line below allows express to parse values sent in form
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

//routes
app.get("/", (req, res) => {
    let page = "index";
    res.render("index", { "page_name": page });
}); //welcome

app.get("/about", (req, res) => {
    let page = "about";
    res.render("about", { "page_name": page });
}); //about

app.get("/portfolio", (req, res) => {
    let page = "portfolio";
    res.render("portfolio", { "page_name": page });
}); //portfolio

app.get("/contact", (req, res) => {
    let page = "contact";
    res.render("contact", { "page_name": page });
}); //contact

app.get("/upload", (req, res) => {
    let page = "upload";
    res.render("upload", { "page_name": page });
}); //upload

app.get("/dbTest", async function(req, res) {
    let sql = "SELECT CURDATE()";
    let rows = await executeSQL(sql);
    res.send(rows);
}); //dbTest

app.post('/upload', (req, res) => {
    // Get the file that was set to our field named "image"
    const { image } = req.files;

    // If no image submitted, exit
    if (!image) return res.sendStatus(400);

    // Move the uploaded image to our upload folder
    image.mv(__dirname + '/upload/' + image.name);

    res.sendStatus(200);
});

//functions
async function executeSQL(sql, params) {
    return new Promise(function(resolve, reject) {
        pool.query(sql, params, function(err, rows, fields) {
            if (err) throw err;
            resolve(rows);
        });
    });
} //executeSQL

//start server
app.listen(3000, () => {
    console.log("Expresss server running...");
});
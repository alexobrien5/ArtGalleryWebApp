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
  res.render("index");
}); //welcome

app.get("/about", (req, res) => {
  res.render("about");
}); //about

app.get("/portfolio", (req, res) => {
  res.render("portfolio");
}); //portfolio

app.get("/contact", (req, res) => {
  res.render("contact");
}); //contact

app.get("/upload", (req, res) => {
  res.render("upload");
}); //upload

app.get("/dbTest", async function (req, res) {
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
  return new Promise(function (resolve, reject) {
    pool.query(sql, params, function (err, rows, fields) {
      if (err) throw err;
      resolve(rows);
    });
  });
} //executeSQL

//start server
app.listen(3000, () => {
  console.log("Expresss server running...");
});
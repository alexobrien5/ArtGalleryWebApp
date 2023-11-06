const express = require("express");
const mysql = require("mysql");
const fileUpload = require('express-fileupload');
const app = express();
const pool = require("./dbPool");
import("node-fetch");
const session = require("express-session");
const bcrypt = require("bcrypt");
const MySQLStore = require('express-mysql-session')(session);
require("dotenv").config();
const nodeMail = require("nodemailer");
const path = require("path");
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
//line below allows express to parse values sent in form
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

//session middleware
const options = {
    host: "jbb8y3dri1ywovy2.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    port: 3306,
    user: "esw0kpysmpx33bhd",
    password: "aed3qdstdccar8oy",
    database: "xv1krnv2gox84c7m",
}

const sessionStore = new MySQLStore(options);

app.use(session({
    secret: "top secret!",
    resave: true,
    saveUnitialized: true,
    store: sessionStore,
}));

//local api for username
app.get('/api/users/:username', async function(req, res) {
    let username = req.params.username;
    let sql = `SELECT *
                FROM credentials
                WHERE username = ?`;
    let rows = await executeSQL(sql, [username]);
    res.send(rows);
});

//routes
app.get("/", (req, res) => {
    let user = req.session.user;
    let page = "index";
    res.render("index", { "page_name": page, "userID": user });
}); //welcome

app.get("/about", (req, res) => {
    let user = req.session.user;
    let page = "about";
    res.render("about", { "page_name": page, "userID": user });
}); //about

app.get("/portfolio", (req, res) => {
    let user = req.session.user;
    let page = "portfolio";
    res.render("portfolio", { "page_name": page, "userID": user });
}); //portfolio

app.get("/contact", (req, res) => {
    let user = req.session.user;
    let page = "contact";
    res.render("contact", { "page_name": page, "userID": user });
}); //contact

app.get("/upload", isAuthenticated, (req, res) => {
    let user = req.session.user;
    let page = "upload";
    res.render("upload", { "page_name": page, "userID": user });
}); //upload

app.get("/dbTest", async function(req, res) {
    let sql = "SELECT CURDATE()";
    let rows = await executeSQL(sql);
    res.send(rows);
}); //dbTest

app.get("/login", (req, res) => {
    res.render("login");
});//login

app.post("/login", async (req, res) => {
    let page = "index";
    let username = req.body.username;
    let password = req.body.password;
    let hashedPwd = "";
    let user = "";
    let url = `https://artgallerywebapp.alexobrien5.repl.co/api/users/${username}`;
    let response = await fetch(url);
    let data = await response.json();

    // if username matches value in database, hashed pwd variable initialized
    if (!(typeof data[0] == "undefined")) {
        hashedPwd = data[0].password;
    }

    let passwordMatch = await bcrypt.compare(password, hashedPwd);

    console.log(passwordMatch);

    if (passwordMatch) {
        //initialized session variable if password matched
        req.session.authenticated = true;
        user = username;
        req.session.user = user;
        res.render("index", { "page_name": page, "userID": user });
    } else {
        res.render("login", { "loginError": true, "page_name": page });
    }
});

app.get('/logout', isAuthenticated, (req, res) => {
    req.session.destroy();
    res.redirect("/");
})

app.post('/upload', (req, res) => {
    // Get the file that was set to our field named "image"
    const { image } = req.files;

    // If no image submitted, exit
    if (!image) return res.sendStatus(400);

    // Move the uploaded image to our upload folder
    image.mv(__dirname + '/upload/' + image.name);

    res.sendStatus(200);
});

app.post("/contact", async (req, res) => {
    let page = "contact";
    let user = req.session.user;
    const { name, email, subject, message } = req.body;
    try {
        mainMail(name, email, subject, message);
        res.render("contact", { "mailError": false, "page_name": page, "userID": user });
    } catch (error) {
        res.render("contact", { "loginError": true, "page_name": page, "userID": user });
    }
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

function isAuthenticated(req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/');
    } else {
        next();
    }
} //isAuthenticated

async function mainMail(name, email, subject, message) {
    const transporter = nodeMail.createTransport({
        service: "gmail",
        auth: {
            user: 'dohnemusart@gmail.com',    //receipient's email 
            pass: 'dyvk kqhj iwyk cbzp',         //receipient's generated password
        },
    });
    const mailOption = {
        from: email,
        to: 'alobrien@csumb.edu',         //receipient's email
        subject: subject,
        html: `You got a message from ${name}! <br><br>
    Email : ${email} <br>
    Message: ${message}`,
    };
    try {
        await transporter.sendMail(mailOption);
        return Promise.resolve("Message Sent Successfully!");
    } catch (error) {
        return Promise.reject(error);
    }
} //end of mainMail function


//start server
app.listen(3000, () => {
    console.log("Expresss server running...");
});
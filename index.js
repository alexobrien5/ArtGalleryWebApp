const express = require("express");
const router = express.Router();
const sharp = require("sharp");
const fileUpload = require("express-fileupload");
const app = express();
const pool = require("./dbPool");
import("node-fetch");
const session = require("express-session");
const bcrypt = require("bcrypt");
const MySQLStore = require("express-mysql-session")(session);
require("dotenv").config();
const nodeMail = require("nodemailer");
const path = require("path");
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
//line below allows express to parse values sent in form
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.json());

//session middleware
const options = {
  host: "jbb8y3dri1ywovy2.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  port: 3306,
  user: "esw0kpysmpx33bhd",
  password: "aed3qdstdccar8oy",
  database: "xv1krnv2gox84c7m",
};

const sessionStore = new MySQLStore(options);

app.use(
  session({
    secret: "top secret!",
    resave: true,
    saveUnitialized: true,
    store: sessionStore,
  })
);

//local api for username
app.get("/api/users/:username", async function (req, res) {
  let username = req.params.username;
  let sql = `SELECT *
                FROM credentials
                WHERE username = ?`;
  let rows = await executeSQL(sql, [username]);
  res.send(rows);
});

// Serve static files (images)
app.use("/upload", express.static(path.join(__dirname, "upload")));

/* -----------------------------------
            GET ROUTES
----------------------------------- */
app.get("/", (req, res) => {
  let user = req.session.user;
  let page = "index";
  res.render("index", { page_name: page, userID: user });
}); //welcome

app.get("/about", (req, res) => {
  let user = req.session.user;
  let page = "about";
  res.render("about", { page_name: page, userID: user });
}); //about

app.get("/portfolio", async (req, res) => {
  let user = req.session.user;
  let page = "portfolio";
  let sql1 = `SELECT * FROM painting WHERE classification = 'figurative' ORDER BY display_order`;
  let rows1 = await executeSQL(sql1);

  let sql2 = `SELECT * FROM painting WHERE classification = 'scapes' ORDER BY display_order`;
  let rows2 = await executeSQL(sql2);

  let sql3 = `SELECT * FROM painting WHERE classification = 'still' ORDER BY display_order`;
  let rows3 = await executeSQL(sql3);

  let sql4 = `SELECT * FROM painting WHERE classification = 'other' ORDER BY display_order`;
  let rows4 = await executeSQL(sql4);

  res.render("portfolio", {
    page_name: page,
    userID: user,
    figurative: rows1,
    scapes: rows2,
    still: rows3,
    other: rows4,
  });
}); //portfolio

app.get("/contact", (req, res) => {
  let user = req.session.user;
  let page = "contact";
  res.render("contact", { page_name: page, userID: user });
}); //contact

app.get("/upload", (req, res) => {
  let user = req.session.user;
  let page = "upload";
  res.render("upload", { page_name: page, userID: user });
}); //upload

app.get("/paintings", async (req, res) => {
  let user = req.session.user;
  let page = "manage";
  let paintings = await executeSQL(
    `SELECT * FROM painting ORDER BY FIELD(classification, 'Figurative', 'Scapes', 'Still', 'Other'), display_order`
  );
  res.render("paintings", { paintings, page_name: page, userID: user });
}); //paintings

app.get("/login", (req, res) => {
  res.render("login");
}); //login

app.get("/logout", isAuthenticated, (req, res) => {
  req.session.destroy();
  res.redirect("/");
}); //logout

app.get("/unauthorized", (req, res) => {
  res.render("unauthorized");
}); //unauthorized

app.get("/dbTest", async function (req, res) {
  let sql = "SELECT CURDATE()";
  let rows = await executeSQL(sql);
  res.send(rows);
}); //dbTest

/* -----------------------------------
            POST ROUTES
----------------------------------- */
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

  // console.log(passwordMatch);

  if (passwordMatch) {
    //initialized session variable if password matched
    req.session.authenticated = true;
    user = username;
    req.session.user = user;
    res.render("index", { page_name: page, userID: user });
  } else {
    res.render("login", { loginError: true, page_name: page });
  }
}); //login

app.post("/upload", async function (req, res) {
  // Get the file that was set to our field named "image"
  const { image } = req.files;

  let user = req.session.user;
  let page = "upload";

  //Backend data declarations
  let name = req.body.name;
  let dimensions = req.body.dimensions;
  let classification = req.body.classification;
  let type = req.body.type;
  let location = req.body.location;
  let available = req.body.available;

  // temp values until the image file type is checked, required for not null values
  let img_path = "temp";
  let thm_path = "temp";

  //SQL Insert
  let sql =
    "INSERT INTO painting (name, dimensions, classification, media_type, location, availability, img_path, thm_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
  let params = [
    name,
    dimensions,
    classification,
    type,
    location,
    available,
    img_path,
    thm_path,
  ];
  await executeSQL(sql, params);

  // If no image submitted, exit
  if (!image) {
    return res.sendStatus(400);
  }

  // If does not have image mime type prevent from uploading
  if (!/^image/.test(image.mimetype)) {
    console.log("not image");
    return res.sendStatus(400);
  }

  //  var currentMime = image.mimetype.split("/").pop();
  //console.log(image.mimetype);

  //SQL Select
  let sql2 = "SELECT id FROM painting ORDER BY id DESC limit 1";
  let rows2 = await executeSQL(sql2);
  let paintingId = rows2[0].id;

  // Move the uploaded image to our upload folder
  // add logic for choosing file type based on the image.name.
  // psuedocode
  // read last 3 digits of image file uploaded
  // based on that, if/then statements for creating the imgPath and thmPath paths
  var imgFileUpload = image.name.split(".").pop();
  if (imgFileUpload == "jpg" || imgFileUpload == "jpeg") {
    img_path = __dirname + "/upload/img" + paintingId + ".jpg";
    thm_path = __dirname + "/upload/thm" + paintingId + ".jpg";
    img_short_path = "/upload/img" + paintingId + ".jpg";
    thm_short_path = "/upload/thm" + paintingId + ".jpg";
  } else if (imgFileUpload == "png") {
    img_path = __dirname + "/upload/img" + paintingId + ".png";
    thm_path = __dirname + "/upload/thm" + paintingId + ".png";
    img_short_path = "/upload/img" + paintingId + ".png";
    thm_short_path = "/upload/thm" + paintingId + ".png";
  }

  //SQL Update for filenames
  let sql3 = "UPDATE painting SET img_path = ?, thm_path = ? WHERE id = ?";
  let params3 = [img_short_path, thm_short_path, paintingId];
  await executeSQL(sql3, params3);

  //SQL Select to find next display_order number and update record
  let sql4 =
    "SELECT display_order FROM painting WHERE classification = ? ORDER BY display_order DESC limit 1";
  let rows4 = await executeSQL(sql4, [classification]);
  // if first painting in classification, set display_order to 1
  if (rows4[0].display_order == 0) {
    let sql5 = "UPDATE painting SET display_order = 1 WHERE classification = ?";
    let params5 = [classification];
    await executeSQL(sql5, params5);
  } else {
    let orderNum = rows4[0].display_order + 1;
    let sql5 = "UPDATE painting SET display_order = ? WHERE id = ?";
    let params5 = [orderNum, paintingId];
    await executeSQL(sql5, params5);
  }

  //use async/await with image.mv
  try {
    await image.mv(img_path);
    // console.log(img_path);
  } catch (err) {
    // console.error(err);
    return res.sendStatus(500); // handle error
  }

  // Use sharp to generate thumbnail
  try {
    sharp(img_path)
      .resize(500, 500)
      .withMetadata()
      .toFile(thm_path, (err, resizeImage) => {
        if (err) {
          //console.log(err);
        } else {
          // console.log(resizeImage);
        }
      });
  } catch (error) {
    console.error(error);
  }

  res.render("upload", { uploadError: false, page_name: page, userID: user });
}); //upload

app.post("/contact", async (req, res) => {
  let page = "contact";
  let user = req.session.user;
  const { name, email, subject, message } = req.body;
  try {
    mainMail(name, email, subject, message);
    res.render("contact", { mailError: false, page_name: page, userID: user });
  } catch (error) {
    res.render("contact", { mailError: true, page_name: page, userID: user });
  }
}); //contact

app.post("/paintings/update/:id", async (req, res) => {
  const {
    name,
    dimensions,
    classification,
    media_type,
    location,
    availability,
  } = req.body;
  const id = req.params.id;

  // Fetch the current order and classification of the target painting
  const targetPainting = await executeSQL(
    "SELECT display_order, classification FROM painting WHERE id = ?",
    [id]
  );

  if (!targetPainting || targetPainting.length === 0) {
    return res.status(404).send("Painting not found");
  }

  const targetOrder = targetPainting[0].display_order;
  const targetClassification = targetPainting[0].classification;

  // Update the classification of the target painting
  await executeSQL(
    "UPDATE painting SET name=?, dimensions=?, classification=?, media_type=?, location=?, availability=?, display_order=? WHERE id=?",
    [
      name,
      dimensions,
      classification,
      media_type,
      location,
      availability,
      0,
      id,
    ]
  );

  // If the classification is changed, adjust display order for the target classification
  if (classification !== targetClassification) {
    // Move paintings with display_order greater than the target order down
    await executeSQL(
      "UPDATE painting SET display_order = display_order - 1 WHERE display_order > ? AND classification = ?",
      [targetOrder, targetClassification]
    );

    // Increment the display order for paintings with the same or greater display order in the new classification
    await executeSQL(
      "UPDATE painting SET display_order = display_order + 1 WHERE classification = ?",
      [classification]
    );
  }

  res.redirect("/paintings");
});

app.post("/paintings/move-order/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const direction = req.body.direction; // Assuming direction is sent in the request body

    // Fetch the current order and classification of the target painting
    const targetPainting = await executeSQL(
      "SELECT display_order, classification FROM painting WHERE id = ?",
      [id]
    );

    if (!targetPainting || targetPainting.length === 0) {
      return res.status(404).send("Painting not found");
    }

    const targetOrder = targetPainting[0].display_order;
    const targetClassification = targetPainting[0].classification;

    // Fetch the adjacent painting based on the target order
    const adjacentPainting = await executeSQL(
      "SELECT id, display_order FROM painting WHERE display_order = ? AND classification = ?",
      [targetOrder + (direction === "up" ? -1 : 1), targetClassification]
    );

    if (!adjacentPainting || adjacentPainting.length === 0) {
      return res.status(400).send("Adjacent painting not found");
    }

    const adjacentPaintingId = adjacentPainting[0].id;
    const adjacentPaintingOrder = adjacentPainting[0].display_order;

    // Swap the order between the target painting and the adjacent painting
    await executeSQL("UPDATE painting SET display_order = ? WHERE id = ?", [
      adjacentPaintingOrder,
      id,
    ]);
    await executeSQL("UPDATE painting SET display_order = ? WHERE id = ?", [
      targetOrder,
      adjacentPaintingId,
    ]);

    // Redirect only after the database updates are completed
    res.redirect("/paintings?" + new Date().getTime());
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

/* -----------------------------------
            DELETE ROUTE
----------------------------------- */

app.delete("/paintings/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Fetch the current order and classification of the target painting
    const targetPainting = await executeSQL(
      "SELECT display_order, classification FROM painting WHERE id = ?",
      [id]
    );

    if (!targetPainting || targetPainting.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Painting not found" });
    }

    const targetOrder = targetPainting[0].display_order;
    const targetClassification = targetPainting[0].classification;

    // Delete the target painting
    await executeSQL("DELETE FROM painting WHERE id = ?", [id]);

    // Update display order for remaining paintings in the same classification
    await executeSQL(
      "UPDATE painting SET display_order = display_order - 1 WHERE display_order > ? AND classification = ?",
      [targetOrder, targetClassification]
    );

    res.json({ success: true, message: "Painting deleted successfully" });
  } catch (error) {
    console.error("Error deleting painting:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/* -----------------------------------
            FUNCTIONS
----------------------------------- */
async function executeSQL(sql, params) {
  return new Promise(function (resolve, reject) {
    pool.query(sql, params, function (err, rows, fields) {
      if (err) throw err;
      resolve(rows);
    });
  });
} //executeSQL

function isAuthenticated(req, res, next) {
  if (!req.session.authenticated) {
    res.redirect("/unauthorized");
  } else {
    next();
  }
} //isAuthenticated

module.exports = router;
async function mainMail(name, email, subject, message) {
  const transporter = nodeMail.createTransport({
    service: "gmail",
    auth: {
      user: "dohnemusart@gmail.com", //receipient's email
      pass: "dyvk kqhj iwyk cbzp", //receipient's generated password
    },
  });
  const mailOption = {
    from: email,
    to: "alobrien@csumb.edu", //receipient's email
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
} //mainMail

// findMaxOrder() => {

// });

app.listen(3000, () => {
  console.log("Expresss server running...");
}); //start server

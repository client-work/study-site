require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const multer = require("multer");
const upload = multer({ dest: "dist/files/" });
const path = require("path");
const fs = require("fs");

const { join } = require("path");

const app = express();

//Change filename set by multer back to default with the right extension
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "dist/files/"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

//Creating file in working directory with the right extension
const uploadFile = multer({ storage: storage });

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

app.post("/contribution", uploadFile.single("content"), (req, res) => {
  const { name, details, email, uid } = req.body;
  const msg = `Name: ${name}\nEmail: ${email}\nDetails: ${details}\nUser ID: ${uid}`;
  const mailOptions = {
    from: "sta98no@gmail.com",
    subject: "Contribution Form Data",
    to: "masigaallan032@gmail.com",
    text: msg,
    attachments: [
      {
        filename: req.file.originalname,
        path: req.file.path,
        content: req.file.path,
      },
    ],
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      fs.unlink(req.file.path, (err) => {
        if (err) console.log(err);
        console.log("Deleted successfully");
      });
      res.redirect("/contribution-failed");
    } else {
      console.log("Email sent: " + info.response);
      fs.unlink(req.file.path, (err) => {
        if (err) console.log(err);
        console.log("Deleted successfully");
      });
      res.redirect("/contribution-success");
    }
  });
});

// *********** ROUTES **************//

app.get("/", (req, res) => res.render("home"));

app.get("/login", (req, res) => res.render("login"));

app.get("/signup", (req, res) => res.render("signup"));

app.get("/forgot", (req, res) => res.render("forgot"));
app.get("/user-dashboard", (req, res) => res.render("user-dashboard"));

app.get("/resources", (req, res) => res.render("resources"));

app.get("/new-password", (req, res) => res.render("new-password"));

app.get("/file", (req, res) => res.render("file"));

app.get("/upload", (req, res) => res.render("upload"));

app.get("/terms", (req, res) => res.render("terms"));

//route for verification email page
app.get("/verify-email", (req, res) => res.render("email-ver"));

app.get("/contribution-success", (req, res) =>
  res.render("contribution-success")
);

app.get("/contribution-failed", (req, res) =>
  res.render("contribution-failed")
);

app.get("*", (req, res) => res.status(404).render("404"));

port = 3000;

app.listen(port, () => console.log(`App running on port ${port}`));

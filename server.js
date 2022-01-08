require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mailgun = require("mailgun-js");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    /*Appending extension with original name*/
    cb(null, file.originalname) 
  }
})

var upload = multer({ storage: storage });
const mg = mailgun({apiKey: process.env.API_KEY, domain: process.env.DOMAIN_NAME});

const app = express();

//Save file to files folder

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





app.post("/contribution", upload.array('content', 10), async (req, res) => {
  const { name, details, email, uid } = req.body;
  const msg = `Name: ${name}\nEmail: ${email}\nDetails: ${details}\nUser ID: ${uid}`;


// Create an array with the file path and the file name for each file in the array
const attachments = req.files.map((file) => {
 return new mg.Attachment({
  data: file.path,
  filename: file.originalname
  })
});


  const data = {
    from: 'Contribution <me@samples.mailgun.org>',
    to: 'sootamahima@gmail.com',
    subject: 'User Contributions',
    text: msg,
    attachment: attachments
  
  };
  
   mg.messages().send(data, function (error, body) {
    if (error) {
         res.send(error)
          //Delete each file in the uploads folder
          
          req.files.forEach((file) => {
            fs.unlink(file.path, (err) => {
              if (err) res.send(err);
              console.log('File deleted');
            });
          });
        
          res.redirect("/contribution-failed");
        } else {
          console.log(body);
          req.files.forEach((file) => {
            fs.unlink(file.path, (err) => {
              if (err) res.send(err);
              console.log('File deleted');
            });
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

port = process.env.PORT || 3000;


app.listen(port, () => console.log(`App running on port ${port}`));

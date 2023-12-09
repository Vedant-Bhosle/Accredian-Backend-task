const express = require("express");
const cors = require("cors");
const { urlencoded } = require("express");
var bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  cors({
    origin: ["http://localhost:3000", "*"],
    methods: ["POST", "GET"],
    credentials: true,
  })
);

app.use(express.json());
const connection = require("./db/conn");

app.get("/", (req, res) => {
  let sql = "SELECT * FROM USERS";

  connection.query(sql, (err, results) => {
    if (err) {
      console.log("error in query part");
      res.status(500).send({ message: err.message });
    } else {
      res.status(201).send(results);
    }
  });
});

app.get("/auth", (req, res) => {
  //   console.log("helloo from auth");
  const token = req.cookies.accesstoken;
  //   console.log("token   " + token);

  if (token) {
    const verifyuser = jwt.verify(token, "thisisuniquekey");
    if (verifyuser) {
      //   console.log(verifyuser.name);
      res.status(200).json({ status: "sucess", message: "token is present" });
    } else {
      res.json({ success: "notpresent", message: "token is not present" });
    }
  } else {
    console.log("token is not present");
    res.json({ success: "notpresent", message: "token is not present" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email + " " + password);

  const sql = "SELECT * FROM USERS WHERE email = ?";

  connection.query(sql, [email], async (err, data) => {
    if (err) {
      res.status(500).json({ message: "Error in login route query" });
    }
    if (data.length > 0) {
      const match = await bcrypt.compare(password, data[0].password);
      if (match) {
        const name = data[0].name;
        const token = jwt.sign({ name }, "thisisuniquekey"); //unique key should be in env file this is only for testing purpose

        res.cookie("accesstoken", token, {
          expires: new Date(Date.now() + 3600000), //this is in miliseconds means total 1 hour
          httpOnly: true,
        });

        res.status(200).json({ message: "User Successfully logged in" });
      } else {
        res.status(500).json({ message: "password not match while logging" });
      }
    } else {
      res.status(404).json({ message: "No Email found" });
    }
  });
});

app.post("/register", async (req, res) => {
  let { username, email, password, confirmpassword } = req.body;

  const sql = "INSERT INTO USERS (username,email,password ) VALUES(?,?,?)";

  const hashedpassword = await bcrypt.hash(password, 10);
  password = hashedpassword;
  console.log(hashedpassword.length);

  const values = [username, email, password];

  connection.query(sql, values, (err, data) => {
    if (err) {
      return res.status(500).send({ message: "Error in register route" });
    } else {
      res.status(201).send(data);
      console.log("sucess");
    }
  });
});

app.listen(5001, () => {
  console.log(" server running on port 5001");
  connection.connect(function (e) {
    if (e) {
      console.log(e);
      console.log("Error in database");
    } else {
      console.log("Database connection Successfull!!!!!");
    }
  });
});

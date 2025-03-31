
import { faker } from '@faker-js/faker';
import mysql from 'mysql2';
import express from "express";
import path from "path";
import methodOverride from "method-override";  // Correct way to import

// Initialize express app
const app = express();
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));

const __dirname = path.resolve();

// Set the view engine to EJS
app.set("view engine", "ejs");

// Set the path for views directory
app.set("views", path.join(__dirname, "/views"));

// Create the connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: //password
});

// Function to generate a random user
let getRandomUser = () => {
  return [
    faker.string.uuid(),            // id
    faker.internet.username(),      // username
    faker.internet.email(),         // email
    faker.internet.password(),      // password
  ];
};

// SQL query to insert user data (batch insert)
let q = "INSERT INTO user(id, username, email, password) VALUES ?";

// Insert 100 fake users
let data = [];
for (let i = 0; i < 100; i++) {
  data.push(getRandomUser());
}

// Define a route to test server
//home route
app.get("/", (req, res) => {
  // Query to get the count of users
  let q = `SELECT count(*) AS userCount FROM user`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log(result[0].userCount);
      res.render("home.ejs", { userCount: result[0].userCount }); // Pass the user count to EJS
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});

// //show route
app.get("/user" , (req , res) =>{
  let q= `SELECT * FROM user`;
  
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      // console.log(result);
      // res.send(result); // Pass the user count to EJS
      res.render("showusers.ejs" , {users});
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});

//EDIT route
app.get("/user/:id/edit" , (req , res) =>{
  let {id} = req.params;
  let q= `SELECT * FROM user WHERE id= '${id}'`;
  // console.log(id);
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      // res.send(result); // Pass the user count to EJS
      res.render("edit.ejs" , { user });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});

//UPDATE(db) ROUTE  
app.patch("/user/:id" , (req , res) =>{
  let {id} = req.params;
  let {password: formPass , username: newUsername} = req.body;
  let q= `SELECT * FROM user WHERE id= '${id}'`;
  // console.log(id);
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      // res.send(result); // Pass the user count to EJS
      if(formPass != user.password){
        res.send("WRONG PASSWORD");
      }else{
        let q2= `UPDATE user SET username = '${newUsername}' WHERE id='${id}'`;
        connection.query(q2 , (err , result) =>{
          if(err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});

// Start the server and listen on port 8080
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});

// Properly close the connection when the app shuts down
process.on('SIGINT', () => {
  connection.end(() => {
    console.log("Database connection closed");
    process.exit();
  });
});



//HW   1) create form to add a new user to the database
//     2) create form to delete a user from database if they enter correct email id and password 
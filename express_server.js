const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const {generateRandomString, addNewURL, editURL, urlDatabase, users, createNewUser} = require('./helpers')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


// ROUTES - GET
// .json of URLs for debugging
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// .json of users for debugging
app.get("/users.json", (req, res) => {
  res.json(users);
})

// List of URLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"], password: req.cookies["password"], user_id: req.cookies["user_id"]};
  res.render("urls_index", templateVars);
});

// Page to create new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"], password: req.cookies["password"], user_id: req.cookies["user_id"]};
  res.render("urls_new", templateVars);
});

// Display new shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { urls: urlDatabase, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"], password: req.cookies["password"], user_id: req.cookies["user_id"] };
  res.render("urls_show", templateVars);
});

app.get("/urls/:shortURL/edit", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"], password: req.cookies["password"], user_id: req.cookies["user_id"] }
  res.render("urls_show", templateVars);
});

// Display login form
app.get("/login", (req, res) => {
  const templateVars = {username: req.cookies["username"], password: req.cookies["password"], user_id: req.cookies["user_id"]};
  res.render("login", templateVars);
});

// Logout - Clear cookie, redir to login
app.get("/logout", (req, res) => {
  res.clearCookie('username');
  res.clearCookie('password');
  res.clearCookie('user_id');
  res.redirect("/login");
});

// Sign Up page
app.get("/register", (req, res) => {
  const templateVars = {username: req.cookies["username"], password: req.cookies["password"], user_id: req.cookies["user_id"]};
  res.render("register", templateVars);
});



// ROUTES - POST
// Create new shortURL
app.post("/urls", (req, res) => {
  const id = addNewURL(req.body.longURL);
  res.redirect(`/urls/${id}`);
});

// Delete existing shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// Reassign shortURL - V1
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}/edit`);
});

// Login and set cookie
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

// Register / Sign up
app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  res.cookie('password', password);
  createNewUser(username, password);
  let userKeys = Object.keys(users);
  let newUserPosition = userKeys.length - 1;
  let user_id = userKeys[newUserPosition];
  console.log(user_id);
  res.cookie('user_id', user_id)
  const templateVars = {
    username: req.cookies["username"],
    password: req.cookies["password"],
    user_id: req.cookies["user_id"]};
    res.redirect('/urls');
});

// UTILS
// Server listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
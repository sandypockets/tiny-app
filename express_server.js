const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const PORT = 8080;
const {generateRandomString, addNewURL, editURL, urlDatabase, users, createNewUser, findUserByCookie, validateCreds, findUserByEmail} = require('./helpers')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(morgan('short'));

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
  const user_id = req.cookies["user_id"];
  const userObj = findUserByCookie(user_id);
  const templateVars = { urls: urlDatabase, userObj: userObj};

/*   if (!validateCreds(userObj)) {
    //res.cookie('Status', 400);
    res.status(400);
    res.redirect('/register');
  }; */
  res.render("urls_index", templateVars);
});

// Page to create new URL
app.get("/urls/new", (req, res) => {
  const user_id = req.body.user_id;
  const userObj = findUserByCookie(user_id);
  const templateVars = { urls: urlDatabase, userObj: userObj};
  res.render("urls_new", templateVars);
});

// Display new shortURL
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.body.user_id;
  const userObj = findUserByCookie(user_id);
  const templateVars = { urls: urlDatabase, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], userObj: userObj};
  res.render("urls_show", templateVars);
});

app.get("/urls/:shortURL/edit", (req, res) => {
  const user_id = req.body.user_id;
  const userObj = findUserByCookie(user_id);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], userObj: userObj}
  res.render("urls_show", templateVars);
});

// Display login form
app.get("/login", (req, res) => {
  const user_id = req.body.user_id;
  const userObj = findUserByCookie(user_id);
  const templateVars = {userObj: userObj};
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
  const user_id = req.body.user_id;
  const userObj = findUserByCookie(user_id);
  const templateVars = {userObj: userObj};
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

// Edit shortURL
app.post("/urls/:shortURL/edit", (req, res) => {
  //const user_id = req.body.user_id;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}/edit`);
});

// Register / Sign up
app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    res.status(400);
    res.send("Status: 400 - Invalid entry. Please enter a valid username or password.");
  };

  res.cookie('password', password);
  createNewUser(username, password);
  let userKeys = Object.keys(users);
  let newUserPosition = userKeys.length - 1;
  let user_id = userKeys[newUserPosition];
  console.log(user_id);
  res.cookie('user_id', user_id)
  const userObj = findUserByCookie(user_id);
  const templateVars = {
    username: req.cookies["username"],
    password: req.cookies["password"],
    user_id: req.cookies["user_id"],
    userObj: userObj};
  console.log(userObj);
  res.redirect('/urls');
});

// Login and set cookie
app.post("/login", (req, res) => {
  let userEmail = req.body.username;
  // Now that the email is there, find the user with it
  let user_id = findUserByEmail(userEmail);
  //res.cookies('user_id', user_id)
  res.cookie('user_id', user_id);
  const templateVars = {
    user_id: res.cookie["user_id"]
  };
  //res.redirect('/urls', templateVars);
  res.redirect('/urls');
  });
  
  //const username = req.body.username;
  //const user_id = req.cookies["user_id"];
  /* const templateVars = {
    username: req.cookies["username"],
    password: req.cookies["password"],
    user_id: req.cookies["user_id"],
    userObj: userObj}; */
/*   // This small block, and the template vars in the res.redirect are what is causing an error in the program. I believe this will be addressed in the next lesson, so I am leaving it as is for now. Otherwise delete these few lines and the program should work normally again.
  const user_id = req.body.user_id;
  const userObj = findUserByCookie(user_id);
  const templateVars = {userObj: userObj}; */
  //res.cookie('username', username);

// UTILS
// Server listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
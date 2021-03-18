const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const PORT = 8080;
const {generateRandomString, addNewURL, editURL, urlDatabase, users, createNewUser, findUserByCookie, validateCreds, findUserByEmail, addNewUrlToUser} = require('./helpers')

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(morgan('short'));

/// ROUTES - GET ///
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
  const user_id = req.cookies.user_id;
  if (user_id) {
    const user_id = req.cookies["user_id"];
    const userObj = findUserByCookie(user_id);
    const templateVars = { urls: urlDatabase, userObj: userObj};

    res.render("urls_index", templateVars);
    return;
  } else {
    res.redirect("login");
  }
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
  //? shortURL is undefined at this time. Need to figure out how to pull it and add to template vars so that the script there can work.
  // urlDatabase[req.params.shortURL]
  const templateVars = { urls: urlDatabase, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userObj: userObj};
  console.log("The short URL is: ", shortURL);
  res.render("urls_show", templateVars);
});

// Short URL Edit page
app.get("/urls/:shortURL/edit", (req, res) => {
  const user_id = req.body.user_id;
  const userObj = findUserByCookie(user_id);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userObj: userObj}
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404);
  }
});

// Display login form
app.get("/login", (req, res) => {
  console.log("reqBody is: ", req.body);
  const user_id = req.body.user_id;
  console.log("The User ID: ", user_id);
  //const userObj = user_id;
  const userObj = findUserByCookie(user_id);
  console.log("The userObj from /login is: ", userObj);
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


/// ROUTES - POST ///
// Create new shortURL
/* app.post("/urls", (req, res) => {
  const id = addNewURL(req.body.longURL);
  res.redirect(`/urls/${id}`);
}); */
// ^
// Create new shortURL - unique to each user
app.post("/urls", (req, res) => {
  const id = addNewUrlToUser(req.body.longURL, req.body.user_id.id);
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

// EDIT SHORTURL
app.post("/urls/:shortURL/edit", (req, res) => {
  //const user_id = req.body.user_id;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}/edit`);
});


/// SIGNUP & AUTHENTICATION ///
// REGISTER
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
  res.cookie('user_id', user_id);
  const userObj = findUserByCookie(user_id);
  const templateVars = {
    username: req.cookies["username"],
    password: req.cookies["password"],
    user_id: req.cookies["user_id"],
    userObj: userObj};
  console.log(userObj);
  res.redirect('/urls');
});


// LOGIN & SET COOKIE
app.post("/login", (req, res) => {
  let userEmail = req.body.username;
  let userPassword = req.body.password;
  let userObj;
  let user_id = findUserByEmail(userEmail);
  if (userPassword === user_id.password && userEmail === user_id.email) {
    res.cookie('user_id', user_id.id);
    userObj = user_id;
    console.log(userObj);
  } else {
    res.status(403);
    res.send("403: Incorrect email or password.");
  }
  res.redirect('/urls');
});
  

// UTIL - Server listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
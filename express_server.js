const express = require('express');
//const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080;
const {generateRandomString, addNewURL, editURL, urlDatabase, users, createNewUser, findUserByCookie: findUserById, validateCreds, findUserByEmail, addNewUrlToUser, hashPassword, compareHashes} = require('./helpers')

app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.set("view engine", "ejs");
app.use(morgan('short'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

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
  const user_id = req.session['user_id'];
  if (user_id) {
    const userObj = findUserById(user_id.id);
    const templateVars = { urls: urlDatabase, userObj: userObj};
    res.render("urls_index", templateVars);
    return;
  } else {
    res.redirect("login");
  }
});

// Page to create new URL
app.get("/urls/new", (req, res) => {
  const user_id = req.session['user_id'];
  //const user_id = req.body.user_id;
  const userObj = findUserById(user_id.id);
  const templateVars = { urls: urlDatabase, userObj: userObj};
  res.render("urls_new", templateVars);
});

// Display new shortURL
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.body.user_id;
  const userObj = findUserById(user_id);
  //? shortURL is undefined at this time. Need to figure out how to pull it and add to template vars so that the script there can work.
  // urlDatabase[req.params.shortURL]
  //const templateVars = { urls: urlDatabase, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userObj: userObj};
  const templateVars = { urls: urlDatabase, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], userObj: userObj};
  res.render("urls_show", templateVars);
});

// Short URL Edit page
app.get("/urls/:shortURL/edit", (req, res) => {
  const user_id = req.body.user_id;
  const userObj = findUserById(user_id);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userObj: userObj}
  res.render("urls_show", templateVars);
});

// Allow shortURLs to be followed to the actual long URL
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
  const user_id = req.body.user_id;
  const userObj = findUserById(user_id);
  const templateVars = {userObj: userObj};
  res.render("login", templateVars);
});

// Logout - Clear cookie, redir to login
app.get("/logout", (req, res) => {
  req.session['user_id'] = null;
  // res.clearCookie('username');
  // res.clearCookie('password');
  // res.clearCookie('user_id');
  res.redirect("/login");
});

// Sign Up page
app.get("/register", (req, res) => {
  const user_id = req.body.user_id;
  const userObj = findUserById(user_id);
  const templateVars = {userObj: userObj};
  res.render("register", templateVars);
});


/// ROUTES - POST ///
// Create new shortURL - unique to each user
app.post("/urls", (req, res) => {
  //const id = addNewUrlToUser(req.body.longURL, req.body.user_id.id);
  const id = addNewUrlToUser(req.body.longURL, req.body.user_id);
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
  createNewUser(username, password);
  let userKeys = Object.keys(users);
  let newUserPosition = userKeys.length - 1;
  let user_id = userKeys[newUserPosition];
  req.session['user_id'] = user_id;
  const userObj = findUserById(user_id);
/*   const templateVars = {
    username: req.session["username"],
    password: req.session["password"],
    user_id: req.session["user_id"],
    userObj: userObj
    };*/
  res.redirect('/urls');
});


// LOGIN & SET COOKIE
app.post("/login", (req, res) => {
  let userEmail = req.body.username;
  let userPassword = req.body.password;
  let userObj;
  let user_id = findUserByEmail(userEmail);
  if (userEmail === user_id.email) {
    if (compareHashes(userPassword)) {
        req.session['user_id'] = user_id;
        //res.session.user_id = `${user_id.id}`
        //res.cookie('user_id', user_id.id);
        userObj = user_id;
      } else {
        res.status(403);
        res.send("403: Incorrect email or password.");
      }
    }
    res.redirect('/urls');
});
  

// UTIL - Server listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
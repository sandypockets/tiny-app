const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
const {urlDatabase, users, createNewUser, findUserById, findUserByEmail, addNewUrlToUser, compareHashes} = require('./helpers')

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(morgan('short'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


/// ROUTES - GET ///
// .json of URLs and users for debugging
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/users.json", (req, res) => {
  res.json(users);
})

app.get("/", (req, res) => {
  res.redirect('login');
});

// List of URLs
app.get("/urls", (req, res) => {
  let user_id = req.session['user_id'];
  if (user_id) {
    userObj = findUserById(user_id);
    const templateVars = { urls: urlDatabase, userObj: userObj, user_id};
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
  const userObj = findUserById(user_id);
  const templateVars = { urls: urlDatabase, userObj: userObj};
  res.render("urls_new", templateVars);
});

// Display new shortURL
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.body.user_id;
  const userObj = findUserById(user_id);
  const templateVars = { urls: urlDatabase, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userObj: userObj};
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
  req.session = null;
  res.redirect("/login");
});

// Sign Up page
app.get("/register", (req, res) => {
  //const user_id = req.body.user_id;
  const user_id = req.session['user_id'];
  const userObj = findUserById(user_id);
  const templateVars = {userObj: userObj};
  res.render("register", templateVars);
});

/// ROUTES - POST ///
// Create new shortURL - unique to each user
app.post("/urls", (req, res) => {
  const id = addNewUrlToUser(req.body.longURL, req.session['user_id']);
  res.redirect(`/urls/${id.shortURL}`);
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
  const user_id = req.session['user_id'];
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = {
    shortURL: shortURL,
    longURL: req.body.longURL,
    userID: user_id
  };
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
  res.redirect('/urls');
});


// LOGIN & SET COOKIE
app.post("/login", (req, res) => {
  let userEmail = req.body.username;
  let userPassword = req.body.password;
  let userObj = findUserByEmail(userEmail);
  if (userObj) {
    if (userEmail === userObj.email) {
      let user_id = userObj.id;
      if (compareHashes(userPassword, user_id)) {
        req.session['user_id'] = user_id;
        res.redirect('/urls');
      }
    }
  } 
  res.status(403);
  res.send("403: Incorrect email or password");
});


// UTIL - Server listening
app.listen(PORT, () => {
  console.log(`Express server (Tiny App) listening on port ${PORT}`);
});

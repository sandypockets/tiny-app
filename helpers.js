const bcrypt = require('bcryptjs');

// Database of existing URLs, and the users that created them
const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "23l4kj"},
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  jh1hp9: { longURL: "https://www.yahoo.com", userID: "ay8l46" }
};

// Database of users
const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "ay8l46": {
    id: "ay8l46", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "23l4kj": {
    id: "23l4kj",
    email: "test@test.com",
    password: "test"
  }
}

// HELPER FUNCTIONS
function generateRandomString() {
  const randomString = Math.random().toString(26).substring(2, 8);
  return randomString;
};

// Adds a user to the users database
const addUserToDB = (userID, email, password) => {
  return users[userID] = {
    id: userID, 
    email: email, 
    password: password
  };
};

// Creates a new userID and creates a new user in the users database
const createNewUser = (email, password) => {
  let hashedPassword = hashPassword(password);
  const newUserID = generateRandomString();
  return addUserToDB(newUserID, email, hashedPassword);
};

// Find a user by their user_ID cookie value
const findUserById = (user_id) => {
  //const user_ID = req.body.user_ID;
  const user = users[user_id];
  return user;
};

// Find user by their email address
const findUserByEmail = (email) => {
  for (let userid in users) {
    if (users[userid].email === email) {
      return users[userid];
    }
  }
};

const hashPassword = (plaintext) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(plaintext, salt);
  return hash;
};

const compareHashes = (plaintext) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(plaintext, salt);
  if (bcrypt.compareSync(plaintext, hash)) {
    return true;
  }
  return false;
};

// Return StatusCode 400 if email or password is blank
// Implemented within the register POST in express_server.js
const validateCreds = (userObj) => {
  const user_id = userObj.id;
  if (user_id) {
    if (!userObj.email || !userObj.password) {
      return false;
    } else {
      return true;
    }
  }
};

// Add new URL to user - testing in REPL
const addNewUrlToUser = (longURL, userID) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL, userID, shortURL};
  return urlDatabase[shortURL];
};

const addNewURL = (longURL) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  return shortURL;
};

const editURL = (shortURL, longURL) => {
  const newShortURL = longURL;
  urlDatabase[shortURL] = newShortURL;
  return shortURL;
};

module.exports = {urlDatabase, generateRandomString, addNewURL, editURL, users, createNewUser, findUserByCookie: findUserById, validateCreds, findUserByEmail, addNewUrlToUser, hashPassword, compareHashes};
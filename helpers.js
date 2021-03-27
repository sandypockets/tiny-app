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
    password: "$2a$10$HhuQ.M.7Y1ssk5azoKSNuuvkFVLTLDxokrAru0vJezITbAlW0UHbK"
  }
}

// HELPER FUNCTIONS
function generateRandomString() {
  const randomString = Math.random().toString(26).substring(2, 8);
  return randomString;
};

const addUserToDB = (userID, email, password) => {
  return users[userID] = {
    id: userID, 
    email: email, 
    password: password
  };
};

// Creates userID and adds user to db
const createNewUser = (email, password) => {
  let hashedPassword = hashPassword(password);
  const newUserID = generateRandomString();
  return addUserToDB(newUserID, email, hashedPassword);
};

// Find a user by their user_ID cookie value
const findUserById = (user_id) => {
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

const salt = bcrypt.genSaltSync(10);
const hashPassword = (plaintext) => {
  const hash = bcrypt.hashSync(plaintext, salt);
  return hash;
};

const compareHashes = (plaintext, userIdent) => {
  const user_id = userIdent;
  const hash = users[user_id]['password'];
  return bcrypt.compareSync(plaintext, hash);
};

// Add new URL to user - testing in REPL
const addNewUrlToUser = (longURL, userID) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL, userID, shortURL};
  return urlDatabase[shortURL];
};

module.exports = {urlDatabase, users, createNewUser, findUserById, findUserByEmail, addNewUrlToUser, compareHashes};

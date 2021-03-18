// Database of existing URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Database of users
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
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
  const newUserID = generateRandomString();
  return addUserToDB(newUserID, email, password);
};

// Find a user by their user_ID cookie value
const findUserByCookie = (user_id) => {
  //const user_ID = req.body.user_ID;
  const user = users[user_id];
  return user;
};
  
const addNewURL = (longURL) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  return shortURL;
};

// TESTING
const editURL = (shortURL, longURL) => {
  const newShortURL = longURL;
  urlDatabase[shortURL] = newShortURL;
  return shortURL;
};

module.exports = {urlDatabase, generateRandomString, addNewURL, editURL, users, createNewUser, findUserByCookie};
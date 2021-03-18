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

// Find user by their email address
const findUserByEmail = (email) => {
  for (let userid in users) {
    if (users[userid].email === email) {
      return users[userid];
    }
  }
  // Does this need a false return?
};




// Return StatusCode 400 if email or password is blank
// Implemented within the register POST in express_server.js
// This func is not needed atm, but the program breaks when it is removed.
const validateCreds = (userObj) => {
  console.log("TESTING: ", userObj)
  console.log("TESTING: ", userObj.email)
  const user_id = userObj.id;
  if (user_id) {
    if (!userObj.email || !userObj.password) {
      return false;
    } else {
      return true;
    }
  }
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

module.exports = {urlDatabase, generateRandomString, addNewURL, editURL, users, createNewUser, findUserByCookie, validateCreds, findUserByEmail};
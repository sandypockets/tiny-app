// Database of existing URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// HELPER FUNCTIONS
function generateRandomString() {
  const randomString = Math.random().toString(26).substring(2, 8);
  return randomString;
};
  
const addNewURL = (longURL) => {
  const shortURL = generateRandomString();
  //const newShortURL = longURL;
  urlDatabase[shortURL] = longURL;
  return shortURL;
};

// TESTING
const editURL = (shortURL, longURL) => {
  const newShortURL = longURL;
  urlDatabase[shortURL] = newShortURL;
  return shortURL;
};

module.exports = {urlDatabase, generateRandomString, addNewURL, editURL};
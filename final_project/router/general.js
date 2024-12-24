const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username && !password) {
    return res.status(400).json({ message: "Username and Password are required." });
  }

  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required." });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists." });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// using async/await 
public_users.get('/async', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:3000/');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch book list!",
      error: error.message
    });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.json(books[isbn]);
  } else {
    res.status(404).send("Unable to find book with this ISBN!");
  }

});


// Search by ISBN – Using Promises 
public_users.get('/promise/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  axios.get(`http://localhost:3000/isbn/${isbn}`)
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      res.status(404).json({
        message: "Unable to find book with this ISBN!",
        error: error.message
      });
    });
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = Object.values(books).filter(book =>
    book.author.toLowerCase() === author.toLowerCase()
  );

  if (booksByAuthor.length > 0) {
    res.send(booksByAuthor);
  } else {
    res.status(404).send("No books found by this author!");
  }
});

// using async/await 
public_users.get('/async/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:3000/author/${author}`);
    res.json(response.data);
  } catch (error) {
    res.status(404).json({
      message: "No books found by this author!",
      error: error.message
    });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = Object.values(books).filter(book =>
    book.title.toLowerCase() === title.toLowerCase()
  );

  if (booksByTitle.length > 0) {
    res.send(booksByTitle);
  } else {
    res.status(404).send("No books found by this title!");
  }
});

// using async/await 
public_users.get('/async/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const response = await axios.get(`http://localhost:3000/title/${title}`);
    res.json(response.data);
  } catch (error) {
    res.status(404).json({
      message: "No books found by this title!",
      error: error.message
    });
  }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const reviews = books[isbn]?.reviews;
  if (reviews) {
    res.send(reviews);
  } else {
    res.status(404).send("No reviews found for this ISBN!");
  }

});

module.exports.general = public_users;

// Importing modules 
import express from "express"; //express framework for building web server
import bodyParser from "body-parser"; // middleware for parsing request bodies
import pg from "pg"; // PostgreSQL client for interacting with the database
import axios from "axios"; // Axios for making HTTP requests (for external APIs)
import dotenv from "dotenv"; // dotenv for environment variables

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;


// Set up the PostgreSQL database connection
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "booklist",
    password: process.env.DB_PASSWORD,
    port: 5432,
});

// Connect to db
db.connect();

// Middleware 
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies (from forms)
app.use(express.static("public")); // Serve static files (CSS, JS) from the public folder
app.set("view engine", "ejs"); // Set EJS as templating engine

let books = [];

// Route to display the list of books (READ funtionality)
app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM books ORDER BY id ASC"); // Query database for all the books and order them by ID
        books = result.rows; // Store the result in the books array
  
        res.render("index.ejs", { // Render the index.js template with the list of books
            listTitle: "Books Collection", // The title of the book list
            booksList: books, // Pass the books data to the template
        }); 
    } catch (err) {
        console.log(err); // Log error to the console
    }
});

// Route to add a new book (CREATE functionality)
app.post("/add", async (req, res) => { //
    const { title, author, rating, recency } = req.body; // Extract data from the form submission
    try {
        await db.query(
            "INSERT INTO books (title, author, rating, recency) VALUES ($1, $2, $3, $4)", // Insert the new book into the database
            [title, author, rating, recency]
        );
        res.redirect("/"); // Redirect to the home page
    } catch (err) {
        console.log(err);
    }
});

// Route to update a book's details (UPDATE functionality)
app.post("/edit", async (req, res) => {
    const { id, title, author, rating, recency } = req.body;
    try {
        await db.query(
            "UPDATE books SET title = $1, author = $2, rating = $3, recency = $4 WHERE id = $5", // Update the book in the database
            [title, author, rating, recency, id]
        );
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
});

// POST request to delete a book (DESTROY functionality)
app.post("/delete", async (req, res) => {
    const id = req.body.deleteBookId; // Get the ID of the book to be deleted
    try {
        await db.query("DELETE FROM books WHERE id = $1", [id]); // Delete the book from the database
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
});


// Route to fetch book covers from an external API (Open Library Covers API)
app.get("/bookcover/:key/:value/:size", async (req, res) => {
    const { key, value, size } = req.params;
  
    // Validate size
    if (!['S', 'M', 'L'].includes(size.toUpperCase())) {
        return res.status(400).json({ error: "Invalid size parameter" });
    }
  
    // Construct the URL for the book cover
    const coverUrl = `https://covers.openlibrary.org/b/${key}/${value}-${size}.jpg`;
  
    try {
        const response = await axios.get(coverUrl, { responseType: 'arraybuffer' });
  
        // If the response is a valid image, send it back
        if (response.status === 200) {
            res.set('Content-Type', 'image/jpeg');
            res.send(response.data);
        } else {
        res.status(404).json({ error: "Cover not found" });
        }
    } catch (err) {
        console.log(err);
        res.status(404).json({ error: "Cover not found" });
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


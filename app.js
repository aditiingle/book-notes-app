// Importing modules 
import express from "express"; // express framework for building web server
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
    database: "book_list",
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

// Route to display the list of books (READ functionality)
app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM books ORDER BY id ASC"); // Query database for all the books and order them by ID
        books = result.rows; // Store the result in the books array
  
        res.render("index.ejs", { // Render the index.ejs template with the list of books
            listTitle: "Books Collection", // The title of the book list
            booksList: books, // Pass the books data to the template
        }); 
    } catch (err) {
        console.log(err); // Log error to the console
    }
});

// Route to display the edit form for a specific book (READ functionality)
app.get("/edit/:id", async (req, res) => {
    const id = req.params.id; // Get the book ID from the URL parameters
    try {
        const result = await db.query("SELECT * FROM books WHERE id = $1", [id]); // Fetch the book details from the database
        const book = result.rows[0]; // Get the book details from the query result

        if (book) {
            res.render("edit_book.ejs", { // Render the edit form template
                book: book // Pass the book details to the template
            });
        } else {
            res.status(404).send("Book not found"); // Handle the case where the book is not found
        }
    } catch (err) {
        console.log(err); // Log any errors
        res.status(500).send("Server error"); // Send a server error response in case of failure
    }
});

// Route to display about page (READ functionality)
app.get("/about", (req, res) => {
    res.render("about.ejs"); // Render the about page template
});

// Route to display the add book form (READ functionality)
app.get("/add_book", (req, res) => {
    res.render("add_book.ejs"); // Render the add book form template
});

// Route to add a new book (CREATE functionality)
app.post("/add", async (req, res) => {
    const { title, author, rating, recency, notes, isbn } = req.body; // Extract data from form submission
    try {
        await db.query(
            "INSERT INTO books (title, author, rating, recency, notes, isbn) VALUES ($1, $2, $3, $4, $5, $6)", // Ensure notes are included in the query
            [title, author, rating, recency || null, notes || null, isbn || null] // Include notes in the parameters
        );
        res.redirect("/"); // Redirect to home page
    } catch (err) {
        console.log(err); // Log errors
    }
});


// Route to update a book's details (UPDATE functionality)
app.post("/edit/:id", async (req, res) => {
    const { title, author, rating, recency, notes, isbn } = req.body; // Extract book details from the request body
    const id = req.params.id; // Extract the book ID from the URL parameters

    try {
        await db.query(
            "UPDATE books SET title = $1, author = $2, rating = $3, recency = $4, notes = $5, isbn = $6 WHERE id = $7", // Update the book in the database
            [title, author, rating, recency || null, notes || null, isbn || null, id]
        );
        res.redirect("/"); // Redirect to the home page after successful update
    } catch (err) {
        console.log(err); // Log any errors
        res.status(500).send("Server error"); // Send a server error response in case of failure
    }
});

// POST request to delete a book (DESTROY functionality)
app.post("/delete", async (req, res) => {
    const id = req.body.deleteBookId; // Get the ID of the book to be deleted
    try {
        await db.query("DELETE FROM books WHERE id = $1", [id]); // Delete the book from the database
        res.redirect("/"); // Redirect to the home page after successful deletion
    } catch (err) {
        console.log(err); // Log any errors
    }
});



// For fetching cover images
app.get("/covers", async (req, res) => {
    try {
        // Query the database to get all the ISBNs from the 'books' table
        const result = await db.query('SELECT isbn FROM books');
        const isbns = result.rows.map(book => book.isbn); // Extract ISBNs from the result

        // Generate a list of promises to fetch the cover images for each ISBN
        const coverPromises = isbns.map(isbn =>
            axios.get(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`, { responseType: 'arraybuffer' })
                .then(response => ({
                    isbn,
                    image: `data:image/jpeg;base64,${Buffer.from(response.data).toString('base64')}`
                }))
                .catch(() => ({
                    isbn,
                    image: '' // Handle errors gracefully if no image is found
                }))
        );

        // Wait for all cover images to be fetched
        const covers = await Promise.all(coverPromises);
        
        // Send the fetched cover images as JSON
        res.json(covers);
    } catch (err) {
        console.error('Error fetching cover images:', err.message);
        res.status(500).send('Server error');
    }
});



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


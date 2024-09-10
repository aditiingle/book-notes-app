# book-notes-app
A book notes app that lets users track books they've read, take notes, rate, and sort by recency, title, or rating. Integrates the Open Library API to fetch book covers. Built using Node.js, Express, PostgreSQL for data persistence, and EJS for templating, this app demonstrates full CRUD functionality and API integration.

## How to run my Express.js web application locally on your computer 

This is a simple Express.js application for managing a collection of books. It uses PostgreSQL as the database and EJS for templating.

## Prerequisites

- [Node.js](https://nodejs.org/) 
- [npm](https://www.npmjs.com/) 
- [PostgreSQL](https://www.postgresql.org/)

# Step 1: Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/yourusername/book-notes-app.git
```

Navigate to the project directory:
```bash
cd book-notes-app
```

# Step 2: Install Dependencies
```bash
npm install express ejs axios pg dotenv body-parser method-override
npm install --save-dev nodemon
```

# Step 3: Set up environment variables

Create a .env file in the project root:
```bash
touch .env
```

Edit the .env file to include your environment-specific settings (Make sure to use the same variable name):
DB_PASSWORD=your_postgres_password

# Step 4: In pgAdmin (PostgreSQL)

Create a new database called book_list, then create a table with : 

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(255),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    recency DATE,
    isbn VARCHAR(13)
);

(optional) : Import Data from CSV:

* Open PostgreSQL's graphical client (e.g., pgAdmin).
* Navigate to your database and select the books table.
* Right-click on the table and select Import/Export Data.
* Choose the CSV file book_read.csv and ensure to check the "Header" option.
* Remove the id column from the CSV file as it will be auto-generated.
* Import the CSV file into the table.

# Step 5: Start the server and Access the Website
```bash
  nodemon app.js
```
Open your web browser and navigate to localhost:3000 to see the website in action





CREATE DATABASE book_list;

\c book_list;  

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(255),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    cover_url VARCHAR(255),
    recency DATE
);

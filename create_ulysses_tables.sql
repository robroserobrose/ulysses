DROP DATABASE ulysses;
CREATE DATABASE ulysses;

CREATE TABLE ulysses.exact (
	word varchar(100),
	line_number int,
	page_number int,
	chapter varchar(100)
);

CREATE TABLE ulysses.chapters (
	chapter_title varchar(100) UNIQUE NOT NULL,
	line_number int,
	PRIMARY KEY (chapter_title)
);
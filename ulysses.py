from flask import Flask, request, render_template, abort
import MySQLdb
import re

def get_all_chapters():
	query = "SELECT * FROM ulysses.chapters ORDER BY line_number ASC"
	cursor, mysql_connection = db_connect()
	cursor.execute(query)
	results = cursor.fetchall()
	# get page numbers
	return [(result[0], result[1] / 50 + 1)  for result in results]

def db_connect():
	mysql_connection = MySQLdb.connect(host="localhost",user="root",passwd="awesome!", db="ulysses");
	cursor = mysql_connection.cursor()
	return cursor, mysql_connection

ulysses = [line.split() for line in open("ulyss12.txt").readlines()]
lines_per_page = 50
chapters = get_all_chapters()
num_pages = len(ulysses) / 50 + 1

app = Flask(__name__)

def clean_up_query(query):
	query = query.lower()
	query = re.sub('[^A-Za-z0-9]', '', query)
	return query

def get_chapter(line_number):
	query = "SELECT chapter_title FROM ulysses.chapters WHERE line_number<" + str(line_number + 1) + " ORDER BY line_number DESC"
	cursor, mysql_connection = db_connect()
	cursor.execute(query)
	return cursor.fetchone()[0]

@app.route("/static/<path:path>")
def statics(path):
	return send_from_directory("static/", path)
	
@app.route("/ulysses")
def homepage():
	page = ulysses[0:50]
	chapter_title = get_chapter(0)
	return render_template('homepage.html', page_number=1, page=page, chapter_title=chapter_title, chapters=chapters, num_pages=num_pages)

@app.route("/ulysses/page", methods=['POST'])
def ulysses_page():
	if 'page_number' not in request.args:
		abort(404)
	page_number = int(request.args.get('page_number'))
	if page_number < 1:
		abort(404)
	page_start = lines_per_page * (page_number - 1)
	page_end = lines_per_page * page_number
	page = ulysses[page_start:page_end]
	chapter_title = get_chapter(page_start)
	return render_template('page_ajax.html', page_number=page_number, page=page, chapter_title=chapter_title, chapters=chapters, num_pages=num_pages)

@app.route("/ulysses/search", methods=['POST'])
def ulysses_search():
	if 'word' not in request.args:
		abort(404)
	word = clean_up_query(request.args.get('word'))
	cursor, mysql_connection = db_connect()
	query = "SELECT line_number FROM ulysses.exact WHERE word='" + word + "';"
	cursor.execute(query)
	result_line_numbers = [result[0] for result in cursor.fetchall()]
	result_lines = [" ".join(ulysses[i]) for i in result_line_numbers]
	result_pages = [line_number / 50 + 1 for line_number in result_line_numbers]
	result_chapters = [get_chapter(line_number) for line_number in result_line_numbers]
	results = zip(result_line_numbers, result_lines, result_pages, result_chapters)
	return render_template('search_ajax.html', word=word, results=results, num_results=len(results), chapters=chapters)


if __name__ == "__main__":
	app.run(port=5555,debug=True)





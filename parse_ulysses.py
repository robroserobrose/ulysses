import MySQLdb
import re

ulysses_lines = open("ulyss12.txt").readlines()

mysql_connection = MySQLdb.connect(host="localhost",user="root",passwd="awesome!", db="ulysses");
cursor = mysql_connection.cursor()

for line_number, line in enumerate(ulysses_lines):
	if "--------" in line:
		words = line.split()
		chapter_title = " ".join(words[1:(len(words) - 1)])
		query = "INSERT INTO ulysses.chapters VALUES ('" + chapter_title + "'," + str(line_number) + ");"
		cursor.execute(query)
	else:
		line = re.sub('\r', ' ', line)
		line = re.sub('[^A-Za-z0-9 ]', '', line)
		for word in line.split():
			query = "INSERT INTO ulysses.exact VALUES ('" + word + "'," + str(line_number) + ");"
			if word is not "":
				cursor.execute(query)

mysql_connection.commit()


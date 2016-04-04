{-# LANGUAGE OverloadedStrings #-}
import Prelude hiding (words, unwords)
import Data.Text (Text, isInfixOf, pack, unpack, words, unwords)
import Text.Regex
import Database.MySQL.Simple
import GHC.Int (Int64)
import System.IO

type Line = (Text, Int)
type Chapter = (Text, [Line])
type Book = [Chapter]

is_header :: Line -> Bool
is_header (line, num) = (pack "--------") `isInfixOf` line

chapter_name :: Line -> Text
chapter_name (line, num) = (unwords . remove_ends . words) line
    where remove_ends = (drop 1) . reverse . (drop 1) . reverse

clean_line :: Line -> Line
clean_line (line, num) = ((only_alphanumeric . clean_whitespace) line, num)
    where clean_whitespace line = subRegex (mkRegex "\r*") (unpack line) " "
          only_alphanumeric line = pack (subRegex (mkRegex "[^A-Za-z0-9 ]") line "")

line_to_words :: Line -> [Line]
line_to_words (line, num) = [(word, num) | word <- words line]

add_line_numbers :: [Text] -> [Line]
add_line_numbers lines = zip lines [1..]

chapters :: [Line] -> Book
chapters [] = []
chapters (header:lines) = (chapter_name header, chapter):(chapters rest)
    where (chapter, rest) = break is_header lines

parse_book :: String -> Book
parse_book = chapters . add_line_numbers . (map pack) . lines

drop_database :: Query
drop_database = "DROP DATABASE IF EXISTS ulysses2;"

create_database :: Query
create_database = "CREATE DATABASE ulysses2;"

create_words_table :: Query
create_words_table = "CREATE TABLE ulysses2.exact (\
                        \word varchar(100),\
                        \line_number int,\
                        \page_number int,\
                        \chapter varchar(100)\
                    \);"

create_chapters_table :: Query
create_chapters_table = "CREATE TABLE ulysses2.chapters (\
                            \chapter_title varchar(100) UNIQUE NOT NULL,\
                            \line_number int,\
                            \PRIMARY KEY (chapter_title)\
                        \);"

chapter_query :: Query
chapter_query = "INSERT INTO ulysses2.chapters VALUES (?, ?);"

word_query :: Query
word_query = "INSERT INTO ulysses2.exact VALUES (?,?,?,?);"

line_to_page :: Int -> Int
line_to_page x = (x `quot` 50) + 1

connectInfo :: ConnectInfo
connectInfo = ConnectInfo { connectHost = "localhost",
                            connectPort = 3306,
                            connectUser = "root",
                        connectPassword = "awesome!",
                        connectDatabase = "",
                         connectOptions = [],
                            connectPath = "",
                             connectSSL = Nothing }

insert_words :: Connection -> Chapter -> IO ()
insert_words conn (name, lines) = mapM_ (mapM_ (insert)) (map line_to_words lines)
    where insert (w,n) = execute conn word_query (w, n, line_to_page n, name)

insert_chapter :: Connection -> Chapter -> IO Int64
insert_chapter conn (name, ((_,num):_)) = execute conn chapter_query (name,num)

fill_table_chapter :: Connection -> Chapter -> IO ()
fill_table_chapter conn chapter = do
    _ <- insert_chapter conn chapter
    _ <- insert_words conn chapter
    return ()

fill_tables :: IO ()
fill_tables = do
    create_table <- readFile "create_ulysses_tables.sql"
    raw_text <- readFile "ulyss12.txt"
    let book = parse_book raw_text
    conn <- connect connectInfo
    _ <- autocommit conn False
    _ <- execute_ conn drop_database
    _ <- execute_ conn create_database
    _ <- execute_ conn create_chapters_table
    _ <- execute_ conn create_words_table
    _ <- mapM_ (fill_table_chapter conn) book
    _ <- commit conn
    return ()

main = fill_tables

#!/usr/bin/python
# -*- coding: utf-8 -*-

"""
Write a csv file to sql lite data base if it exists and if the file exists
For the first one, you will need to create the db, dropping a db of the same name
Furthermore, comment out those lines (see try section in write_csv_to_db), and 
just use the insertion statement
"""

import sqlite3
import csv
import sys

def form_connection():

    """
    Creates a connection to an existing sql lite database
    Returns a cursor on the connection
    """

    # default for the connection parameter
    con = None

    try:
        # create a connection object called con
        con = sqlite3.connect('snow.db')
        cur = con.cursor()

    except sqlite3.Error, e:

        if con:
            con.rollback()

        # if a connection can't be made, print an error with the arguements included
        print "Error %s:" % e.args[0]
        sys.exit(1)

    # return the cursor object    
    return cur

def read_all(cur):

    with open('some_snowy_data.csv','wb') as writefile:
        writer = csv.writer(writefile, quoting = csv.QUOTE_NONNUMERIC)
        writer.writerow(['index', 'date', 'depth', 'coverage', 'notes'])
    
        query = "select * from snowimages where hour = 12 order by id asc"

        cur.execute(query)

        for row in cur:
            index = str(row[0])
            date = str(row[1]) + '12:00:00'
            depth = str(row[3])
            coverage = str(row[4])
            notes = str(row[5])
            
            new_row = [index, date, depth, coverage, notes]

            writer.writerow(new_row)

if __name__ == "__main__":
    cur = form_connection()
    read_all(cur)
    print "SQL lite data base is a csv"
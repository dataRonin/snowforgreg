DROP TABLE IF EXISTS snowimages;

CREATE TABLE snowimages(
    id INTEGER,
    date_time DATETIME,
    hour INTEGER,
    img_src TEXT,
    depth REAL,
    coverage REAL,
    notes TEXT,
    insession INTEGER default 0
);

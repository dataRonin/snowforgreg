#!/usr/bin/env node
/**
 * Node.js back-end core
 * @author Fox Peterson (fox@tinybike.net)
 */
var express = require('express')
    , path = require('path')
    , express_io = require('express.io')
    , errorhandler = require('errorhandler')
    , longjohn = require('longjohn')
    , _ = require('underscore')
    , $ = require('jquery')
    , sessions = require('sessions')
    , flash = require('connect-flash')
    , fs = require('fs')
    , sqlite3 = require('sqlite3').verbose();

/* Configuration - index.js is really just the routes that we are calling */

// name the app variable, call it over regular http://
var app = express_io();
app.http().io();

// prevents the leaking of callbacks?
longjohn.async_trace_limit = 25;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var log = console.log;

// set the port to 3700 to serve
var port = process.env.PORT || 3700;

app.use(express.static(__dirname + '/assets'));
app.use(flash());
app.use(app.router);

app.locals.pretty = true;
console.log("Starting development server on port " + port);

app.listen(port);

// Routes -- any time you want like a  separate page

app.get('/', function (req, res) {
    res.render('page');
});

var db = new sqlite3.Database('snow.db');

app.io.on("connection", function (socket) {
    console.log("websocket connected");
    socket.on("disconnect", function () {
        console.log("websocket disconnected");
    });

    // Websocket endpoints
    socket.on('display-initial-data', function (req) {
        console.log("display-initial-data: checking if data exists");
        db.serialize(function () {
            db.get("SELECT date_time as dt, img_src as img, notes as notes, coverage as coverage, depth as depth FROM snowimages WHERE hour = 12 ORDER BY date_time ASC LIMIT 1", function (err, row) {
                if (err) return console.error(err);
                socket.emit("refresh-data", row);
            });
        });
    });
    socket.on("update-data", function (req) {
        if (req) {
            var sql = "UPDATE snowimages SET notes = ?, coverage = ?, depth = ? WHERE date_time = ?";
            db.run(sql, [req.notes, req.coverage, req.depth, req.dt], function (err) {
                if (err) {
                    console.error(err);
                } else {
                    console.log(this);
                }
            });
            db.serialize(function () {
                // here's where the next date goes
                db.each("SELECT * FROM snowimages WHERE depth = 10000 ORDER BY date_time DESC", function (err, row) {
                    if (err) return console.error(err);
                    console.log(row);
                    var updated_data = {};
                    socket.emit("updated-data", updated_data);
                });
            });
        }
    });
    socket.on("get-date-data", function (req) {
        if (req) {
            log(req.date);
            var date = new Date(req.date.replace('/', '-'));
            date.setHours(date.getHours() + 12);
            log(date);
            db.serialize(function () {
                var sql = "SELECT * FROM snowimages WHERE date_time = ? LIMIT 1";
                db.get(sql, date, function (err, row) {
                    if (err) return console.error(err);
                    log(row);
                    socket.emit("refresh-data", row);
                });
            });
        }
    });
});

//             var img = row.img;
//             var notes = row.notes;
//             var coverage = row.coverage;
//             var insession = row.insession;

//             req.io.emit('displaydata', img)
//         });
//     });   

// app.io.route('dateget', function (data) {
//     var db = new sqlite3.Database('snow.db');
//         //db.each("SELECT img_src AS image, depth AS depth, notes AS notes, coverage AS coverage, insession AS insession FROM snowimages WHERE dt ", function(err, row) { 
        
//         db.each("SELECT date_time as dt, img_src as img, notes as notes, coverage as coverage, insession as insession FROM snowimages WHERE hour = 12 and date_time = \'"+ data +"\' LIMIT 1", function(err, row) {

//             console.log(row.dt, row.img, row.notes, row.coverage, row.insession);

//             var dt = row.dt;
//             var img = row.img;
//             var notes = row.notes;
//             var coverage = row.coverage;
//             var insession = row.insession;

//             req.io.emit('displaydata', img)
//         });
//     });   



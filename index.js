#!/usr/bin/env node
/**
 * SERVER SIDE
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

// establish the databse
var db = new sqlite3.Database('snow.db');

// lets us know if connected (server side)
app.io.on("connection", function (socket) {
    console.log("websocket connected");
    socket.on("disconnect", function () {
        console.log("websocket disconnected");
    });

    // Websocket endpoints

    // when you first connect, display the first image
    socket.on('display-initial-data', function (req) {
        console.log("display-initial-data: checking if data exists");
        db.serialize(function () {
            db.get("SELECT date_time as dt, img_src as img, notes as notes, coverage as coverage, depth as depth FROM snowimages WHERE hour = 12 and date_time = '11/20/2014'", function (err, row) {
                if (err) return console.error(err);
                console.log(row.dt);
                socket.emit("refresh-data", row);
            });
        });
    });

    // when you click on the next button, first update the database with the values which are currently in the fields
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

            // Then, actually get the subsequent day
            db.serialize(function () {
                console.log("the incoming date time is " + req.dt);
                
                var date = new Date(req.dt);
                date.setDate(date.getDate() + 1);
                
                if (date.getMonth() <= 8 && date.getDate() <= 9) {
                    var fixedDate = ('0' + (date.getMonth() + 1) + '/0' + date.getDate() + '/' + date.getFullYear());
                } else if (date.getMonth() <= 8 && date.getDate() > 9) {
                    var fixedDate = ('0' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear());
                } else if (date.getMonth() > 8 && date.getDate() <= 9) {
                    var fixedDate = ((date.getMonth() + 1) + '/0' + date.getDate() + '/' + date.getFullYear());
                } else {
                    var fixedDate = ((date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear());
                }

                console.log("the parsed date time with an extra day is " + fixedDate);

                // here's where the next date goes
                var sql = "SELECT date_time as dt, img_src as img, notes as notes, coverage as coverage, depth as depth FROM snowimages WHERE date_time = ? and hour = 12 LIMIT 1";
                db.get(sql, [fixedDate], function (err, row) {
                    if (err) return console.error(err);
                    console.log(row);
                    var updated_data = row;
                    socket.emit("updated-date", updated_data);
                });
            });
        }
    });

    // this needs to get a certain day
    socket.on("get-date-data", function (req) {
        if (req) {
            console.log("the socket is sending me " + req.date.date);
            //var date = new Date(req.date.replace('/', '-'));
            //date.setHours(date.getHours() + 12);
            //log(date);
            db.serialize(function () {
                var sql = "SELECT date_time as dt, img_src as img, notes as notes, coverage as coverage, depth as depth FROM snowimages WHERE date_time = ? and hour = 12";
                db.get(sql, req.date, function (err, row) {
                    if (err) return console.error(err);
                    log(row);
                    socket.emit("refresh-data", row);
                });
            });
        }
    });

    // this gets the 9 am picture
    socket.on("modal9", function (req) {
        if (req) {
            db.serialize(function () {
                var sql = "SELECT img_src as img FROM snowimages WHERE date_time = ? and hour = 9";
                db.get(sql, req.date, function (err, row) {
                    if (err) return console.error(err);
                    console.log("the image to get is " + row.img);
                    socket.emit("modal1", row.img);
                });
            });
        }
    });

    // this gets the 3 pm picture
    socket.on("modal3", function (req) {
        if (req) {
            db.serialize(function () {
                var sql = "SELECT img_src as img FROM snowimages WHERE date_time = ? and hour = 3";
                db.get(sql, req.date, function (err, row) {
                    if (err) return console.error(err);
                    console.log("the image to get is " + row.img);
                    socket.emit("modal2", row.img);
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



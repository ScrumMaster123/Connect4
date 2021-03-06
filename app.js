var express = require("express");
var http = require("http");

var port = process.argv[2];
var app = express();

app.use(express.static(__dirname + "/public"));
http.createServer(app).listen(port);

var mainMenuRouter = require("./routes/mainMenu");
var findMatchRouter = require("./routes/findMatch");

// find match button is pressed
app.use("/", function(req, res){

    res.sendFile('public/Connect4MainMenu.html', { root: "./" });

});

app.use("/Connect4FindMatch", findMatchRouter);



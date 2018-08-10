var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var handlebars = require('express-handlebars');

// Require the routes and use them
var routes = require('./routes/routes');


// Initialize Express
var app = express();
// app.use(express.static('public'))


// set up the handlebars view engine

app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Use morgan for debug logging
app.use(logger("dev"));

// set up body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

// set the public static directory
app.use(express.static('public'));

// Import routes
app.use('/', routes);



// Launch App
var port = process.env.PORT || 3000;


app.listen(port, function()
{
  console.log('Running on port: ' + port);
});
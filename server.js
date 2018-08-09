var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var	Article = require('./models/article.js');
let Note = require('./models/comments');
var axios = require("axios");

var PORT = 3000;

// Require all models
var db = require("./models");

// Initialize Express
var app = express();
app.get("/", function(req, res) {
    // Make a request call to grab the HTML body from the site of your choice
    request("https://www.bbc.co.uk/news/blogs/news_from_elsewhere", function(error, response, html) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(html);

    // An empty array to save the data that we'll scrape
    var results = [];

    // Select each element in the HTML body from which you want information.
    // NOTE: Cheerio selectors function similarly to jQuery's selectors,
    // but be sure to visit the package's npm page to see how it works
        $("div.story-inner").each(function(i, element) {

            let image = $(element).find("img.js-image-replace").attr("src");
            let title = $(element).find("a").find("span.cta").text();
            let link = $(element).find("a").attr("href");
            let summary = $(element).find("div.story-body__inner").find("p").text();

            // Save these results in an object that we'll push into the results array we defined earlier
            results.push({
            image: image,
            title: title,
            link: link,
            summary: summary
            });
            
        });
    });
    db.Article.create(results)
    .then(function(dbArticle) {
    // View the added result in the console
    console.log(dbArticle);
    })
    .then(function() {
        db.Article.find({})
        .then(function(articles) {
            // If we were able to successfully find Articles, send them back to the client
        res.json(articles);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
        res.json(err);
        })
    }).catch(function(err) {
        // If an error occurred, send it to the client
        return res.json(err);
    })
    // Log the results once you've looped through each of the elements found with cheerio
    console.log(results);
});
app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
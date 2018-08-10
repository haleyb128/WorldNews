var cheerio = require('cheerio');

// get html
var request = require('request');


// Use Article model
var Article = require('../models/Article');

// define the site we want to scrape
var website = 'https://www.bbc.co.uk/news/blogs/news_from_elsewhere';

function scrapedNews(callback) {
  request(website, function(error, response, html) {
    if (error) console.log("Error Scraping", error);

    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    //Target articles by tag
    $("div.story-inner").each(function(i, element) {

      let image = $(element).find("img.js-image-replace").attr("src");
      let title = $(element).find("a").find("span.cta").text();
      let link = $(element).find("a").attr("href");
      let summary = $(element).find("div.story-body__inner").find("p").text();
      console.log(link);
      var scrapeArticle = new Article(
        {
          image: image,
          title: title,
          link: link,
          summary: summary
        });
        scrapeArticle.save(function(error) 
        {
          if (error) console.log("Error Saving Scrape", error);
        });
    });
      
  });

    callback();
};
      

exports.scrapedNews = scrapedNews;
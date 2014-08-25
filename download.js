var cheerio = require('cheerio');
var request = require('request');
var http = require('http');
var async = require('async');
var fs = require('fs');
var path = require('path');

var maxPages = 50;
var existingFiles = fs.readdirSync("./fox_backgrounds").map(filenameWithoutSize);

var pageQueue = async.queue(function(url, callback) {
  request(url, function(err, resp, body){
    $ = cheerio.load(body);
    $(".paper").each(function() {
      var linkSet = [];
      $(this).find(".btn_download").each(function(j, link) {
        if ($(link).text().indexOf("×") > -1) {
          linkSet.push([$(link).text().split("×")[0], $(link).attr("href")]);
        }
      });
      linkSet.sort(function(a, b) { return parseInt(a[0]) - parseInt(b[0]); }).reverse();
      if (linkSet.length) {
        // linkSet[0] is the best link, download its href
        downloadQueue.push(linkSet[0][1]);
      }
    });
    callback();
  });
}, 1);

var downloadQueue = async.queue(function(url, callback) {
  // download and save file as long as we dont already have it.
  if (existingFiles.indexOf(filenameWithoutSize(path.basename(url))) === -1) {
    var file = fs.createWriteStream("./fox_backgrounds/" + path.basename(url));
    console.log("downloading", path.basename(url));
    file.on("close", callback);
    var req = http.get(url, function(res) {
      res.pipe(file);
    });
  } else {
    console.log("skipping", path.basename(url));
    callback();
  }
}, 2);

function getBackgrounds() {
  base = 'http://www.thefoxisblack.com/category/the-desktop-wallpaper-project/page/';
  for (var i = 1; i < maxPages; i++) {
    pageQueue.push(base + i + "/");
  }
}

function filenameWithoutSize(filename) {
  var match = filename.match(/^(.+)-(\d+x\d+)\.(.+)$/);
  if (match) { return match[1]; }
}

getBackgrounds();

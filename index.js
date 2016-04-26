

var twit = require("twit");
var secret = require("./secret.js");
var twitter = new twit(secret);
var natural = require('natural');
var Parse = require('parse/node');
Parse.initialize("MIa0M15IiwcANxCGEFgu0kEq6MLVSOnl0zQJmEhD", "yKDfE5zlJf4BBK7xUDsQzBpo82f9z33GKmpWetvu");

var tokenizer = new natural.WordTokenizer();
var stories = new Parse.Object.extend("Stories");

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function matchRE(re, text) {
  var wordArray = tokenizer.tokenize(text);
  for (var i = 0; i < wordArray.length; i++) {
    if (re.test(wordArray[i])) {
      return true;
    }
  }
  return false;
}

function search(category, mention) {

  var query = new Parse.Query(stories);

  query.limit(9);
  query.equalTo('category', category);
  query.descending("createdAt");


  query.find().then(function (stories) {
    // var a = random(0, 8);
    var story = stories[random(0, 9)].attributes;
    var result = "@" + mention + " " + story.title + " " + story.url;
    console.log(result);
    post(result);
  }, function (error) {
    // body
    var message = '@' + mention + ' ' + ' Opps couldnt find stories, try again later.';
    post(message)
  });

}

function post(content) {
  twitter.post('statuses/update', { status: content }, function (err, data, response) {
  })
}

var stream = twitter.stream('statuses/filter', { track: '#GhanaNews' })

stream.on('tweet', function (tweet) {
  var mention = tweet.user.screen_name;
  var text = tweet.text;

  // RegExes
  var politicRe = /^politics$/;
  var bussinessRE = /^bussiness$/;
  var entertainmentRE = /^entertainment$/;
  var sportsRE = /^sports$/;
  var topRe = /^top$/;

  if (matchRE(entertainmentRE, text)) {
    search("entertainment", mention)
  } else if (matchRE(topRe, text)) {
    search("top", mention)
  } else if (matchRE(politicRe, text)) {
    search("politics", mention);
  } else if (matchRE(bussinessRE, text)) {
    search("bussiness", mention);
  } else if (matchRE(sportsRE, text)) {
    search("sports", mention)
  } else {
    post("Hey " + "@" + mention + " . So, I've heard got all the news happening now, tweet at me with 1 of [bussiness,top,entertainment,sports,politics]");
  }

})
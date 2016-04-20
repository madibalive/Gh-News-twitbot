var twit = require("twit");
var secret = require("./secret.js");
var twitter = new twit(secret);
var natural = require('natural');
var Parse = require('Parse');

var tokenizer = new natural.WordTokenizer();

//schedule a post every one hour 
// randomly pick a topic and the lastest to retweet

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

    var stories = new Parse.Object.extend("story");
    var query = new Parse.Query(stories);

    query.limit(1);
    query.equalTo('category', category);
    query.exist('title');
    query.exist('url');

    query.find().then(function (stories) {
        var result = "@" + mention + " " + stories.title + stories.url;
        post(result);
    }, function (error) {
        // body
        var message = 'Opps couldnt find stories, try again later, while i fix the issue ';
        post(message)
    });

}

function post(content) {
    twitter.post('statuses/update', { status: content }, function (err, data, response) {
    })
}

var stream = twitter.stream('statuses/filter', { track: '@SouthBotFunWest' })

stream.on('tweet', function (tweet) {
    var mention = tweet.user.screen_name;
    var text = tweet.text;

    // RegExes
    var politicRe = /^policti$/;
    var bussinessRE = /^bussiness$/;
    var entertainmentRE = /^entertainment$/;
    var sportsRE = /^sports$/;

    if (matchRE(entertainmentRE, text)) {
        search("entertainment", mention)
    } else if (matchRE(sportsRE, text)) {
        search("sports", mention)
    } else if (matchRE(bussinessRE, text)) {
        search("bussiness", mention);
    } else if (matchRE(politicRe, text)) {
    } else {
        post("Hey " + "@" + mention + " . So, I've heard got all the news stories happening now in Gh. Or you know, tweet at me with one of these [bussiness, entertainment, sports, politics]");

    }

})
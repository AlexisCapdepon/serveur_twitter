var server = require('http').createServer(handler)
var io = require('socket.io')(server);
var fs = require('fs');
var Twitter = require('twitter');

server.listen(8090);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}
var client = new Twitter({
  consumer_key: 'DigQ3aca26e4WkHmqIp6WZKd7',
  consumer_secret: 'g7vwiQWtFyC2NcXBCDLyZJKDaHNkGzoyTGTfEhUyQBKL3nUiak',
  access_token_key: '1898128146-neW97TiYXQOfBFeOhmTKgRMI2taXvnIShKiYSnH',
  access_token_secret: 'TGQRKe4nKjrhaeM8cPAcQu7IOEtC1aaiB4YoTJtMDJS5b'
});

io.on('connection', function (socket){
  socket.emit('connection','connect');
});

var stream = client.stream('statuses/filter', {track: 'travel', tweet_mode: 'extended'});
stream.on('data', function(tweet) {
  io.sockets.emit('tweets',formatter(tweet));
});


/**
 * formatted data.
 * @formatter
 * @param {object} tweet -tweet from the api.
 * @return {object} tweet
 */
var formatter = function (tweet) {
  var timenow = new Date(tweet.created_at).toDateString();
  console.log(tweet.reply_count,tweet.retweet_count,tweet.favorite_count);
  if(tweet.truncated){
    return {
      'created_at': timenow,
      'id' : tweet.id,
      'text': tweet.extended_tweet.full_text,
      'user':{
        'name': tweet.user.name,
        'avatar': tweet.user.profile_image_url_https
      },
      'reply_count': tweet.reply_count,
      'retweet_count': tweet.retweet_count,
      'favorite_count': tweet.favorite_count,
      'coordonates': tweet.user.lang
    }
  }
  return {
    'created_at': timenow,
    'id' : tweet.id,
    'text': tweet.text || tweet.extended_tweet.full_text,
    'user':{
      'name': tweet.user.name,
      'avatar': tweet.user.profile_image_url_https
    },
    'reply_count': tweet.reply_count,
    'retweet_count': tweet.retweet_count,
    'favorite_count': tweet.favorite_count,
    'coordonates': tweet.user.lang
  }
}

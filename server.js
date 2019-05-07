const express = require('express')
const bodyParser = require('body-parser')
const spotify = require('./credentials/spotify');
const twitter = require('./credentials/twitter');
const PORT = process.env.PORT || 3005


let app = express()

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json())

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/yelp', (mainreq, mainres) => {
    mainres.status(200).send(JSON.stringify({
        'token': process.env.YELP_KEY
    }));
});

app.get('/spotify', (mainreq, mainres) => {
    spotify.get_token(mainreq, mainres, spotify);
});

app.get('/twitter', (mainreq, mainres) => {
    twitter.get_token(mainreq, mainres, twitter);
});

app.get('/spotify-proxy*', (mainreq, mainres) => {
    // To test: 
    // http://localhost:3005/spotify-proxy/v1/search?q=beyonce&type=track
    spotify.forward_request(mainreq, mainres, spotify);
});

app.get('/twitter-proxy*', (mainreq, mainres) => {
    // To test: 
    // http://localhost:3005/twitter-proxy/1.1/search/tweets.json?q=rainbows
    twitter.forward_request(mainreq, mainres, twitter);
});

app.listen(PORT)
console.log('Server running: http://localhost:' + PORT)
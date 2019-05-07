const express = require('express')
const bodyParser = require('body-parser')
const request = require('request');

const spotify = require('./api-wrappers/spotify');
const twitter = require('./api-wrappers/twitter');
const flickr = require('./api-wrappers/flickr');
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
    // Original:    https://api.spotify.com/v1/search?q=beyonce&type=track  
    // Proxy:       http://localhost:3005/spotify-proxy/v1/search?q=beyonce&type=track
    spotify.forward_request(mainreq, mainres);
});

app.get('/twitter-proxy*', (mainreq, mainres) => {
    // Original:    https://api.twitter.com/1.1/search/tweets.json?q=rainbows
    // Proxy:       http://localhost:3005/twitter-proxy/1.1/search/tweets.json?q=rainbows
    twitter.forward_request(mainreq, mainres);
});

app.get('/flickr-proxy-simple/*', (mainreq, mainres) => {
    // Original:    https://api.flickr.com/services/feeds/photos_public.gne?tags=rainbow&format=json
    // Proxy:       http://localhost:3005/flickr-proxy-simple/?tags=rainbow
    flickr.forward_request_and_simplify(mainreq, mainres);
});

app.get('/flickr-proxy/*', (mainreq, mainres) => {
    // Original:    https://api.flickr.com/services/feeds/photos_public.gne?tags=rainbow&format=json
    // Proxy:       http://localhost:3005/flickr-proxy/?tags=rainbow
    flickr.forward_request(mainreq, mainres);
});
app.listen(PORT, () => {
    console.log(`API Helper App listening on port ${PORT}!`)
});
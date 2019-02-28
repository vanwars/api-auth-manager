const express = require('express')
const logger = require('morgan')
const errorhandler = require('errorhandler')
const bodyParser = require('body-parser')
const request = require('request');
const spotify = require('./spotify');
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
    }))
})

app.get('/spotify', (mainreq, mainres) => {
    const currentTime = Date.now()

    if (!spotify.timeOfTokenCreation) {
        spotify.timeOfTokenCreation = Date.now()
    }

    const tokenAgeInMinutes = Math.floor((Date.now() - spotify.timeOfTokenCreation)/60000)

    /*
        these spotify tokens expire every hour, so we need to refresh them.
        To be safe, we won't send a token to the client
        if the token is more than 45 minutes old
    */
    if (spotify.access_token && tokenAgeInMinutes < 45) {
        spotify.message.token_age_minutes = tokenAgeInMinutes
        mainres.status(200).send(JSON.stringify(spotify.message))
    } else {
        spotify.timeOfTokenCreation = Date.now()
        request(spotify.get_spotify_opts(), function (err, res, body) {
            spotify.access_token = body['access_token']
            spotify.message = {
                token: spotify.access_token,
                expires_in: body['expires_in'],
                token_age_minutes: 0
            }
            try {
                mainres.status(200).send(JSON.stringify(spotify.message))
            } catch(error) {
                console.log("errored the first time: ", error)
            }
        });
    }

})

app.listen(PORT)

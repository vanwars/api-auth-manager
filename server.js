const express = require('express')
const bodyParser = require('body-parser')
var handlebars  = require('express-handlebars');

const yelp = require('./api-wrappers/yelp');
const spotify = require('./api-wrappers/spotify');
const twitter = require('./api-wrappers/twitter');
const flickr = require('./api-wrappers/flickr');
const PORT = process.env.PORT || 3005

const app = express()
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use('/static', express.static('views'))

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json())

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (mainreq, mainres) => {
    base = '//' + mainreq.get('host')
    instructions = {
        'yelp': {
            'name': 'Yelp',
            'key': yelp.get_key_url(mainreq),
            'source': yelp.baseURI,
            'proxy': yelp.get_url(mainreq),
            'example': yelp.get_sample_url(mainreq)
        },
        'spotify': {
            'name': 'Spotify',
            'key': spotify.get_key_url(mainreq),
            'source': spotify.baseURI,
            'proxy': spotify.get_url(mainreq),
            'example': spotify.get_sample_url(mainreq)
        },
        'twitter': {
            'name': 'Twitter',
            'key': twitter.get_key_url(mainreq),
            'source': twitter.baseURI,
            'proxy': twitter.get_url(mainreq),
            'example': twitter.get_sample_url(mainreq)
        },
        'flickr-standard': {
            'name': 'Flickr',
            'source': flickr.baseURI,
            'proxy': flickr.get_url(mainreq),
            'example': flickr.get_sample_url(mainreq)
        },
        'flickr-simplified': {
            'name': 'Flickr Simplified',
            'source': flickr.baseURI,
            'proxy': flickr.get_url_simple(mainreq),
            'example': flickr.get_sample_url_simple(mainreq)
        }
    }
    mainres.render('index', { 
        title: 'Proxy Helpers Documentation', 
        instructions: instructions
    })

});

app.get(yelp.keyURI, (mainreq, mainres) => {
    mainres.status(200).send(JSON.stringify({
        'token': yelp.get_key()
    }));
});

app.get(spotify.keyURI, (mainreq, mainres) => {
    spotify.get_token(mainreq, mainres, spotify);
});

app.get(twitter.keyURI, (mainreq, mainres) => {
    twitter.get_token(mainreq, mainres, twitter);
});

app.get(yelp.proxyURI + '/*', (mainreq, mainres) => {
    yelp.forward_request(mainreq, mainres);
});

app.get(spotify.proxyURI + '/*', (mainreq, mainres) => {
    spotify.forward_request(mainreq, mainres);
});

app.get(twitter.proxyURI + '/*', (mainreq, mainres) => {
    twitter.forward_request(mainreq, mainres);
});

app.get('/flickr-proxy-simple/*', (mainreq, mainres) => {
    flickr.forward_request_and_simplify(mainreq, mainres);
});

app.get(flickr.proxyURI + '/*', (mainreq, mainres) => {
    flickr.forward_request(mainreq, mainres);
});

app.listen(PORT, () => {
    console.log(`API Helper App listening on port ${PORT}!`)
});
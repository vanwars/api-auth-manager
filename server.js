const express = require('express')
const bodyParser = require('body-parser')
var handlebars  = require('express-handlebars');

const yelp = require('./api-wrappers/yelp');
const spotify = require('./api-wrappers/spotify');
const twitter = require('./api-wrappers/twitter');
const flickr = require('./api-wrappers/flickr');
const youtube = require('./api-wrappers/youtube');
const apis = require('./api-wrappers/config');
const PORT = process.env.PORT || 3005

const app = express()
app.engine('handlebars', handlebars());
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
    mainres.render('index', { 
        instructions_full: apis.get_documentation_full(mainreq, mainres),
        instructions_simplified: apis.get_documentation_simplified(mainreq),
        instructions: apis.get_documentation(mainreq)
    })
});

// Dynamically generate routes:
for (route of spotify.routes) {
    app.get(route.url, route.routing_function);
}
for (route of yelp.routes) {
    app.get(route.url, route.routing_function);
}
for (route of youtube.routes) {
    app.get(route.url, route.routing_function);
}
for (route of flickr.routes) {
    app.get(route.url, route.routing_function);
}



app.get(twitter.keyURI, (mainreq, mainres) => {
    twitter.get_token(mainreq, mainres, twitter);
});

app.get(twitter.proxyURI + '/*', (mainreq, mainres) => {
    twitter.forward_request(mainreq, mainres);
});

// app.get(youtube.proxyURISimple + '*', (mainreq, mainres) => {
//     youtube.forward_request_and_simplify(mainreq, mainres);
// });

// app.get(youtube.proxyURI + '/*', (mainreq, mainres) => {
//     youtube.forward_request(mainreq, mainres);
// });

// app.get(flickr.proxyURISimple + '/*', (mainreq, mainres) => {
//     flickr.forward_request_and_simplify(mainreq, mainres);
// });

// app.get(flickr.proxyURI + '/*', (mainreq, mainres) => {
//     flickr.forward_request(mainreq, mainres);
// });

app.listen(PORT, () => {
    console.log(`API Helper App listening on port ${PORT}!`)
});
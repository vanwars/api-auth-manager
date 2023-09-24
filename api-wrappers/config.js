const yelp = require("./yelp");
const spotify = require("./spotify");
// const twitter = require('./twitter-now-dead-thanks-elon-musk');
const flickr = require("./flickr");
const youtube = require("./youtube");
const sendgrid = require("./sendgrid");

// build routes from modules
exports.get_routes = () => {
    const routes = [];
    routes.push(
        ...spotify.routes,
        ...yelp.routes,
        ...youtube.routes,
        ...flickr.routes,
        // ...twitter.routes,
        ...sendgrid.routes
    );
    return routes;
};

exports.get_documentation = (mainreq) => {
    let documentation = {};
    documentation = Object.assign(
        documentation,
        exports.get_documentation_simplified(mainreq)
    );
    documentation = Object.assign(
        documentation,
        exports.get_documentation_full(mainreq)
    );
    return documentation;
};
exports.get_documentation_full = (mainreq) => {
    return {
        youtube: youtube.get_documentation(mainreq, (doc_type = "standard")),
        flickr: flickr.get_documentation(mainreq, (doc_type = "standard")),
        yelp: yelp.get_documentation(mainreq, (doc_type = "standard")),
        spotify: spotify.get_documentation(mainreq, (doc_type = "standard")),
        // twitter: twitter.get_documentation(mainreq, (doc_type = "standard")),
    };
};
exports.get_documentation_simplified = (mainreq) => {
    return {
        "youtube-simplified": youtube.get_documentation(
            mainreq,
            (doc_type = "simple")
        ),
        "flickr-simplified": flickr.get_documentation(
            mainreq,
            (doc_type = "simple")
        ),
        "yelp-simplified": yelp.get_documentation(
            mainreq,
            (doc_type = "simple")
        ),
        "spotify-simplified": spotify.get_documentation(
            mainreq,
            (doc_type = "simple")
        ),
        // "twitter-simplified": twitter.get_documentation(
        //     mainreq,
        //     (doc_type = "simple")
        // )
    };
};

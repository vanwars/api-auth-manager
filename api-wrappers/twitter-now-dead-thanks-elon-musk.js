const api_wrapper = require("./index");

exports.access_token = null;
exports.timeOfTokenCreation = null;
exports.message = null;
exports.baseURI = "https://api.twitter.com";
exports.proxyURI = "/twitter";
exports.proxyURISimple = "/twitter/simple";

const keyURI = "/twitter/key";
const documentationURI =
    "https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets.html";

// const get_key_url = (mainreq) => {
//     base = '//' + mainreq.get('host')
//     return base + exports.keyURI
// };

const get_url = (mainreq) => {
    base = "//" + mainreq.get("host");
    return base + exports.proxyURI + "/";
};

const get_url_simple = (mainreq) => {
    return "//" + mainreq.get("host") + exports.proxyURISimple + "/";
};

const get_token = (mainreq, mainres) => {
    api_wrapper.get_token(mainreq, mainres, exports);
};

const forward_request = (mainreq, mainres) => {
    api_wrapper.forward_request(mainreq, mainres, exports);
};
const forward_request_and_simplify = (mainreq, mainres) => {
    api_wrapper.forward_request(
        mainreq,
        mainres,
        exports,
        _simplify,
        exports.proxyURISimple
    );
};

const _simplify = (body) => {
    body = JSON.parse(body);
    const data = [];
    for (item of body.statuses) {
        const tweet = {
            id: item.id,
            text: item.text,
            retweet_count: item.retweet_count,
            screen_name: item.user.screen_name,
        };
        try {
            tweet.image_url = item.entities.media[0].media_url;
        } catch (ex) {
            //do nothing
        }
        data.push(tweet);
    }
    return data;
};

exports.get_opts = () => {
    return api_wrapper.get_opts(
        exports.baseURI + "/oauth2/token",
        process.env.TWITTER_KEY,
        process.env.TWITTER_SECRET,
        "client_credentials"
    );
};

exports.get_documentation = (mainreq, doc_type = "standard") => {
    if (doc_type === "simple") {
        return {
            name: "Twitter",
            is_simplified: true,
            icon: '<i class="fab fa-twitter"></i>',
            endpoints: [
                {
                    name: "Tweet Search (Simple)",
                    documentation: documentationURI,
                    source: exports.baseURI,
                    proxy: get_url_simple(mainreq),
                    example:
                        get_url_simple(mainreq) +
                        "1.1/search/tweets.json?q=cats",
                },
            ],
        };
    }
    return {
        name: "Twitter",
        is_simplified: false,
        icon: '<i class="fab fa-twitter"></i>',
        endpoints: [
            {
                name: "Tweet Search",
                documentation: documentationURI,
                source: exports.baseURI,
                proxy: get_url(mainreq),
                example: get_url(mainreq) + "1.1/search/tweets.json?q=cats",
            },
        ],
    };
};

// Order matter! Key First.
exports.routes = [
    {
        url: keyURI,
        routing_function: get_token,
    },
    {
        url: exports.proxyURISimple + "/*",
        routing_function: forward_request_and_simplify,
    },
    {
        url: exports.proxyURI + "/*",
        routing_function: forward_request,
    },
];

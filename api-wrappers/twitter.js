const api_wrapper = require('./index');

exports.access_token = null;
exports.timeOfTokenCreation = null;
exports.message = null;
exports.baseURI = 'https://api.twitter.com';
exports.proxyURI = '/twitter';

const keyURI = '/twitter/key';
const documentationURI = 'https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets.html';

// const get_key_url = (mainreq) => {
//     base = '//' + mainreq.get('host')
//     return base + exports.keyURI
// };

const get_url = (mainreq) => {
    base = '//' + mainreq.get('host')
    return base + exports.proxyURI + '/'
};
const get_sample_url = (mainreq) => {
    return get_url(mainreq) + '1.1/search/tweets.json?q=cats'
};

const get_token = (mainreq, mainres) => {
    api_wrapper.get_token(mainreq, mainres, exports);
};

const forward_request = (mainreq, mainres) => {
    api_wrapper.forward_request(mainreq, mainres, exports);
};

exports.get_opts = () => {
    return api_wrapper.get_opts(
        exports.baseURI + '/oauth2/token',
        process.env.TWITTER_KEY,
        process.env.TWITTER_SECRET,
        'client_credentials'
    );
};

exports.get_documentation = (mainreq, doc_type='standard') => {
    if (doc_type === 'standard') {
        return {
            'name': 'Twitter',
            'icon': '<i class="fab fa-twitter"></i>',
            'endpoints': [{
                'name': 'Tweet Search',
                'documentation': documentationURI,
                'source': exports.baseURI,
                'proxy': get_url(mainreq),
                'example': get_sample_url(mainreq)
            }]
        };
    }
};

// Order matter! Key First.
exports.routes = [{
    'url': keyURI,
    'routing_function': get_token
}, {
    'url': exports.proxyURI + '/*',
    'routing_function': forward_request
}];

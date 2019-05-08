const api_wrapper = require('./index');

exports.access_token = null;
exports.timeOfTokenCreation = null;
exports.message = null;
exports.baseURI = 'https://api.twitter.com/';
exports.proxyURI = '/twitter-proxy';
exports.keyURI = '/twitter';

exports.get_token = api_wrapper.get_token;

exports.get_key_url = (mainreq) => {
    base = mainreq.protocol + '://' + mainreq.get('host')
    return base + exports.keyURI
};
exports.get_url = (mainreq) => {
    base = mainreq.protocol + '://' + mainreq.get('host')
    return base + exports.proxyURI + '/'
};
exports.get_sample_url = (mainreq) => {
    return exports.get_url(mainreq) + '1.1/search/tweets.json?q=cats'
};

exports.forward_request = (mainreq, mainres) => {
    api_wrapper.forward_request(mainreq, mainres, exports);
};

exports.get_opts = () => {
    return api_wrapper.get_opts(
        exports.baseURI + 'oauth2/token',
        process.env.TWITTER_KEY,
        process.env.TWITTER_SECRET,
        'client_credentials'
    );
};

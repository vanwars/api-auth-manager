const credentials = require('./index');

exports.access_token = null;
exports.timeOfTokenCreation = null;
exports.message = null;
exports.baseURI = 'https://api.twitter.com/'
exports.proxyURI = '/twitter-proxy'

exports.forward_request = credentials.forward_request;
exports.get_token = credentials.get_token;

exports.get_opts = () => {
    return credentials.get_opts(
        exports.baseURI + 'oauth2/token',
        process.env.TWITTER_KEY,
        process.env.TWITTER_SECRET,
        'client_credentials'
    );
};

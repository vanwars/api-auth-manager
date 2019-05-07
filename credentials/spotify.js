const credentials = require('./index');

exports.access_token = null;
exports.timeOfTokenCreation = null;
exports.message = null;
exports.baseURI = 'https://api.spotify.com';
exports.proxyURI = '/spotify-proxy'

exports.forward_request = credentials.forward_request;
exports.get_token = credentials.get_token;

exports.get_opts = () => {
    return credentials.get_opts(
        'https://accounts.spotify.com/api/token',
        process.env.SPOTIFY_KEY,
        process.env.SPOTIFY_SECRET,
        'client_credentials&scope=playlist-modify-public playlist-modify-private'
    );
};
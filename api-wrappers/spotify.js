const api_wrapper = require('./index');
exports.access_token = null;
exports.timeOfTokenCreation = null;
exports.message = null;

exports.baseURI = 'https://api.spotify.com';
exports.proxyURI = '/spotify'
const keyURI = '/spotify/key';

const get_key_url = (mainreq) => {
    return '//' + mainreq.get('host') + keyURI
};
const get_url = (mainreq) => {
    return '//' + mainreq.get('host') + exports.proxyURI + '/'
};

const get_token = (mainreq, mainres) => {
    api_wrapper.get_token(mainreq, mainres, exports);
};

const forward_request = (mainreq, mainres) => {
    api_wrapper.forward_request(mainreq, mainres, exports);
};

exports.get_opts = () => {
    return api_wrapper.get_opts(
        'https://accounts.spotify.com/api/token',
        process.env.SPOTIFY_KEY,
        process.env.SPOTIFY_SECRET,
        'client_credentials&scope=playlist-modify-public playlist-modify-private'
    );
};

exports.get_documentation = (mainreq, doc_type='standard') => {
    if (doc_type === 'standard') {
        return {
            'name': 'Spotify',
            'icon': '<i class="fab fa-spotify"></i>',
            'endpoints': [{
                    'name': 'Spotify Tracks',
                    'is_simplified': false,
                    'documentation': 'https://developer.spotify.com/documentation/web-api/reference/search/search/',
                    'source': exports.baseURI,
                    'proxy': get_url(mainreq),
                    'example': get_url(mainreq) + 'v1/search?q=beyonce&type=track'
                }, {
                    'name': 'Spotify Artists',
                    'is_simplified': false,
                    'documentation': 'https://developer.spotify.com/documentation/web-api/reference/search/search/',
                    'source': exports.baseURI,
                    'proxy': get_url(mainreq),
                    'example': get_url(mainreq) + 'v1/search?q=beyonce&type=artist'
                }
            ]
        };
    }
};

exports.routes = [{
    'url': exports.proxyURI + '/*',
    'routing_function': forward_request
}, {
    'url': keyURI,
    'routing_function': get_token
}];


api_wrapper.enforce_interface('Spotify', exports);
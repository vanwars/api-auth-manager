const api_wrapper = require('./index');

exports.access_token = null;
exports.timeOfTokenCreation = null;
exports.message = null;
exports.baseURI = 'https://api.spotify.com';
exports.proxyURI = '/spotify-proxy'
exports.keyURI = '/spotify';
exports.documentationURI = 'https://developer.spotify.com/documentation/web-api/reference/search/search/';

exports.get_token = api_wrapper.get_token;

exports.get_documentation = (mainreq) => {
    return {
        'name': 'Spotify',
        'icon': '<i class="fab fa-spotify"></i>',
        'endpoints': [{
                'name': 'Tracks',
                'is_simplified': false,
                'documentation': exports.documentationURI,
                'source': exports.baseURI,
                'proxy': exports.get_url(mainreq),
                'example': exports.get_sample_url(mainreq)
            }, {
                'name': 'Artists',
                'is_simplified': false,
                'documentation': exports.documentationURI,
                'source': exports.baseURI,
                'proxy': exports.get_url(mainreq),
                'example': exports.get_sample_url(mainreq)
            }
        ]
    };
}

exports.get_key_url = (mainreq) => {
    base = '//' + mainreq.get('host')
    return base + exports.keyURI
};
exports.get_url = (mainreq) => {
    base = '//' + mainreq.get('host')
    return base + exports.proxyURI + '/'
};
exports.get_sample_url = (mainreq) => {
    return exports.get_url(mainreq) + 'v1/search?q=beyonce&type=track'
};

exports.forward_request = (mainreq, mainres) => {
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
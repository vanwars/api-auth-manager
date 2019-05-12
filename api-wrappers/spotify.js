const api_wrapper = require('./index');
exports.access_token = null;
exports.timeOfTokenCreation = null;
exports.message = null;

exports.baseURI = 'https://api.spotify.com';
exports.proxyURI = '/spotify'
exports.proxyURISimple = '/spotify/simple'
const keyURI = '/spotify/key';
const documentationURI = 'https://developer.spotify.com/documentation/web-api/reference/search/search/';
const icon = '<i class="fab fa-spotify"></i>';
const get_key_url = (mainreq) => {
    return '//' + mainreq.get('host') + keyURI
};
const get_url = (mainreq) => {
    return '//' + mainreq.get('host') + exports.proxyURI + '/'
};
const get_url_simple = (mainreq) => {
    return '//' + mainreq.get('host') + exports.proxyURISimple + '/';
};

const get_token = (mainreq, mainres) => {
    api_wrapper.get_token(mainreq, mainres, exports);
};

const forward_request = (mainreq, mainres) => {
    api_wrapper.forward_request(mainreq, mainres, exports);
};

const forward_request_and_simplify = (mainreq, mainres) => {
    console.log('forward_request_and_simplify...', exports.proxyURISimple);
    api_wrapper.forward_request(mainreq, mainres, exports, _simplify, exports.proxyURISimple);
    //_issue_request(mainreq, mainres, exports.proxyURISimple, _simplify)
};

const _simplify = (body) => {
    body = JSON.parse(body)
    const data = [];
    for (item of body.tracks.items) {
        data.push({
            id: item.id,
            name: item.name,
            artist_name: item.artists[0].name,
            preview_url: item.preview_url
        });
    }
    return data;
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
    if (doc_type === 'simple') {
        return {
            'name': 'Spotify',
            'is_simplified': true,
            'icon': icon,
            'endpoints': [{
                'name': 'Spotify Tracks (Simplified)',
                'documentation': documentationURI,
                'source': exports.baseURI,
                'proxy': get_url_simple(mainreq),
                'example': get_url_simple(mainreq) + 'v1/search?q=beyonce&type=track'
            }]
        };
    }
    return {
        'name': 'Spotify',
        'icon': icon,
        'endpoints': [{
                'name': 'Spotify Tracks',
                'is_simplified': false,
                'documentation': documentationURI,
                'source': exports.baseURI,
                'proxy': get_url(mainreq),
                'example': get_url(mainreq) + 'v1/search?q=beyonce&type=track'
            }, {
                'name': 'Spotify Artists',
                'is_simplified': false,
                'documentation': documentationURI,
                'source': exports.baseURI,
                'proxy': get_url(mainreq),
                'example': get_url(mainreq) + 'v1/search?q=beyonce&type=artist'
            }
        ]
    };
};

// Order matter! Key First.
exports.routes = [{
    'url': keyURI,
    'routing_function': get_token
}, {
    'url': exports.proxyURISimple + '/*',
    'routing_function': forward_request_and_simplify
}, {
    'url': exports.proxyURI + '/*',
    'routing_function': forward_request
}];


api_wrapper.enforce_interface('Spotify', exports);
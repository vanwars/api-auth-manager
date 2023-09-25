const api_wrapper = require("./index");
const utilities = require("./utilities");

exports.access_token = null;
exports.timeOfTokenCreation = null;
exports.message = null;

exports.baseURI = "https://api.spotify.com";
exports.proxyURI = "/spotify";
exports.proxyURISimple = "/spotify/simple";
const keyURI = "/spotify/key";
const documentationURI =
    "https://developer.spotify.com/documentation/web-api/reference/search/search/";
const icon = '<i class="fab fa-spotify"></i>';

const get_url = (mainreq) => {
    const protocol = mainreq.protocol + "://";
    return protocol + mainreq.get("host") + exports.proxyURI + "/";
};
const get_url_simple = (mainreq) => {
    const protocol = mainreq.protocol + "://";
    return protocol + mainreq.get("host") + exports.proxyURISimple + "/";
};

const get_token = (mainreq, mainres) => {
    const isAuthorized = utilities.checkIfAuthorized(mainreq);
    if (!isAuthorized) {
        mainres.status(400).send({ error: "A valid auth_token is required." });
    } else {
        api_wrapper.get_token(mainreq, mainres, exports);
    }
};

const get_token_no_auth = (mainreq, mainres) => {
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
    try {
        body = JSON.parse(body);
    } catch (e) {
        return {
            error: true,
            message: "Error parsing JSON response.",
            body: body,
        };
    }

    // 1. are they tracks?
    try {
        return _tracks_simplifier(body.tracks.items);
    } catch (e) {}

    // 2. are they artists?
    try {
        return _artists_simplifier(body.artists.items);
    } catch (e) {}

    // 3. are they albums?
    try {
        return _albums_simplifier(body.albums.items);
    } catch (e) {}

    return {
        message: "No tracks, artists, or albums found that match this request",
    };
};

const _tracks_simplifier = (items) => {
    const data = [];
    for (item of items) {
        const track = {
            id: item.id,
            name: item.name,
            preview_url: item.preview_url,
        };
        try {
            track.album = {
                id: item.album.id,
                name: item.album.name,
                image_url: item.album.images[0].url,
            };
        } catch (ex) {}
        try {
            const artist = item.artists[0];
            track.artist = {
                id: artist.id,
                name: artist.name,
            };
        } catch (ex) {}
        data.push(track);
    }
    return data;
};

const _artists_simplifier = (items) => {
    const data = [];
    for (item of items) {
        const artist = {
            id: item.id,
            name: item.name,
            popularity: item.popularity,
        };
        try {
            artist.image_url = item.images[0].url;
        } catch (ex) {}
        try {
            artist.spotify_url = item.external_urls.spotify;
        } catch (ex) {}
        data.push(artist);
    }
    return data;
};

const _albums_simplifier = (items) => {
    const data = [];
    for (item of items) {
        const album = {
            id: item.id,
            name: item.name,
        };
        try {
            album.image_url = item.images[0].url;
        } catch (ex) {}
        try {
            album.spotify_url = item.external_urls.spotify;
        } catch (ex) {}
        data.push(album);
    }
    return data;
};

exports.get_opts = () => {
    return api_wrapper.get_opts(
        "https://accounts.spotify.com/api/token",
        process.env.SPOTIFY_KEY,
        process.env.SPOTIFY_SECRET,
        "client_credentials&scope=playlist-modify-public playlist-modify-private"
    );
};

exports.get_documentation = (mainreq, doc_type = "standard") => {
    if (doc_type === "simple") {
        return {
            name: "Spotify",
            is_simplified: true,
            icon: icon,
            endpoints: [
                {
                    name: "Spotify Tracks (Simplified)",
                    documentation: documentationURI,
                    source: exports.baseURI,
                    proxy: get_url_simple(mainreq),
                    example:
                        get_url_simple(mainreq) +
                        "v1/search?q=beyonce&type=track",
                },
                {
                    name: "Spotify Artists (Simplified)",
                    documentation: documentationURI,
                    source: exports.baseURI,
                    proxy: get_url_simple(mainreq),
                    example:
                        get_url_simple(mainreq) +
                        "v1/search?q=beyonce&type=artist",
                },
                {
                    name: "Spotify Albums (Simplified)",
                    documentation: documentationURI,
                    source: exports.baseURI,
                    proxy: get_url_simple(mainreq),
                    example:
                        get_url_simple(mainreq) +
                        "v1/search?q=beyonce&type=album",
                },
            ],
        };
    }
    return {
        name: "Spotify",
        icon: icon,
        endpoints: [
            {
                name: "Spotify Tracks",
                is_simplified: false,
                documentation: documentationURI,
                source: exports.baseURI,
                proxy: get_url(mainreq),
                example: get_url(mainreq) + "v1/search?q=beyonce&type=track",
            },
            {
                name: "Spotify Artists",
                is_simplified: false,
                documentation: documentationURI,
                source: exports.baseURI,
                proxy: get_url(mainreq),
                example: get_url(mainreq) + "v1/search?q=beyonce&type=artist",
            },
            {
                name: "Spotify Albums",
                is_simplified: false,
                documentation: documentationURI,
                source: exports.baseURI,
                proxy: get_url(mainreq),
                example: get_url(mainreq) + "v1/search?q=beyonce&type=album",
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

api_wrapper.enforce_interface("Spotify", exports);

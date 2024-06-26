// https://www.googleapis.com/youtube/v3/search?part=snippet&q=skateboarding+dog&type=video&key=
const utilities = require("./utilities");

exports.baseURI = "https://www.googleapis.com/youtube/v3/search";
exports.proxyURI = "/youtube";
const keyURI = "/youtube/key";
exports.proxyURISimple = exports.proxyURI + "/simple";
exports.proxyURISimpleOne = exports.proxyURISimple + "/one";

const documentationURI =
    "https://developers.google.com/youtube/v3/docs/search/list";
const get_url = (mainreq) => {
    const protocol = mainreq.protocol + "://";
    return protocol + mainreq.get("host") + exports.proxyURI + "/";
};
const get_url_simple = (mainreq) => {
    const protocol = mainreq.protocol + "://";
    return protocol + mainreq.get("host") + exports.proxyURISimple + "/";
};
const get_key = () => {
    return process.env.YOUTUBE_KEY;
};
const get_token = (mainreq, mainres) => {
    mainres.status(200).send({ token: get_key() });
};

const _issue_request = async (mainreq, mainres, proxyURI, parser) => {
    let url = exports.baseURI + mainreq.url.replace(proxyURI, "");
    url += "&part=snippet&key=" + get_key();
    let response;
    let data;
    try {
        response = await fetch(url);
    } catch (ex) {
        console.error(response);
        mainres.status(response ? response.status : 500).send(
            JSON.stringify({
                error: `There was an request error: ${url}`,
            })
        );
    }
    try {
        data = await response.text();
        if (!parser) {
            mainres.status(200).send(data);
        } else {
            mainres.status(200).send(parser(data));
        }
    } catch (ex) {
        console.error(data);
        mainres.status(response ? response.status : 500).send(
            JSON.stringify({
                error: `There was an parse error: ${url}. Check logs.`,
            })
        );
    }
};

const forward_request = (mainreq, mainres) => {
    _issue_request(mainreq, mainres, exports.proxyURI);
};

const forward_request_and_simplify = (mainreq, mainres) => {
    _issue_request(mainreq, mainres, exports.proxyURISimple, _simplify);
};

const forward_request_and_simplify_one = (mainreq, mainres) => {
    _issue_request(mainreq, mainres, exports.proxyURISimpleOne, _simplify_one);
};

exports.get_documentation = (mainreq, doc_type = "standard") => {
    if (doc_type === "simple") {
        return {
            name: "YouTube",
            is_simplified: true,
            icon: '<i class="fab fa-youtube"></i>',
            endpoints: [
                {
                    name: "Video Search (Simplified)",
                    documentation: documentationURI,
                    source: exports.baseURI,
                    proxy: get_url_simple(mainreq),
                    example:
                        get_url_simple(mainreq) +
                        "?q=skateboarding+dog&type=video",
                    args: {
                        q: "skateboarding+dog",
                        type: "video",
                    },
                },
            ],
        };
    }
    return {
        name: "YouTube",
        is_simplified: false,
        icon: '<i class="fab fa-youtube"></i>',
        endpoints: [
            {
                name: "Video Search",
                documentation: documentationURI,
                source: exports.baseURI,
                proxy: get_url(mainreq),
                example: get_url(mainreq) + "?q=skateboarding+dog&type=video",
                args: {
                    q: "skateboarding+dog",
                    type: "video",
                },
            },
        ],
    };
};

const _simplify = (body) => {
    body = JSON.parse(body);
    const data = [];
    for (item of body.items) {
        const vid = {
            videoId: item.id.videoId,
            title: item.snippet.title,
            url: "https://www.youtube.com/watch?v=" + item.id.videoId,
            embed_url: "https://www.youtube.com/embed/" + item.id.videoId,
        };
        try {
            vid.thumb_url = item.snippet.thumbnails.high.url;
        } catch (ex) {
            console.log("no video found");
        }
        data.push(vid);
    }
    return data;
};

const _simplify_one = (body) => {
    let data = _simplify(body);
    try {
        // console.log("trying to simplify..."); //, data);
        const idx = utilities.randomInt(0, data.length - 1);
        data = data[idx];
        // console.log("simplified", data);
    } catch (e) {
        console.error(e);
    }
    return data;
};

// note: the simplified proxy has to come *before the 'unsimplified'
//       in order for regex to work (order matters).
exports.routes = [
    {
        url: keyURI,
        routing_function: get_token,
    },
    {
        url: exports.proxyURISimpleOne + "*",
        routing_function: forward_request_and_simplify_one,
    },
    {
        url: exports.proxyURISimple + "*",
        routing_function: forward_request_and_simplify,
    },
    {
        url: exports.proxyURI + "*",
        routing_function: forward_request,
    },
];

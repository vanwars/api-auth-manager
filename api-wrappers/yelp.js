const util = require("util");
const utilities = require("./utilities");

exports.baseURI = "https://api.yelp.com";
exports.proxyURI = "/yelp";
exports.proxyURISimple = "/yelp/simple";
exports.proxyURISimpleOne = "/yelp/simple/one";
const keyURI = "/yelp/key";

exports.get_documentation = (mainreq, doc_type = "standard") => {
    if (doc_type === "simple") {
        return {
            name: "Yelp",
            is_simplified: true,
            icon: '<i class="fab fa-yelp"></i>',
            endpoints: [
                {
                    name: "Business Search (Simplified)",
                    documentation:
                        "https://www.yelp.com/developers/documentation/v3/business_search",
                    source: exports.baseURI,
                    proxy: get_url_simple(mainreq),
                    example:
                        get_url_simple(mainreq) +
                        "v3/businesses/search?location=Asheville, NC&term=pizza&limit=5",
                },
            ],
        };
    }
    return {
        name: "Yelp",
        is_simplified: false,
        icon: '<i class="fab fa-yelp"></i>',
        endpoints: [
            {
                name: "Business Search",
                documentation:
                    "https://www.yelp.com/developers/documentation/v3/business_search",
                source: exports.baseURI,
                proxy: get_url(mainreq),
                example:
                    get_url(mainreq) +
                    "v3/businesses/search?location=Asheville, NC&term=pizza&limit=5",
            },
        ],
    };
};

const get_url = (mainreq) => {
    const protocol = mainreq.protocol + "://";
    return protocol + mainreq.get("host") + exports.proxyURI + "/";
};
const get_url_simple = (mainreq) => {
    const protocol = mainreq.protocol + "://";
    return protocol + mainreq.get("host") + exports.proxyURISimple + "/";
};

const get_key = () => {
    return process.env.YELP_KEY;
};

const forward_request = async (
    mainreq,
    mainres,
    callback,
    parser = null,
    proxyURI = null
) => {
    // console.log('mainreq:', mainreq);
    // console.log('mainres:', mainres);
    // console.log('parser:', parser);
    // console.log('proxyURI:', proxyURI);
    const url =
        exports.baseURI + mainreq.url.replace(proxyURI || exports.proxyURI, "");
    options = {
        headers: {
            authorization: util.format("Bearer %s", process.env.YELP_KEY),
            "content-type": "application/json",
        },
    };
    let response;
    let data;
    try {
        response = await fetch(url, options);
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
        // mainres.status(200).send(parser(data));
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
const forward_request_and_simplify = (mainreq, mainres) => {
    forward_request(mainreq, mainres, null, _simplify, exports.proxyURISimple);
};

const forward_request_and_simplify_one = (mainreq, mainres) => {
    forward_request(
        mainreq,
        mainres,
        null,
        _simplify_one,
        exports.proxyURISimpleOne
    );
};

const _simplify = (body) => {
    body = JSON.parse(body);
    const data = [];
    for (item of body.businesses) {
        data.push({
            id: item.id,
            name: item.name,
            rating: item.rating,
            image_url: item.image_url,
            display_address: item.location.display_address.join(", "),
            coordinates: item.coordinates,
            price: item.price,
            review_count: item.review_count,
        });
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

const get_token = (mainreq, mainres) => {
    const isAuthorized = utilities.checkIfAuthorized(mainreq);
    if (!isAuthorized) {
        mainres
            .status(400)
            .send({ error: "A valid auth_manager_token is required." });
    } else {
        mainres.status(200).send({ token: get_key() });
    }
};

// Order matter! Key First.
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

const request = require('request');

/////////////////////////////////////
// Private variables and functions //
/////////////////////////////////////
const documentationURI = 'https://www.flickr.com/services/feeds/docs/photos_public/'
const get_url = (mainreq) => {
    return '//' + mainreq.get('host') + exports.proxyURI + '/';
};
const get_url_simple = (mainreq) => {
    return '//' + mainreq.get('host') + exports.proxyURISimple + '/';
};
const get_sample_url = (mainreq) => {
    return get_url(mainreq) + '?tags=cat'
};
const get_sample_url_simple = (mainreq) => {
    return get_url_simple(mainreq) + '?tags=cat'
};
const forward_request = (mainreq, mainres) => {
    _issue_request(mainreq, mainres, exports.proxyURI + '/', _parseJSONP);
};
const forward_request_and_simplify = (mainreq, mainres) => {
    _issue_request(mainreq, mainres, exports.proxyURISimple + '/', _simplify);
};

const forward_request_and_simplify_backwards_compatible = (mainreq, mainres) => {
    _issue_request(mainreq, mainres, exports.proxyURISimpleOld + '/', _simplify);
};
const _issue_request = (mainreq, mainres, proxyURI, parser) => {
    let url = exports.baseURI + mainreq.url.replace(proxyURI, '');
    url += '&format=json'
    request(url, (error, response, body) => { 
        if (!error && response.statusCode === 200) {
            mainres.status(200).send(parser(body)); 
        } else {
            mainres.status(response.statusCode).send(JSON.stringify({
                'error': 'There was an error'
            })); 
        }
    });
};
const _parseJSONP = (body) => {
    // convert from JSONP to JSON:
    body = body.slice(15, body.length - 1);
    return JSON.parse(body.replace(/^\(|\)\;/g, '')) 
};
const _simplify = (body) => {
    data = _parseJSONP(body);
    const simplified = [];
    for (item of data.items) {
        simplified.push({
            title: item.title,
            img_url: item.media.m.replace('_m', '_b')
            // tags: item.tags,
            // author: item.author,
        });
    }
    return simplified;
};


////////////////////////////////////
// Public variables and functions //
////////////////////////////////////
exports.baseURI = 'https://api.flickr.com/services/feeds/photos_public.gne';
exports.proxyURI = '/flickr';
exports.proxyURISimple = exports.proxyURI + '/simple';
exports.proxyURISimpleOld = exports.proxyURI + '-proxy-simple';

exports.get_documentation = (mainreq, doc_type='standard') => {
    if (doc_type === 'simple') {
        return {
            'name': 'Flickr',
            'is_simplified': true,
            'icon': '<i class="fab fa-flickr"></i>',
            'endpoints': [{
                'name': 'Photo Search (Simplified)',
                'documentation': documentationURI,
                'source': exports.baseURI,
                'proxy': get_url_simple(mainreq),
                'example': get_sample_url_simple(mainreq)
            }]
        };
    }
    return {
        'name': 'Flickr',
        'is_simplified': false,
        'icon': '<i class="fab fa-flickr"></i>',
        'endpoints': [{
            'name': 'Photo Search',
            'documentation': documentationURI,
            'source': exports.baseURI,
            'proxy': get_url(mainreq),
            'example': get_sample_url(mainreq)
        }]
    };
};

exports.routes = [{
    'url': exports.proxyURISimple + '/*',
    'routing_function': forward_request_and_simplify
}, {
    'url': exports.proxyURISimpleOld + '/*',
    'routing_function': forward_request_and_simplify_backwards_compatible
}, {
    'url': exports.proxyURI + '/*',
    'routing_function': forward_request
}];
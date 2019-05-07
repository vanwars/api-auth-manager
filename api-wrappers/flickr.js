const request = require('request');

exports.baseURI = 'https://api.flickr.com/services/feeds/photos_public.gne';

exports.forward_request = (mainreq, mainres) => {
    _issue_request(mainreq, mainres, '/flickr-proxy/', _parseJSONP);
};

exports.forward_request_and_simplify = (mainreq, mainres) => {
    _issue_request(mainreq, mainres, '/flickr-proxy-simple/', _simplify);
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
const request = require('request');
const util = require('util');

exports.baseURI = 'https://api.yelp.com';
exports.proxyURI = '/yelp-proxy';
exports.keyURI = '/yelp';

exports.get_key_url = (mainreq) => {
    base = '//' + mainreq.get('host')
    return base + exports.keyURI
};
exports.get_url = (mainreq) => {
    base = '//' + mainreq.get('host')
    return base + exports.proxyURI + '/'
};
exports.get_sample_url = (mainreq) => {
    return exports.get_url(mainreq) + 'v3/businesses/search?location=Evanston, IL'
};

exports.get_key = () => {
    return process.env.YELP_KEY;
};

exports.forward_request = (mainreq, mainres) => {
    const url = exports.baseURI + mainreq.url.replace(exports.proxyURI, '');
    options = {
        headers: {
            authorization: util.format('Bearer %s', process.env.YELP_KEY),
            'content-type': 'application/json'
        }
    }
    request(url, options, (error, response, body) => { 
        if (!error && response.statusCode === 200) {
            mainres.status(200).send(body); 
        } else {
            console.log('body')
            mainres.status(response.statusCode).send(JSON.stringify({
                'error': 'There was an error'
            })); 
        }
    });
};
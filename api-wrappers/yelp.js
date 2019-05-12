const request = require('request');
const util = require('util');

exports.baseURI = 'https://api.yelp.com';
exports.proxyURI = '/yelp';
const keyURI = '/yelp/key';

exports.get_documentation = (mainreq, doc_type='standard') => {
    if (doc_type === 'standard') {
        return {
            'name': 'Yelp',
            'is_simplified': false,
            'icon': '<i class="fab fa-yelp"></i>',
            'endpoints': [
                {
                    'name': 'Business Search',
                    'documentation': 'https://www.yelp.com/developers/documentation/v3/business_search',
                    'source': exports.baseURI,
                    'proxy': get_url(mainreq),
                    'example': get_url(mainreq) + 'v3/businesses/search?location=Evanston, IL'
                }
            ]
        }
    }
};

// const get_key_url = (mainreq) => {
//     return '//' + mainreq.get('host') + keyURI
// };

const get_url = (mainreq) => {
    return  '//' + mainreq.get('host') + exports.proxyURI + '/'
};

const get_key = () => {
    return process.env.YELP_KEY;
};

const forward_request = (mainreq, mainres) => {
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
            mainres.status(response.statusCode).send(JSON.stringify({
                'error': 'There was an error'
            })); 
        }
    });
};

// Order matter! Key First.
exports.routes = [{
    'url': keyURI,
    'routing_function': (mainreq, mainres) => {
        mainres.status(200).send(JSON.stringify({
            'token': get_key()
        }));
    }
}, {
    'url': exports.proxyURI + '/*',
    'routing_function': forward_request
}];
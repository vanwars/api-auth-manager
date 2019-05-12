const request = require('request');
const util = require('util');

exports.baseURI = 'https://api.yelp.com';
exports.proxyURI = '/yelp';
exports.proxyURISimple = '/yelp/simple'
const keyURI = '/yelp/key';

exports.get_documentation = (mainreq, doc_type='standard') => {
    if (doc_type === 'simple') {
        return {
            'name': 'Yelp',
            'is_simplified': true,
            'icon': '<i class="fab fa-yelp"></i>',
            'endpoints': [
                {
                    'name': 'Business Search (Simplified)',
                    'documentation': 'https://www.yelp.com/developers/documentation/v3/business_search',
                    'source': exports.baseURI,
                    'proxy': get_url_simple(mainreq),
                    'example': get_url_simple(mainreq) + 'v3/businesses/search?location=Evanston, IL'
                }
            ]
        }
    }
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
};

const get_url = (mainreq) => {
    return  '//' + mainreq.get('host') + exports.proxyURI + '/'
};
const get_url_simple = (mainreq) => {
    return  '//' + mainreq.get('host') + exports.proxyURISimple + '/'
};

const get_key = () => {
    return process.env.YELP_KEY;
};

const forward_request = (mainreq, mainres, callback, parser=null, proxyURI=null) => {
    // console.log('mainreq:', mainreq);
    // console.log('mainres:', mainres);
    // console.log('parser:', parser);
    // console.log('proxyURI:', proxyURI);
    const url = exports.baseURI + mainreq.url.replace(proxyURI || exports.proxyURI, '');
    options = {
        headers: {
            authorization: util.format('Bearer %s', process.env.YELP_KEY),
            'content-type': 'application/json'
        }
    }
    // console.log(url, options)
    request(url, options, (error, response, body) => { 
        // console.log('response has arrived', parser)
        if (!error && response.statusCode === 200) {
            if (!parser) {
                mainres.status(200).send(body); 
            } else {
                mainres.status(200).send(parser(body)); 
            }
        } else {
            mainres.status(response.statusCode).send(JSON.stringify({
                'error': 'There was an error'
            })); 
        }
    });
};
const forward_request_and_simplify = (mainreq, mainres) => {
    forward_request(mainreq, mainres, null, _simplify, exports.proxyURISimple);
};

const _simplify = (body) => {
    body = JSON.parse(body)
    const data = [];
    for (item of body.businesses) {
        data.push({
            id: item.id,
            name: item.name,
            rating: item.rating,
            image_url: item.image_url,
            display_address: item.location.display_address.join(', '),
            coordinates: item.coordinates,
            price: item.price,
            review_count: item.review_count
        });
    }
    return data;
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
    'url': exports.proxyURISimple + '/*',
    'routing_function': forward_request_and_simplify
}, {
    'url': exports.proxyURI + '/*',
    'routing_function': forward_request
}];
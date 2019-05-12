const yelp = require('./yelp');
const spotify = require('./spotify');
const twitter = require('./twitter');
const flickr = require('./flickr');
const youtube = require('./youtube');

exports.get_documentation = (mainreq) => {
    let documentation = {};
    documentation = Object.assign(documentation, exports.get_documentation_simplified(mainreq));
    documentation = Object.assign(documentation, exports.get_documentation_full(mainreq));
    return documentation;
}
exports.get_documentation_full = (mainreq) => {
    return {
        
        'youtube-standard': {
            'name': 'YouTube',
            'is_simplified': false,
            'icon': '<i class="fab fa-youtube"></i>',
            'endpoints': [{
                'name': 'Video Search',
                'documentation': youtube.documentationURI,
                'source': youtube.baseURI,
                'proxy': youtube.get_url(mainreq),
                'example': youtube.get_sample_url(mainreq)
            }]
        },
        'flickr-standard': {
            'name': 'Flickr',
            'is_simplified': false,
            'icon': '<i class="fab fa-flickr"></i>',
            'endpoints': [{
                'name': 'Photo Search',
                'documentation': flickr.documentationURI,
                'source': flickr.baseURI,
                'proxy': flickr.get_url(mainreq),
                'example': flickr.get_sample_url(mainreq)
            }]
        },
        'yelp': {
            'name': 'Yelp',
            'is_simplified': false,
            'icon': '<i class="fab fa-yelp"></i>',
            'endpoints': [
                {
                    'name': 'Business Search',
                    'documentation': yelp.documentationURI,
                    'source': yelp.baseURI,
                    'proxy': yelp.get_url(mainreq),
                    'example': yelp.get_sample_url(mainreq)
                }
            ]
        },
        'spotify': spotify.get_documentation(mainreq),
        'twitter': {
            'name': 'Twitter',
            'icon': '<i class="fab fa-twitter"></i>',
            'endpoints': [{
                'name': 'Tweet Search',
                'documentation': twitter.documentationURI,
                'source': twitter.baseURI,
                'proxy': twitter.get_url(mainreq),
                'example': twitter.get_sample_url(mainreq)
            }]
        }
    };
};
exports.get_documentation_simplified = (mainreq) => {
    return {
        'youtube-simplified': {
            'name': 'YouTube',
            'is_simplified': true,
            'icon': '<i class="fab fa-youtube"></i>',
            'endpoints': [{
                'name': 'Video Search (Simplified)',
                'documentation': youtube.documentationURI,
                'source': youtube.baseURI,
                'proxy': youtube.get_url_simple(mainreq),
                'example': youtube.get_sample_url_simple(mainreq)
            }]
        },
        'flickr-simplified': {
            'name': 'Flickr',
            'is_simplified': true,
            'icon': '<i class="fab fa-flickr"></i>',
            'endpoints': [{
                'name': 'Photo Search (Simplified)',
                'documentation': flickr.documentationURI,
                'source': flickr.baseURI,
                'proxy': flickr.get_url_simple(mainreq),
                'example': flickr.get_sample_url_simple(mainreq)
            }]
        },
        'eecs130': {
            'name': 'EECS 130',
            'is_simplified': true,
            'icon': '<i class="fas fa-graduation-cap"></i>',
            'endpoints': [{
                'name': 'Not Implemented Yet',
                'documentation': 'http://example.com',
                'source': 'http://example.com',
                'proxy': 'http://example.com',
                'example': 'http://example.com'
            }]
        }
    }
};
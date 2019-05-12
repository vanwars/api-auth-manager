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
        'youtube-standard': youtube.get_documentation(mainreq, doc_type='standard'),
        'flickr-standard': flickr.get_documentation(mainreq, doc_type='standard'),
        'yelp': yelp.get_documentation(mainreq),
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
        'youtube-simplified': youtube.get_documentation(mainreq, doc_type='simple'),
        'flickr-simplified': flickr.get_documentation(mainreq, doc_type='simple'),
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
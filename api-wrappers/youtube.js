const request = require('request');
const mailer = require('../mailer');

// https://www.googleapis.com/youtube/v3/search?part=snippet&q=skateboarding+dog+&type=video&key=

exports.baseURI = 'https://www.googleapis.com/youtube/v3/search';
exports.proxyURI = '/youtube';
const keyURI = '/youtube/key';
exports.proxyURISimple = exports.proxyURI + '/simple';

const documentationURI = 'https://developers.google.com/youtube/v3/docs/search/list';
const get_url = (mainreq) => {
    return '//' + mainreq.get('host') + exports.proxyURI + '/';
};
const get_url_simple = (mainreq) => {
    return '//' + mainreq.get('host') + exports.proxyURISimple + '/';
};
const get_key = () => {
    return process.env.YOUTUBE_KEY;
};
const get_token = (mainreq, mainres) => {
    mainres.status(200).send({ 'token': get_key() }); 
};

const _issue_request = (mainreq, mainres, proxyURI, parser) => {
    let url = exports.baseURI + mainreq.url.replace(proxyURI, '');
    url += '&part=snippet&key=' + get_key()
    //console.log(proxyURI, url)
    request(url, (error, response, body) => { 
        if (!error && response.statusCode === 200) {
            if (!parser) {
                mainres.status(200).send(body); 
            } else {
                mainres.status(200).send(parser(body));
            }
        } else {
            console.error(body);
            mailer.send_email('YOUTUBE API ERROR:', body);
            mainres
                .status(response.statusCode)
                .send(body); 
        }
    });
};

const forward_request = (mainreq, mainres) => {
    _issue_request(mainreq, mainres, exports.proxyURI)
};

const forward_request_and_simplify = (mainreq, mainres) => {
    _issue_request(mainreq, mainres, exports.proxyURISimple, _simplify)
};

exports.get_documentation = (mainreq, doc_type='standard') => {
    if (doc_type === 'simple') {
        return {
            'name': 'YouTube',
            'is_simplified': true,
            'icon': '<i class="fab fa-youtube"></i>',
            'endpoints': [{
                'name': 'Video Search (Simplified)',
                'documentation': documentationURI,
                'source': exports.baseURI,
                'proxy': get_url_simple(mainreq),
                'example': get_url_simple(mainreq) + '?q=skateboarding+dog+&type=video'
            }]
        };
    }
    return {
        'name': 'YouTube',
        'is_simplified': false,
        'icon': '<i class="fab fa-youtube"></i>',
        'endpoints': [{
            'name': 'Video Search',
            'documentation': documentationURI,
            'source': exports.baseURI,
            'proxy': get_url(mainreq),
            'example': get_url(mainreq) + '?q=skateboarding+dog+&type=video'
        }]
    };
};

const _simplify = (body) => {
    body = JSON.parse(body)
    const data = [];
    for (item of body.items) {
        data.push({
            videoId: item.id.videoId,
            title: item.snippet.title,
            url: 'https://www.youtube.com/watch?v=' + item.id.videoId,
            embed_url: 'https://www.youtube.com/embed/' + item.id.videoId
        });
    }
    return data;
};

// note: the simplified proxy has to come *before the 'unsimplified'
//       in order for regex to work (order matters).
exports.routes = [{
        'url': keyURI,
        'routing_function': get_token
    },{
        'url': exports.proxyURISimple + '/*',
        'routing_function': forward_request_and_simplify
    }, {
        'url': exports.proxyURI + '/*',
        'routing_function': forward_request
    }];
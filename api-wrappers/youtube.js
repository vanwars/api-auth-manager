const request = require('request');
// https://www.googleapis.com/youtube/v3/search?part=snippet&q=skateboarding+dog+&type=video&key=

exports.baseURI = 'https://www.googleapis.com/youtube/v3/search';
exports.proxyURI = '/youtube-proxy';
exports.proxyURISimple = exports.proxyURI + '-simple/';
exports.documentationURI = 'https://developers.google.com/youtube/v3/docs/search/list'

exports.get_url = (mainreq) => {
    base = '//' + mainreq.get('host')
    return base + exports.proxyURI + '/'
};
exports.get_url_simple = (mainreq) => {
    base = '//' + mainreq.get('host')
    return base + exports.proxyURISimple
};
exports.get_sample_url = (mainreq) => {
    return exports.get_url(mainreq) + '?q=skateboarding+dog+&type=video'
};
exports.get_sample_url_simple = (mainreq) => {
    return exports.get_url_simple(mainreq) + '?q=skateboarding+dog+&type=video'
};

get_key = () => {
    return process.env.YOUTUBE_KEY;
};

const _issue_request = (mainreq, mainres, proxyURI, parser) => {
    let url = exports.baseURI + mainreq.url.replace(proxyURI, '');
    url += '&part=snippet&key=' + get_key()
    console.log(url)
    request(url, (error, response, body) => { 
        if (!error && response.statusCode === 200) {
            if (!parser) {
                mainres.status(200).send(body); 
            } else {
                mainres.status(200).send(parser(body));
            }
        } else {
            console.log('body')
            mainres.status(response.statusCode).send(JSON.stringify({
                'error': 'There was an error'
            })); 
        }
    });
};

exports.forward_request = (mainreq, mainres) => {
    _issue_request(mainreq, mainres, exports.proxyURI)
};

exports.forward_request_and_simplify = (mainreq, mainres) => {
    _issue_request(mainreq, mainres, exports.proxyURISimple, _simplify)
};

const _simplify = (body) => {
    body = JSON.parse(body)
    const data = [];
    for (item of body.items) {
        data.push({
            videoId: item.id.videoId,
            title: item.snippet.title,
            url: 'https://www.youtube.com/watch?v=' + item.id.videoId
        });
    }
    return data;
};
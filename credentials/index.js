const request = require('request');
const util = require('util');

exports.get_opts = (url, key, secret, grant_type) => {
    const payload = key + ":" + secret;
    const encodedPayload = new Buffer(payload).toString("base64");
    return {
        url: url,
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + encodedPayload
        },
        body: "grant_type=" + grant_type,
        json: true
    };
};


const _issue_request = (mainreq, mainres, credentialer, isProxy=false) => {
    if (!credentialer.timeOfTokenCreation) {
        credentialer.timeOfTokenCreation = Date.now()
    }

    const tokenAgeInMinutes = Math.floor((Date.now() - credentialer.timeOfTokenCreation)/60000)

    /*
        these twitter tokens expire every hour, so we need to refresh them.
        To be safe, we won't send a token to the client
        if the token is more than 45 minutes old
    */
    if (credentialer.access_token && tokenAgeInMinutes < 45) {
        credentialer.message.token_age_minutes = tokenAgeInMinutes
        if (!isProxy) {
            mainres.status(200).send(JSON.stringify(credentialer.message))
        } else {
            _forward(mainreq, mainres, credentialer);
        }
    } else {
        credentialer.timeOfTokenCreation = Date.now()
        request(credentialer.get_opts(), (err, res, body) => {
            credentialer.access_token = body['access_token']
            credentialer.message = {
                token: credentialer.access_token,
                expires_in: body['expires_in'],
                token_age_minutes: 0
            }
            if (!isProxy) {
                try {
                    mainres.status(200).send(JSON.stringify(credentialer.message))
                } catch(error) {
                    console.log("errored the first time: ", error)
                }
            } else {
                _forward(mainreq, mainres, credentialer);
            }
        });
    }
};

const _forward = (mainreq, mainres, credentialer) => {
    if (!credentialer.access_token) {
        throw new Error('access_token has not been set');
    }
    const url = credentialer.baseURI + mainreq.url.replace(credentialer.proxyURI, '');
    options = {
        headers: {
            authorization: util.format('Bearer %s', credentialer.access_token),
            'content-type': 'application/json'
        }
    };
    request(url, options, function (error, response, body) { 
        if (!error && response.statusCode === 200) { 
            mainres.status(200).send(body); 
        } else {
            mainres.status(response.statusCode).send(JSON.stringify({
                'error': 'There was an error'
            })); 
        }
    });
};

exports.get_token = (mainreq, mainres, credentialer) => {
    _issue_request(mainreq, mainres, credentialer, isProxy=false)
};

exports.forward_request = (mainreq, mainres, credentialer) => {
    _issue_request(mainreq, mainres, credentialer, isProxy=true)
};

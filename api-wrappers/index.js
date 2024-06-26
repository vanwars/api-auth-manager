const util = require("util");

exports.enforce_interface = (name, api_wrapper) => {
    const required_keys = [
        "access_token",
        "timeOfTokenCreation",
        "message",
        "baseURI",
        "proxyURI",
        "get_opts",
        "routes",
        "get_documentation",
    ];
    for (key of required_keys) {
        if (typeof api_wrapper[key] === "undefined") {
            throw new Error(`${key} must be defined for ${name} module.`);
        }
    }
};

exports.get_opts = (url, key, secret, grant_type) => {
    const payload = key + ":" + secret;
    const encodedPayload = new Buffer(payload).toString("base64");
    return {
        url: url,
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + encodedPayload,
        },
        body: "grant_type=" + grant_type,
        json: true,
    };
};

const _issue_request = async (
    mainreq,
    mainres,
    api_wrapper,
    isProxy = false,
    parser = null,
    proxyURI = null
) => {
    if (!api_wrapper.timeOfTokenCreation) {
        api_wrapper.timeOfTokenCreation = Date.now();
    }

    const tokenAgeInMinutes = Math.floor(
        (Date.now() - api_wrapper.timeOfTokenCreation) / 60000
    );

    /*
        these twitter tokens expire every hour, so we need to refresh them.
        To be safe, we won't send a token to the client
        if the token is more than 45 minutes old
    */
    // console.log("IS PROXY:", isProxy);
    if (api_wrapper.access_token && tokenAgeInMinutes < 45) {
        api_wrapper.message.token_age_minutes = tokenAgeInMinutes;
        if (!isProxy) {
            mainres.status(200).send(JSON.stringify(api_wrapper.message));
        } else {
            _forward(mainreq, mainres, api_wrapper, parser, proxyURI);
        }
    } else {
        // get token:
        api_wrapper.timeOfTokenCreation = Date.now();
        // console.log(api_wrapper.get_opts());
        const opts = api_wrapper.get_opts();
        const response = await fetch(opts.url, {
            method: opts.method,
            headers: opts.headers,
            body: opts.body,
        });
        const data = await response.json();
        // console.log(data);
        api_wrapper.access_token = data.access_token;
        api_wrapper.message = {
            token: api_wrapper.access_token,
            expires_in: data.expires_in,
            token_age_minutes: 0,
        };
        if (!isProxy) {
            try {
                mainres.status(200).send(JSON.stringify(api_wrapper.message));
            } catch (error) {
                console.log("errored the first time: ", error);
            }
        } else {
            _forward(mainreq, mainres, api_wrapper, parser, proxyURI);
        }
    }
};

const _forward = async (
    mainreq,
    mainres,
    api_wrapper,
    parser = null,
    proxyURI = null
) => {
    if (!api_wrapper.access_token) {
        throw new Error("access_token has not been set");
    }
    let url =
        api_wrapper.baseURI +
        mainreq.url.replace(proxyURI || api_wrapper.proxyURI, "");
    // console.log("api_wrapper.baseURI:", api_wrapper.baseURI);
    // console.log("api_wrapper.proxyURI:", api_wrapper.proxyURI);
    // console.log("proxyURI:", proxyURI);
    // console.log("url:", url);

    options = {
        headers: {
            authorization: util.format("Bearer %s", api_wrapper.access_token),
            "content-type": "application/json",
        },
    };

    let response;
    let data;
    try {
        response = await fetch(url, options);
    } catch (ex) {
        console.error(response);
        mainres.status(response ? response.status : 500).send(
            JSON.stringify({
                error: `There was an request error: ${url}`,
            })
        );
    }
    try {
        data = await response.text();
        // mainres.status(200).send(parser(data));
        if (!parser) {
            mainres.status(200).send(data);
        } else {
            mainres.status(200).send(parser(data));
        }
    } catch (ex) {
        console.error(data);
        mainres.status(response ? response.status : 500).send(
            JSON.stringify({
                error: `There was an parse error: ${url}. Check logs.`,
            })
        );
    }
};

exports.get_token = (mainreq, mainres, api_wrapper) => {
    _issue_request(mainreq, mainres, api_wrapper, (isProxy = false));
};

exports.forward_request = (
    mainreq,
    mainres,
    api_wrapper,
    parser = null,
    proxyURI = null
) => {
    _issue_request(
        mainreq,
        mainres,
        api_wrapper,
        (isProxy = true),
        (parser = parser),
        (proxyURI = proxyURI)
    );
};

const utilities = require("./utilities");

const keyURI = "/sendgrid/key";

const get_key = () => {
    return process.env.SENDGRID_API_KEY;
};

const get_token = (mainreq, mainres) => {
    const isAuthorized = utilities.checkIfAuthorized(mainreq);
    if (!isAuthorized) {
        mainres
            .status(400)
            .send({ error: "A valid auth_manager_token is required." });
    } else {
        mainres.status(200).send({ token: get_key() });
    }
};

exports.routes = [{ url: keyURI, routing_function: get_token }];

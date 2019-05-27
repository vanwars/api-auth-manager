exports.checkIfAuthorized = (mainreq) => {
    auth_manager_token = mainreq.query.auth_manager_token;
    if (!auth_manager_token || auth_manager_token !== process.env.API_TUTOR_KEY) {
        return false;
    }
    return true;
};
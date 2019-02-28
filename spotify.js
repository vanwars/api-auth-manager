exports.access_token = null;
exports.timeOfTokenCreation = null;
exports.message = null;

exports.get_spotify_opts = () => {
    const key = process.env.SPOTIFY_KEY;
    const secret = process.env.SPOTIFY_SECRET;
    const payload = key + ":" + secret;
    const encodedPayload = new Buffer(payload).toString("base64");

    return {
        url: "https://accounts.spotify.com/api/token",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + encodedPayload
        },
        body: "grant_type=client_credentials&scope=playlist-modify-public playlist-modify-private",
        json: true
    };
};

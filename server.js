const express = require("express");
const bodyParser = require("body-parser");
const { engine } = require("express-handlebars");

const apis = require("./api-wrappers/config");
const utilities = require("./api-wrappers/utilities");
const PORT = process.env.PORT || 3005;

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const app = express();
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.use("/static", express.static("views"));
app.enable("trust proxy");

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// Todo: in next version of API Tutor, issue revokable API token to students:
const requireValidToken = (mainreq, mainres, next) => {
    is_authorized = utilities.checkIfAuthorized(mainreq);
    if (!is_authorized) {
        mainres
            .status(400)
            .send({ error: "A valid auth_manager_token is required." });
        return;
    } else {
        next();
    }
};

app.get("/", (mainreq, mainres) => {
    base = "//" + mainreq.get("host");
    mainres.render("index", {
        instructions_full: apis.get_documentation_full(mainreq, mainres),
        instructions_simplified: apis.get_documentation_simplified(mainreq),
        instructions: apis.get_documentation(mainreq),
    });
});

// Dynamically generate routes:
// console.log(apis.get_routes());
for (route of apis.get_routes()) {
    //app.get(route.url, requireValidToken, route.routing_function);
    app.get(route.url, route.routing_function);
}

app.listen(PORT, () => {
    console.log(`API Helper App listening on port ${PORT}!`);
});

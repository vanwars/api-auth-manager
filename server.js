const express = require('express')
const bodyParser = require('body-parser')
const handlebars  = require('express-handlebars');


const apis = require('./api-wrappers/config');
const PORT = process.env.PORT || 3005

const app = express()
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.use('/static', express.static('views'))

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json())

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (mainreq, mainres) => {
    base = '//' + mainreq.get('host')
    mainres.render('index', { 
        instructions_full: apis.get_documentation_full(mainreq, mainres),
        instructions_simplified: apis.get_documentation_simplified(mainreq),
        instructions: apis.get_documentation(mainreq)
    })
});

// Dynamically generate routes:
// console.log(apis.get_routes());
for (route of apis.get_routes()) {
    app.get(route.url, route.routing_function);
}

app.listen(PORT, () => {
    console.log(`API Helper App listening on port ${PORT}!`)
});

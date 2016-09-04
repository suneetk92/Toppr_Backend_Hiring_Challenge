// Call the packages
var express    = require('express'); // Call express
var app        = express(); // Definde our app using express
var bodyParser = require('body-parser'); // Get body-parser
var morgan     = require('morgan'); // Used to see requests
var mongoose   = require('mongoose'); // For working with our database
var config     = require('./config');
var apiRoutes  = require('./app/routes/api')(app, express);

// Use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure our app to handle CORS requests
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Header', 'X-Requested-With, content-type, Authorization');
	next();	
});

// Log all requests to the console
app.use(morgan('dev'));

// Connect to our database
mongoose.connect(config.database);

// All of our routes will be prefixed with /api
app.use('/', apiRoutes);

// Start the server
app.listen(config.port);
console.log('Magic happens on the port ' + config.port);
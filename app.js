
var express = require('express'),
	bodyParser = require('body-parser'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	session = require('express-session'),
	redis = require('redis'),
	RedisStore = require('connect-redis')(session);


var app = express();

var users = [
	{
		id: 1,
		username: 'user01',
		password: 'password'
	},
	{
		id: 2,
		username: 'user02',
		password: 'password'
	}
];
// body parser stuff;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: "keyboard cat!",
	store: new RedisStore({ prefix: 'test:', host: '127.0.0.1', client: redis.createClient() })
}));

passport.use('local', new LocalStrategy({
		usernameField: "username",
		passwordField: "password"
	},
	function (username, password, done) {
		return done(null, {id: 1, username: username});
	}
));

passport.serializeUser(function (user, done) {
	logger.warn('running serializeUser for user: ' + user.id);
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	logger.warn('running deserializeUser for id: ' + id);
	for (var i = 0; i < users.length; i++) {
		if (user[i].id == id) {
			done(null, user[i]);
		}
	}
});

app.use(passport.initialize());
app.use(passport.session(session));

app.get('/', function (request, response) {
	response.json("done");
});

app.get('/login', function (request, response, next) {

	passport.authenticate('local', function (err, user, info) {
		response.json(user);
	});
});

app.listen(3000, function () {
	console.log("listening to 3000");
});


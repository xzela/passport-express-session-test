
var express = require('express'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	session = require('express-session');


var app = express();

app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: "keyboard cat!"
}));

passport.use('local', new LocalStrategy({
		usernameField: "username",
		passwordField: "password"
	},
	function (username, password, done) {
		return done(null, {id: 12345, username: username});
	}
));

app.use(passport.initialize());
app.use(passport.session(session));

app.get('/', function (request, response) {
	response.json("done");
});

app.get('/login', function (request, response, next) {
	console.log(request.body);
	passport.authenticate('local', function (err, user, info) {
		response.json(user);
	});
});

app.listen(3000, function () {
	console.log("listening to 3000");
});


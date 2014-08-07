
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
	cookie: "keyboardCookie",
	secret: "keyboard cat!",
	store: new RedisStore({ prefix: 'test:', host: '127.0.0.1', client: redis.createClient() })
}));

passport.use('local', new LocalStrategy({
		usernameField: "username",
		passwordField: "password"
	},
	function (username, password, done) {
		for (var i = 0; i < users.length; i++) {
			if (users[i].username == username && users[i].password == password) {
				return done(null, users[i]);
				// return done(null, {id: 1, username: username});
			}
		}
		done(null, false, "unknown user or something");
	}
));

passport.serializeUser(function (user, done) {
	console.log('running serializeUser for user: ' + user.id);
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	console.log('running deserializeUser for id: ' + id);
	console.log('running deserializeUser for id: ' + id);
	console.log('running deserializeUser for id: ' + id);

	for (var i = 0; i < users.length; i++) {
		if (users[i].id == id) {
			done(null, users[i]);
		}
	}
	done(null, false, "unknown");
});

passport.isLoggedIn = function (request, response, next) {
	if (request.isAuthenticated()) {
		response.locals.user = request.user;
		return next();
	}
	response.redirect('/');
};

app.use(passport.initialize());
app.use(passport.session(session));

app.get('/', function (request, response) {
	var str = "<form action='/login' method='post'>username: <input type='text' name='username' /> <br /> password: <input type='password' name='password' /> <input type='submit' /></form>";
	response.send(str);
});

app.get('/login', function (request, response, next) {
	var str = "<form action='/login' method='post'>username: <input type='text' name='username' /> <br /> password: <input type='password' name='password' /> <input type='submit' /></form>";
	response.send(str);
});

app.get('/protected', passport.isLoggedIn, function (request, response, next) {
	response.json("protected page");
});

app.post('/login', function (request, response, next) {
	passport.authenticate('local', function (err, user, info) {
		if (err) {
			return next(err); // will generate a 500 error
		}
		if (user) {
			request.logIn(user, function (err) {
				if (err) {
					throw err;
				}
				response.user = user;
				response.json("success?");
			});
		} else {
			return response.json({errors: [{param: 'ldap', msg: info}]});
		}
	})(request, response, next);
});

app.listen(3000, function () {
	console.log("listening to 3000");
});


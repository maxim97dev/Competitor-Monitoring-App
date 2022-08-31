const express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    session = require('express-session'),
    handlebars = require('express-handlebars'),
    MongoStore = require('connect-mongo')(session),
    cors = require("cors"),
    config = require('config'),
    cookieSession = require("cookie-session"),
    cookieParser = require("cookie-parser"),
    app = express();

mongoose.connect('mongodb://localhost:27017/users',{
    useNewUrlParser:true,
    useUnifiedTopology: true,
    useFindAndModify: false 
});

require('./config/passport')(passport);

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(morgan('common'));

app.use(
  cors({
    origin: 'http://localhost:9999',
    methods: 'GET, POST, OPTIONS, PUT, DELETE',
    credentials: true
  })
);

app.engine('hbs', handlebars.engine({
    extname: '.hbs',
    defaultLayout: false,
    layoutsDir: './views/',
   }
));

app.set('view engine', 'hbs');

app.use(
    session({
      secret: 'keyboard cat',
      domain: 'localhost',
      resave: false,
      rolling: true,
      key:'express.sid',
      saveUninitialized: false,
      cookie: { maxAge: 3600000, secure: false, httpOnly: true },
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
  )

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', require('./routes/auth'));

app.use('/static/images', express.static(__dirname + '/database'));
app.use('/static/styles', express.static(__dirname + '/views/styles'));

app.use(
    require(config.get('routes.tasks')),
    require(config.get('routes.task'))
);

app.use(require('./routes/index'));
app.use(require('./routes/save'));
app.use(require('./routes/settings'));

app.listen(3000, () => console.log('Server has been started...'));
const methodOverride= require('method-override');
const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const path=require('path');
const bodyParser=require('body-parser');

// Load User Model
require('./models/User');
require('./models/Story');
// Passport Config
require('./config/passport')(passport);

// Load Routes
const index = require('./routes/index');
const auth = require('./routes/auth');
const stories = require('./routes/stories');
// Load Keys
const keys = require('./config/keys');

//handlebars helpers
const {
  truncate,
  select,
  formatDate,
  editIcon,

  stripTags
} =require('./helpers/hbs');


// Map global promises
mongoose.Promise = global.Promise;
// Mongoose Connect
mongoose.connect(keys.mongoURI,{ useNewUrlParser: true } , {
  useMongoClient:true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const app = express();

//body parser middleware
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

//Method override middleware
app.use(methodOverride('_method'));

// Handlebars Middleware
app.engine('handlebars', exphbs({
 helpers:{
   truncate:truncate,
   formatDate:formatDate,
  stripTags:stripTags,
editIcon:editIcon,
select:select},
  defaultLayout:'main'
}));
app.set('view engine', 'handlebars');

app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Use Routes
app.use('/', index);
app.use('/auth', auth);
app.use('/stories', stories);



//set static folder
app.use(express.static(path.join(__dirname,'public')));

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
});
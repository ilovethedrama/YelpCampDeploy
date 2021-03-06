require('dotenv').config(); 

var Campground      = require('./models/campground'),
    Comment         = require('./models/comment'),
    methodOverride  = require('method-override'),
    LocalStrategy   = require('passport-local'),
    User            = require('./models/user'),
    flash           = require('connect-flash'),
    bodyP           = require('body-parser'),
    passport        = require('passport'),
    mongoose        = require('mongoose'),
    express         = require('express'),
    seedDB          = require('./seeds'),
    app             = express();
    
    //requiring routes
var commentRoutes       = require('./routes/comments'),
    campgroundRoutes    = require('./routes/campgrounds'),
    authRoutes          = require('./routes/auth');
/////////////this
//mongoose.connect(process.env.dbURL);
/////////////becomes
    var url = process.env.dbURL ||'mongodb://localhost/dynamoP';
    mongoose.connect(url);
    
//the env has been set up in c9 and heroku as dbURL so when opened in either it will work
//if this is shared source but someone did not have the env set up the dynamoP link would
//work as a backup so if someone uses for dev in future and the env variable
//is not added it will pipe through the other address to bring up the db

////THE LOCAL DB  ///// mongoose.connect('mongodb://localhost/dynamoP');
////THE HEROKU ONE //// mongoose.connect('mmongodb://<dbuser>:<dbpassword>@ds215633.mlab.com:15633/yelpcamp_mena);g

app.use(methodOverride('_method')); //any time '_method' is seen in a form, the request will be treated as a PUT or DELETE
app.use(bodyP.urlencoded({extended:true}));
app.set('view engine', 'ejs'); //sets the default file as ejs - no need for the suffix bro!
        //will search goodlook/css for files - i'll store stylesheets here for the css/ejs modules - the __dirname is a safer way to do this
        // app.use(express.static('goodlook/css')); 
app.use(express.static(__dirname + '/goodlook/')); 
//tells ap to seve the goodlook folder so that it can be referenced easily with files saved in here. 
// The __dirname affixes the path ensuring if goodlook is moved it can still be found and link won't break
console.log(__dirname + '/goodlook/');
app.use(flash());

//this seeds the basic campground data each time the site starts - but you can comment out part to use it to delete everything too!
// seedDB();

app.locals.moment = require('moment');
//Now moment is available for use in all of your view files via the variable named moment

//PASSPORT CONFIG
app.use(require('express-session')({
    secret: 'Put what ever you want here, makes no diff',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//custom middleware - this will be called on every route
app.use(function (req, res, next){
    //this passes to every template and then moves code on after the middleware
    res.locals.currentUzr = req.user;
    // res.locals.message = req.flash('error'); //this gives access to the error through 'message'
    res.locals.error = req.flash('error'); //the .locals.error & .success give two diff data
    res.locals.successLog = req.flash('successLog'); //variables that can be used
    next();
});

app.use('/', authRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes); 
//adding this tells prog. any comment route needs to start with /campgrounds/:id/comments, 
//this helps w/ refactoring and means it only needs to be written once

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Yeah baby...We live!!"); 
//   console.log(process.env.PORT); 
//   console.log(process.env.IP); 
});
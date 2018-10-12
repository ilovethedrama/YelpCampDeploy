var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var    crypto          = require('crypto');
var     nodemailer      = require('nodemailer');
var async       = require('async');
var moment = require('moment');

//==============
//AUTH ROUTES
//==============

//RESTFUL ROUTES - ALL ROUTES START ERE (Root Route)
router.get('/', function(req, res){
  res.render('home'); 
});


//this will SHOW the register form
router.get('/register', function(req, res){
    res.render('register');
});

//handles SIGN UP logic
router.post('/register', function(req, res){
    var newSignUp = new User({username: req.body.username, email: req.body.email});
    User.register(newSignUp, req.body.password, function(err, nuUser){
      if(err){
          console.log(err);
          req.flash('error', err.message); 
          //passport has a few premade error messages including 
          //here a message saying something regarding signing up, 
          //ie password can't be blank, username taken etc
          return res.render('register');
      }
        passport.authenticate('local')(req,res, function(){
            req.flash('successLog', 'Welcome to the squadron ' + nuUser.username);
            res.redirect('/campgrounds');
            console.log(req.body.email);
        });
      });
    });

//shows login form
router.get('/login', function(req, res){
    res.render('login', {message: req.flash('error')}); 
    //===========
    // res.render('login', {message: req.flash('error')}); 
    //this links the 'uh oh spaghettios' message in the login middleware, 
    //passing through message as an alias that is then used in the login ejs file 
    //only displaying IF user fails to login 
    //and is redirected to login as seen in the middleware file 
    //===========
});


//deals with login LOGIC
router.post('/login', passport.authenticate('local', 
//when a req. to login page comes it runs the middleware pp.auth method, it uses the inbuilt
//'local' method and authenticates against what is stored in the db
//if user logs in it goes campgrounds, if fails back to login
    {
        successRedirect: '/campgrounds',
        failureRedirect: '/login',
    }), function(err, body){
        if(err){
            console.log('you done fucked up');
        } else {
           
            console.log('its alright son');
        }
});

//logout route
router.get('/logout', function(req, res){
    req.logout();
    req.flash('successLog', 'logged out, later patater');
    res.redirect('/campgrounds');
});

//forgot password link
router.get('/forgot', function(req, res){
    res.render('forgot');
});

router.post('/forgot', function(req, res, next){
    async.waterfall([
        //async.waterfall is an array of functions, one called after the other
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
                //the token being created is the one sent as part of the url to the user's email address that will expire within 15mins
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
            //looks for the email entered into the form via req.body.email  
                if(!user) {
                    //however if a user is not found then the user will be sent 
                    //to the forgot page and the below error message will flash
                    req.flash('error', "Y'all out here trippin' ain't nobody with that email address on here");
                    return res.redirect('/forgot');
                }
                //if the user is found by their email then the reset password token 
                //is equal to the newly made token with an expiry time of 15 mins 
                user.resetPwdToken = token;
                user.resetPwdExp = Date.now() + 9000000;// 15mins
                
                user.save(function(err) {
                    //the user is then saved along with the token
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport ({
                service: 'Yahoo',
                auth: {
                    user: 'bluemagicuk@yahoo.co.uk',
                    pass: process.env.YAHOO_PW
                    //this var is stored securely in the .env folder in the root
                }
            });
            var mailOptions = {
                //this is what the user will see when the email is sent
                to: user.email,
                from: 'bluemagicuk@yahoo.co.uk',
                //the email addy the user can respond to
                subject: 'Country Escapes Inc Password Reset',
                text: 'Click the link to change your password ' +
                'https://' + 'status100-ilovethedrama.c9users.io' + '/reset/' + token + '\n\n' + 
                //this will send user to the reset form from the email link sent
                ' If you didn\'t request this then bwoy mi nu know wa fi tel unnu' 
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                console.log('mail sent');
                req.flash('successLog', 'An e-mail has been sent to ' + user.email  + '  with instructions on how to reset the password ' + moment().fromNow() );
                done(err, 'done');
                //this sends the email by passing in mailOptions into the smtpTransport variable
            });
          }
        ], function(err) {
            if(err) return next(err);
            res.redirect('/forgot');
        });
});

router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPwdToken: req.params.token, resetPwdExp : { $gt: Date.now() } }, function(err, user) {
    //looks for a user with the reset password token that matches what was in the email link and also that it is within the time limit
        if(!user) {
            req.flash('error', 'You took too long, the ting is either fugazi or expired blud');
            res.redirect('/forgot');
        }
        res.render('reset', {token: req.params.token});
    });
});

router.post('/reset/:token', function(req, res) {
    async.waterfall([
        //waterfall is just an array of functions, 
        //helps avoid callback after callback within the code
        function(done) {
            User.findOne({ resetPwdToken: req.params.token, resetPwdExp: { $gt: Date.now() } }, function(err, user) {
                if(!user) {
                    req.flash('error', 'You were longin it out, the token expired you cornball');
                        res.redirect('back');
                }
                if(req.body.password === req.body.confirm) {
                  // if the password and confirm password fields are same
                    user.setPassword(req.body.password, function(err) {
                        //the mongoose method setPassword will reset the pwd
                        //with the salt and hash info using req.body.password
                        user.resetPwdToken = undefined;
                        user.resetPwdExp = undefined;
                        //after pwd is reset the resetPwdtoken + resetpwdexp are also set to undefined 
                        //as they are no longer needed but are ready in case another link needs to be generated.
                        
                        user.save(function(err) {
                            //this saves the users updated details 
                            //and logs them back in with the same credentials
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash('error', 'Password does not match');
                    return res.redirect('back');
                }
            });
        },
         function(user, done) {
            var smtpTransport = nodemailer.createTransport ({
                service: 'Yahoo',
                auth: {
                    user: 'bluemagicuk@yahoo.co.uk',
                    pass: process.env.YAHOO_PW
                    //this var is stored securely in the .env folder in the root
                }
            });
            var mailOptions = {
                //this is what the user will see when the email is sent
                to: user.email,
                from: 'bluemagicuk@yahoo.co.uk',
                //the email addy the user can respond to
                subject: 'Country Escapes Inc Password Updated',
                text: 'Your password has been updated' +
                'Yo, your password was successfully changed and all that. You know, the ' + user.email + ' one that you used with your account.'  + 
                //this will send user a confirmation email that it worked
                'If you didn\'t request this then bwoy mi nu know wa fi tel unnu' 
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                console.log('mail sent to '+ user.mail);
                req.flash('successLog', 'Huzzah your password has been changed');
                done(err, 'done');
                //this sends the email by passing in mailOptions into the smtpTransport variable
            });
          }
        ], function(err) {
            if(err) {
                console.log('oh no its dolmio time!')
            } else {
                 res.redirect('/campgrounds');   
            }
        });
});

//middleware 
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

module.exports = router;
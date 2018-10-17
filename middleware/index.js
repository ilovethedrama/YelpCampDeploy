var Campground = require('../models/campground');
var Comment = require('../models/comment');

var midObj = {};

midObj.checkCampgroundOwnership = function(req, res, next) {
   //if you're logged in...
    if(req.isAuthenticated()){
        //find the campground by it's ID
        Campground.findById(req.params.id, function(err, actualSite){
                if(err){
                   req.flash('error', 'No, nooooo is no here. Noooo...');
                   console.log("You're seeing this because the logged in user is not ")
                    res.redirect('back');
                } else {
                    //does this user own the campground
                    //is the author of the returned campground the same as the logged in user 
                    //.equals() is is a mongoose method as the req.user.id is a string, 
                    //the other is a mongoose object though they would both console log identically.
                    //the equals allows the two to be compared
                    if(actualSite.author.id.equals(req.user._id) || req.user.isRickDaRula ) {
                        //if the returned campground author id is the same as the user logged in or if they are an admin then proceed.  
                        next();
                         console.log('That worked so now...Going on to the next bit of the code!');
                    } else {
                         req.flash('error', 'you can\'t finesse this still, it\'s not yours');
                        console.log('Nu uh, u cant finesse this');
                        res.redirect('back');
                    }
                }
            });
    } else {
        console.log('You went back, back in time, waaay back');
        req.flash('error', 'You gotta log in to do that ish');
        res.redirect('back'); //this sends user back to last page they were on
    }

};

midObj.isThisUrs = function(req, res, next){
 if(req.isAuthenticated() || req.user.isRickDaRula ){ //this looks 2c is user logged in?
     Comment.findById(req.params.comment_id, function(err, gotIt) {
         if(err){
             res.redirect('back');
             //if not redirect back
         } else {
             if(gotIt.author.id.equals(req.user._id)) {// compares author comment id to logged in user id
                 next();
             } else {
                res.redirect('back');
         }                                      
         
     }
     });
 } else  {
     res.redirect('back');
 }
 
};


midObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('errorLog', 'You gotta login first');
    // req.flash('error', 'Uh oh spaghettios'); //this gives capability to access this message into login 
    res.redirect('/login');
};



module.exports = midObj;
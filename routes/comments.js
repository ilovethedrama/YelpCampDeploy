var express = require('express');
var router = express.Router({mergeParams: true}); //Router needs to be capitaliseds
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var midObj = require('../middleware');

//========================================================================
//                          COMMENT ROUTES
//========================================================================

//COMMENTS NEW!!!!
router.get('/new', midObj.isLoggedIn, function(req, res){ 
    //when a user makes a req it will run isLoggedIn 1st, checking a user isd logged in, 
    //if so it calls 'next' and runs the rest i.e. campground.findBy..goes to comments page etc, 
    //otherwise back to login page
    Campground.findById(req.params.id, function(err, campgrounddd){
        if(err){
            console.log(err);
        } else {
            res.render('comments/new', {campground: campgrounddd}); //this the 'new' file is in the comments folder, also campground is equal to the campgrounddd data that comes back from the function. Campground is used as an alias for campgrounddd within the 'new' ejs file
        }
    });
});

//COMMENTS CREATE!!!!
router.post('/', midObj.isLoggedIn, function(req, res) { //the isLoggedIn prevents anyone from commenting who isnt already loggedin
    //look up campground using ID
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect('/campgrounds');
        } else {
            //Create a new comment
            Comment.create(req.body.comment, function(err, jediWarrior){
                if(err){
                    req.flash('error', 'something went wrong here');
                    console.log(err);
                } else {
                    //adds username and id to comment
                    jediWarrior.author.id       = req.user._id; //auuthor. id refers bck to the comment schema
                    jediWarrior.author.username = req.user.username; //auuthor. id refers bck to the comment schema
                    console.log('new comment by : ' + req.user.username);
                    //saves the comment
                    jediWarrior.save();
                    //Connect the comment to a campground
                    campground.comments.push(jediWarrior);
                    campground.save();
                    console.log(jediWarrior);
                    req.flash('successLog', 'successfully added! Noice');
                    //Redirect campground to the show page that was commented on
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});

//COMMENTS EDIT ROUTE
router.get('/:comment_id/edit', midObj.isThisUrs, function(req, res){
    Comment.findById(req.params.comment_id, function(err, gotcha){
        if(err) {
           res.redirect('back'); 
        } else {
            res.render('comments/edit', {justTheCampgroundIdByItselfhere : req.params.id, comment: gotcha});
    //doing this because we don't need the campground and all its associated data,
    //only the ID, and because req.params.id holds the campground ID a custom value
    //such as campground_id or... justTheCampgroundIdByItselfhere can be used
    //this needs tp be done so that the values of plot or in this case justTheCampgroundIdByItselfhere 
    //and comment can be used in the edit template, such as the action and href
        }
    });
});


// COMMENTS UPDATE
router.put('/:comment_id', midObj.isThisUrs, function(req, res){
     Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, changeCom){
       //findByIdAndUpdate takes 3 params : the Id to find/search by, the data to be updated & 
       //the callback function to run after making sure it worked n to catch errors  
        if(err){
            req.flash('errorLog', 'Day work');
            res.redirect('back');
        } else {
            res.redirect('/campgrounds/' + req.params.id );
        }
    });  
});

router.delete('/:comment_id', midObj.isThisUrs, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            req.flash('errorLog', 'Day work');
            res.redirect('back');
        } else {
            req.flash('successLog', 'Yeah get some...deleted...BOOSH');
            res.redirect('/campgrounds/' + req.params.id);
        }
    }); 
});

//MIDDLEWARE - refactored and moved to a sep. middleware file

// function isThisUrs(req, res, next){
//  if(req.isAuthenticated()){ //this looks 2c is user logged in?
//      Comment.findById(req.params.comment_id, function(err, gotIt) {
//          if(err){
//              res.redirect('back');
//              //if not redirect back
//          } else {
//              if(gotIt.author.id.equals(req.user._id)) {// compares author comment id to logged in user id
//                  next();
//              } else {
//                 res.redirect('back');
//          }
//      }
//      });
//  } else  {
//      res.redirect('back');
//  }
 
// }


// function isLoggedIn(req, res, next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     res.redirect('/login');
// }


module.exports = router;
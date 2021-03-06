var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var midObj = require('../middleware');
//the index.js from '../middleare/index.js' can be omitted as by 'index' is searched for by default 

// var request = require('request');

////////////////////////MULTER SET UP
var multer = require('multer'); 
//defines a storage variable and configures an object inside the multer diskstorage method
//when a file is uploaded a custom name is created with the date and filename
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
//this sets up an imagefilter that makes sure any file uploaded must have one of the below files and will bring an error with anythinh else
var imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|tif|webp)$/i)) {
        return cb(new Error('Aye bruh! Only image files are allowed'), false);
    }
    cb(null, true);
};
//this sets up config items such as the storage as the storage var created
//and fileFilter as imageFilter, the variable that was created
var upload = multer({ storage, fileFilter: imageFilter});

////////////////////////CLOUDINARY SET UP
var cloudinary = require('cloudinary');
cloudinary.config({
   cloud_name: 'yelpcampmedia',
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET
});

//INDEX
router.get('/', function(req, res){
    var noMatch = '';
        // eval(require('locus'));
                    //this freezes the program to allow for debugging and to check search queries. 
                    //When a search is entered the terminal can be used to enter
                    //req.query to see the searched term. exit closes and unfreezes the code
    if(req.query.search) {
        //if query search is true/exists 
        var reggie = new RegExp(escapeReg(req.query.search), 'gi');
        //then the search term is plugged into the escapeReg function to see if it matches are returned which is stored in reggie 
        Campground.find({name: reggie}, function(err, grounds){
        //compares campground name against the regular expression 'reggie'
            if(err){
                console.log('errah');
            } else {
                if(grounds.length < 1) {
                    noMatch = 'No campgrounds match that query, try another search term';
                } 
                res.render('campgrounds/indexPage', {noMatchFoundMsg: noMatch, campgroundList:grounds, currentUzr: req.user});
                //this  allows the noMatch message to be used in the indexpage template under the name noMatchFound
            }
        })
    } else {
    
                Campground.find({}, function(err, grounds){
                   // contains all info of currently logged in user
                if(err){
                        console.log('error');
                } else {
                        //currentUzr: req.user doesn't need to be defined here as it has already been added via middleware
                        res.render('campgrounds/indexPage', {noMatchFoundMsg: noMatch, campgroundList:grounds, currentUzr: req.user});
                    }
                });    
            }
});

//CREATE
// router.post('/', midObj.isLoggedIn, function(req,res){
//     var pic = req.body.pic; 
        //req.body is way of getting info from form using body parser at this point in the code in the new
        //campgrounds ejs file each form input would be name = pic as opposed to campground[pic] 
//     var ava = req.body.avDate;
//     var name = req.body.name;
//     var price = req.body.price;
//     var author = {
//         id: req.user._id,
//         username: req.user.username
//     }; 
//     var newCmpgnd = {pic:pic, avDate:ava, name:name, author:author, price:price}; //these values match the campground schema (pic, name, avDate, author)
//   console.log(req.user.username);
//   Campground.create(newCmpgnd, function(err, newList){
//       if(err){
//           res.render('new');
//       } else {
//           console.log(newList);
//           res.redirect('/campgrounds');
//       }
//   });
// });

/////////////////INSTEAD OF THIS ^^ THE BELOW :
router.post('/', midObj.isLoggedIn, upload.single('pic'), function(req,res){
    //the req.file.path comes from multer set up in the storage var
    cloudinary.uploader.upload(req.file.path, function(result) {
        //add cloudinary url for the image to the campground object under image property
  req.body.campground.pic = result.secure_url;
  // adds author, name & avDate info to campground
  req.body.campground.author = { id: req.user._id, username: req.user.username };
  req.body.campground.name;
  req.body.campground.avDate;
  //creates a new campground taking all info from campground via req.body.campground
Campground.create(req.body.campground, function(err, campground) {
            if (err) {
              req.flash('error', err.message);
              return res.redirect('back');
            }
            res.redirect('/campgrounds/' + campground.id);
          });
    });
});

//NEW
router.get('/new', midObj.isLoggedIn, function(req, res){
    res.render('campgrounds/new');
});

//SHOW
router.get('/:id', function(req, res){
    Campground.findById(req.params.id).populate('comments').exec(function(err, actualSite){ //finds the campground by its Id and populates it with the associated comment
        if(err){
            res.redirect('/campgrounds');
        } else {
            res.render('campgrounds/show', {plot:actualSite});
        }
    });
});

// ======================================================================================
// //EDIT - Original
// router.get('/:id/edit', function(req, res){
//     //is user logged in, if not redirect, otherwise does user own campground if so run code 
//     if(req.isAuthenticated()){
//         Campground.findById(req.params.id, function(err, actualSite){
//                 if(err){
//                     res.redirect('/campgrounds');
//                 } else {
//                     //does this user own the campground
//                     //is the author of the returned campground the same as the logged in user 
//                     //.equals() is is a mongoose method as the req.user.id is a string, 
//                     //the other is a mongoose object though they would both console log identically.
//                     //the equals allows the two to be compared
//                     if(actualSite.author.id.equals(req.user._id)) {
//                          res.render('campgrounds/edit', {plot: actualSite});
//                          console.log('Yeah u dun know..my G!');
//                     } else {
//                         console.log('Nu uh, u cant finesse this');
//                         res.send('Nu uh, u cant finesse this');
//                     }
//                 }
//             });
//     } else {
//         console.log('Nu uh, u cant finesse this');
//         res.send('Naaaa nu uh, u cant finesse this');
//     }
// });
// ======================================================================================

//EDIT - Refactored
router.get('/:id/edit', midObj.checkCampgroundOwnership, function (req, res){
    //is user logged in, if not redirect, otherwise does user own campground if so run code 
        Campground.findById(req.params.id, function(err, actualSite){
                         res.render('campgrounds/edit', {plot: actualSite});
                         console.log('Yeah u dun know..my G!');
                    });
                });


//UPDATE
router.put('/:id', midObj.checkCampgroundOwnership, function(req, res){
    //what we're finding (the id), the data to be updated,
    //an object can be created such as :
    //var infoSet = {name : req.body.name, image: req.body.pic, avail:req.body.avDate} 
   // but instead they plot value can wrap the other items in the edit form doing
   //>> name = plot[name], name = plot[pic]
    //meaning that now the values can be nested inside a single object ie req.body.plot
    var theOne = req.params.id;
    Campground.findByIdAndUpdate(req.params.id, req.body.plot, function(err, updatedInfo){
        if(err) {
            res.redirect('/campgrounds');
        } else {
            res.redirect('/campgrounds/' + theOne); //this will redirect the updated version of that campsite
        }
    }); //req.body.plot - the plot is because that is what data is called in the edit.ejs file
//   res.send('UPDATE ROUTE');
});

//DESTROY ROUTE
router.delete('/:id', midObj.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err, winning){
        if(err){
            res.redirect('/campgrounds');
            console.log('damn');
        } else {
            res.redirect('/campgrounds');
        }
    });
});



//MIDDLEWARE - refactored and moved to a sep. middleware file
// function isLoggedIn(req, res, next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     res.redirect('/login');
// }



// router.get('*', function(req, res) { //this will prevent the add comment route from working for some reason
//     res.send('Wrong page! Look again');
// });

function escapeReg(thicc){
    return thicc.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");   
}

module.exports = router;
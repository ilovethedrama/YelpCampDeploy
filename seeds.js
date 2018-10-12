var Campground = require('./models/campground'),
    Comment = require('./models/comment'),
    mongoose = require('mongoose');
    

//THIS IS THE STARTER/SEED DATA FOR INITIAL CAMPGROUNDS, each one has a name av date n image which is what schema would expect
// var data = [
//     {
//     name: 'Lakeside Tressle Cabin',
//     avDate: 'Now',
//     pic: 'https://images.unsplash.com/photo-1519980744-785dc86d4a7a?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d433713c7db732b8358780991f87abdc&auto=format&fit=crop&w=750&q=80',    
//     },
//     {
//     name: 'Hipster\'s retreat',
//     avDate: 'Now',
//     pic: 'https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=552042ed8cfeb4a1e8e62ae2a75f661e&auto=format&fit=crop&w=1500&q=80',    
//     },
//     {
//     name: 'Helvetica Neue Day',
//     avDate: 'Now',
//     pic: 'https://images.unsplash.com/photo-1516402707257-787c50fc3898?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=424a0763553fd8bf561fa0ebb254aa0c&auto=format&fit=crop&w=1500&q=80',    
//     },
//     {
//     name: 'Wagon Wheel Barn',
//     avDate: 'Now',
//     pic: 'https://images.unsplash.com/photo-1528190956502-da681113c8ed?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d34edd6c09aee268b2d4aa2a902cbb57&auto=format&fit=crop&w=1002&q=80https://images.unsplash.com/photo-1528190956502-da681113c8ed?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=d34edd6c09aee268b2d4aa2a902cbb57&auto=format&fit=crop&w=1002&q=80',    
//     }
// ]

function seedDB(){
    Campground.remove({}, function(err){ //removes everything in DB
        if(err){
            console.log(err);
        } else {
        //     console.log('removed campground entries');
        //         data.forEach(function(seed){ //seed rep.'s each single entry which is added using campground.create
        //             Campground.create(seed, function(err, site){//putting create inside the callback of the remove function ensures remove happens 1st then create 2nd
        //                 if(err){
        //                     console.log(err);
        //                 } else {
        //                     console.log('added a campground');
        //                     Comment.create( //creating 3 unique campgrounds
        //                         {
        //                         text: 'This is what it\'s all about, the big ol\' outdoors',
        //                         author: 'Clarence'
        //                     }, function(err, cr8dcomment){
        //                         if(err){
        //                             console.log(err);
        //                         } else {
        //                         site.comments.push(cr8dcomment); //comments refers to the property in campground.js
        //                         site.save();
        //                         console.log('created a comment');
        //                         }
        //                     });
        //                 }
        //         });  
        //     });
        }
    });    
}

module.exports = seedDB;
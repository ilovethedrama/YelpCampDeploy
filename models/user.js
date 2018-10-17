var mongoose = require('mongoose');
var ppLM = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({ //each user needs a u.name + pwd
    username: 
            {
                type: String,
                unique: true,
                required: true
            },
    
    password: String,
    email: String,
    resetPwdToken: String,
    resetPwdExp: Date,
    isRickDaRula: 
            {
                type: Boolean, 
                default: false
            },
    avatar: String,
    displayName: String
});

UserSchema.plugin(ppLM); //adds methods from passport to the userschema

module.exports = mongoose.model('User', UserSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Capitalized 'Schema' is the standard convention 
const passportLocalMongoose = require('passport-local-mongoose').default;

const userSchema = new Schema({
    email : {
        type : String,
        required : true,
    },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
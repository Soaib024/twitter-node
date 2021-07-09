const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name : {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type:String,
        required: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
    },

    profilePic: {
        type: String,
        default: "defaultProfilePic.jpeg"
    },
    coverPhoto: {
        type: String
    },
    likes:[{ type: Schema.Types.ObjectId, ref: 'Post'}],
    retweets:[{ type: Schema.Types.ObjectId, ref: 'Post'}],
    following: [{ type: Schema.Types.ObjectId, ref: "User"}],
    followers: [{ type: Schema.Types.ObjectId, ref: "User"}],
    comments: [{type: Schema.Types.ObjectId, ref: "Comment"}],
}, {timestamps: true});



const User = mongoose.model('User', UserSchema);
module.exports = User;
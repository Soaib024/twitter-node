const mongoose = require('mongoose');
const Schema = mongoose.Schema

const NewsSchema = new Schema({
    news: String
});

module.exports = mongoose.model("News", NewsSchema)
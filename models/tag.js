var mongoose = require("mongoose");

var tag = mongoose.Schema({
	uid: {
		type: String,
		unique: true,
		required: true
	},
	isOwned: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('Tag', tag);

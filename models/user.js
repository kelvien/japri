var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
var Schema = mongoose.Schema;

var user = mongoose.Schema({
	permission: {
		type: String, 
		enum: ['Developer', 'User'],
        required: true
	},
	email: {
		type: String,
		unique: true,
		required: true
	},
	password: {
		type: String,
        required: true
    },
    receivesEmail: {
    	type: Boolean,
    	default: true
    },
    name: {
    	type: String
    },
    tag: {
		type: Schema.Types.ObjectId,
    	ref: 'Tag'
	}
});

user.pre("save", function(next){
	var user = this;
    if (user.isModified('password') || user.isNew) {
        var hash = bcrypt.hashSync(user.password, bcrypt.genSaltSync(8), null);
		user.password = hash;
	    next();
    } else {
        return next();
    }
});

user.methods.checkPassword = function(password){
	return (password !== undefined && bcrypt.compareSync(password, this.password));
}

module.exports = mongoose.model('User', user);
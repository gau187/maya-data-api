var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/urlshortener');

var db = mongoose.connection;

// User Schema
var LinkSchema = mongoose.Schema({
	originalUrl: {
		type: String
	},
	validTill: {
		type: Date
	},
    endpoint: {
        type: String,
		unique: true
    },
    userId: {
        type: String
    }
});

var Links = module.exports = mongoose.model('Links', LinkSchema);

module.exports.getLinkByUser = function(username, callback){
	var query = {userId: username};
	Links.find(query, callback);
}

module.exports.deleteByEndpoint = function(endpoint,username, callback){
	var query = {endpoint: endpoint,userId:username};
	Links.deleteOne(query, callback);
}

module.exports.editByEndpoint = function(endpoint,username,originalUrl, callback){
	var query = {endpoint: endpoint,userId:username};
	var newValues = { $set: { originalUrl: originalUrl } };
	Links.updateOne(query,newValues, callback);
}

module.exports.getLinkByKeywordAndUser = function(key,username,callback){
	var query = {endpoint: key,userId:username};
	Links.findOne(query, function(err,obj){
		if(err){
            return callback(err);
        } else if (obj){
			return callback(null,obj);
        } else {
			return callback();
        }
	});
}

module.exports.getLinkByKeyword = function(key,callback){
	var query = {endpoint: key};
	Links.findOne(query, function(err,obj){
		if(err){
            return callback(err);
        } else if (obj){
			if(obj.validTill){
				if(obj.validTill > new Date()){
					return callback(null,obj);
				}else{
					return callback("Expired Link");
				}
			}else{
				return callback(null,obj);
			}
        } else {
			return callback();
        }
	});
}

module.exports.createLink = function(newLink, callback){
    newLink.save(callback);
}
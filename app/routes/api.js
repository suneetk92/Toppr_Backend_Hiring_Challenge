// Call the packages
var Battles     = require('../models/battles');
var config      = require('../../config');

module.exports = function(app, express) {

	// Get an instance of the express router
	var apiRouter = express.Router();

	// Test route to make sure everything is working
	// Accessed at GET http://localhost:1337/
	apiRouter.get('/', function(req, res) {
		res.json({ message: 'Welcome to GOT battles API!!' });
	});

	apiRouter.route('/list')
		// Get list of battles
		.get(function(req, res) {
			Battles.find().exec(function (err, battles) {
				if(err)
					res.json(err);
				res.json(battles);
			});
		});

	apiRouter.route('/count')
	// Get count of records
		.get(function(req, res) {
			Battles.count().exec(function(err, count) {
				if(err)
					res.json(err);
				res.json(count);
			});
		});

	apiRouter.route('/search/:name')
	// Get the user with that id (accessed at GET http://localhost:1337/search/:name)
		.get(function(req, res) {
			console.log(req);
			res.json({ message: 'search'});
			/*User.findOne({ "_id": ObjectId(req.params.user_id) }, function(err, user) {
				if (err) {
					res.send(err);
				}
				res.json(user);
			});*/
		});

	apiRouter.route('/stats')
	// Get status
		.get(function(req, res) {
			var stats = {
				"most_active":{
					"attacker_king":"",
					"defender_king":"",
					"region":"",
					"name":""
				},
				"attacker_outcome":{
					"win":"",
					"loss":""
				},
				"battle_type":[],
				"defender_size":{
					"average":"",
					"min":"",
					"max":""
				}
			};
			//db.battles.distinct("battle_type", {"battle_type":{ $nin: ["", null] }});
			Battles.distinct("battle_type", {"battle_type":{ $nin: ["", null] }}).exec(function(err, battleTypes) {
				if(err)
					res.json(err);
				stats.battle_type = battleTypes;
				//console.log(stats);
			});
			//db.battles.find({defender_size: {$nin: ["", null]}}, {_id: 0, defender_size: 1}).sort({"defender_size": -1}).limit(1);
			Battles.aggregate([ { $group: { _id:  0, avg: { $avg: "$defender_size" }, min: { $min: "$defender_size" }, max: {  $max: "$defender_size" } } } ]).exec(function (err, sizes) {
				if(err)
					res.json(err);
				stats.defender_size.average = sizes[0].avg;
				//stats.defender_size.max = sizes[0].max;
				stats.defender_size.min = sizes[0].min;
				//console.log(stats);
			});
			//db.battles.aggregate([ { $group: { _id: "$attacker_king", count: { $sum: 1  }  } }, { $sort: { count: -1  } }, {  $limit: 1 } ]);//find attacker_king
			Battles.aggregate([ { $group: { _id: "$attacker_king", count: { $sum: 1  }  } }, { $sort: { count: -1  } }, {  $limit: 1 } ]).exec(function (err, attackerKing) {
				if(err)
					res.json(err);
				stats.most_active.attacker_king = attackerKing[0]._id;
			});
			//db.battles.aggregate([ { $group: { _id: "$defender_king", count: { $sum: 1  }  } }, { $sort: { count: -1  } }, {  $limit: 1 } ]);//find attacker_king
			Battles.aggregate([ { $group: { _id: "$defender_king", count: { $sum: 1  }  } }, { $sort: { count: -1  } }, {  $limit: 1 } ]).exec(function (err, defenderKing) {
				if(err)
					res.json(err);
				stats.most_active.defender_king = defenderKing[0]._id;
			});
			//db.battles.aggregate([ { $group: { _id: "$region", count: { $sum: 1  }  } }, { $sort: { count: -1  } }, {  $limit: 1 } ]);//find region
			Battles.aggregate([ { $group: { _id: "$region", count: { $sum: 1  }  } }, { $sort: { count: -1  } }, {  $limit: 1 } ]).exec(function (err, region) {
				if(err)
					res.json(err);
				stats.most_active.region = region[0]._id;
			});
			//db.battles.aggregate([ { $group: { _id: "$name", count: { $sum: 1  }  } }, { $sort: { count: -1  } }, {  $limit: 1 } ]);//find name
			Battles.aggregate([ { $group: { _id: "$name", count: { $sum: 1  }  } }, { $sort: { count: -1  } }, {  $limit: 1 } ]).exec(function (err, name) {
				if(err)
					res.json(err);
				stats.most_active.name = name[0]._id;
			});
			//db.battles.aggregate([ { $group: { _id: "$attacker_outcome", count: { $sum:1 } } } ]);//find outcome;
			Battles.aggregate([ { $group: { _id: "$attacker_outcome", count: { $sum:1 } } } ]).exec(function (err, outcomes) {
				if(err)
					res.json(err);
				stats.attacker_outcome.win = outcomes[0].count;
				stats.attacker_outcome.loss = outcomes[2].count;
			});

			Battles.find({"defender_size": {$nin: ["", null]}}, {_id: 0, "defender_size": 1}).sort({"defender_size": -1}).limit(1).exec(function (err, maxSize) {
				if(err)
					res.json(err);
				stats.defender_size.max = parseInt(maxSize[0].defender_size);
				res.json(stats);
			});
		});

	return apiRouter;
};
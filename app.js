//Basic Setup
const express             = require('express');
const app                 = express();
const bodyParser          = require('body-parser');
const socket 			  = require('socket.io');


const PORT = 3456;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');



// API #1 IMDb Movie Setup -----------------------------------------

const imdb 				  = require('imdb-api');
const cli 				  = new imdb.Client({apiKey: '61641191'});

function getMovie(name, callback) {

	var movie = {};
	cli.get({'name': name})
	.then(function(data){
		callback(data);
	})
	.catch(console.log);
};	

// getMovie('the girl with the dragon tattoo', movie=>{
// 	console.log(movie);
// });
// -----------------------------------------------------------------



// API #2 Weather-js Setup -----------------------------------------

const weather = require('weather-js');
 

function getWeather(name, callback){
	weather.find({search: name, degreeType: 'C'}, function(err, result) {
	  if(err) console.log(err);
	 
	  // console.log(JSON.stringify(result, null, 2));
	  callback(result);
	});
}; 


// -----------------------------------------------------------------


//  API #3 Inshorts headlines API-----------------------------------
	
var inshorts= require('inshorts-api');
	
// -----------------------------------------------------------------

// Routes
app.get('/', function(req, res){
    res.render('index');
});



var server = app.listen(PORT, function(){
	console.log(`Server listening on PORT:: ${PORT}`);
})

const io = socket(server);

io.on('connection', socket=>{
	console.log(`Made connection with Socket ID: ${socket.id}`);


	// Movie Events
	socket.on('emitMovie', data=>{
		getMovie(data.message, (movie)=>{
			console.log(movie);
			io.sockets.emit('sendMovie', movie);
		});
	});


	// Weather Events
	socket.on('emitWeather', data=>{
		
		let msg = '';

		if (data.message.includes('jaipur')|| data.message == 'default'){
			msg = 'Jaipur, RJ';
		}
		else {
			msg = data.message;
		}
		getWeather(msg, (weather)=>{
			if(data.message == 'default'){
				weather[0].location.default = true;
			}
			if(data.forecast){
				weather[0].location.forecast = true;
			}
			if(weather[0].current.skytext=='Haze'){
				weather[0].current.skytext = 'Hazy';
			}

			console.log(weather[0]);

			io.sockets.emit('sendWeather', weather[0]);
		})
	})

	// News Headlines Events
	socket.on('emitHeadlines', data=>{
		
		console.log(data.category);
		inshorts.get(data.category, 'en' ,function(result){
			console.log(result);
			io.sockets.emit('sendHeadlines', result);
		});

	})
}); 

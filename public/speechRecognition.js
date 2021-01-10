
// Connecting to WebSocket


// Definitions
var userGreetings 	= ['good morning',
					   'how are you',
					   'good evening',
					   'good afternoon',
					   'hello',
					   'hi',
					   'how are you doing'];

var newsCategories 	= ['national',
					   'business',
					   'sports',
					   'world',
					   'politics',
					   'technology',
					   'startup',
				   	   'entertainment',
					   'miscellaneous',
					   'hatke',
					   'science',
					   'automobile'];

var websiteList   	= [{keyword:'google', url:'https://google.com/'},
					   {keyword:'stackoverflow', url: 'https://stackoverflow.com/'},
					   {keyword:'github', url: 'https://github.com/'},
					   {keyword:'medium', url: 'https://medium.com/'},
					   {keyword:'codepen', url: 'https://codepen.io/'},
					   {keyword:'facebook', url: 'https://facebook.com/'},
					   {keyword:'youtube', url: 'https://youtube.com/'},
					   {keyword:'npm', url: 'https://npmjs.com/'},
					   {keyword:'wikipedia', url: 'https://wikipedia.com/'},
					   {keyword:'instagram', url: 'https://instagram.com/'},
					   {keyword:'amazon', url: 'https://amazon.in/'},
					   {keyword:'flipkart', url: 'https://flipkart.com/'},
					   {keyword:'netflix', url: 'https://netflix.com/'},
					   {keyword: 'trello', url: 'https://trello.com/nakshatrasaxena/boards'}];


// Recognition Stuff

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;


if (SpeechRecognition){

	console.log('SpeechRecognition is supported.');
	const recognition = new SpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = false;


	function startRecog(){
		recognition.start();
	}


	function stopRecog(){
		recognition.stop();
	}


	recognition.onstart = e => {
		console.log('Taking Commands now.');
	}

	recognition.onend = e => {
		console.log('NOT Taking Commands now.');
	}

	recognition.onnomatch = e => {
  		console.log('Could not get it');
	}

	recognition.onsoundend = function() {
	  console.log('Sound has stopped being received_________________________________________________');
	}

	recognition.addEventListener('result', resultRecognition);
	function resultRecognition(event){
		const currentResultIndex = event.resultIndex;
		let transcript = event.results[currentResultIndex][0].transcript;
		let confidence = event.results[currentResultIndex][0].confidence;
		

		transcript = transcript.toLowerCase().trim();
		confidence = (confidence*100).toFixed(2);

		// event.prop = true;
		// console.log(event.prop);
		console.log(`User: ${transcript} (${confidence}%)`);

		// If statements deciding what to do.
		if(userGreetings.includes(transcript)){
			irisGreet();
		}

		else if(transcript.includes('thank you') || transcript.includes('thankyou') || transcript.includes('bye')){
			sayGoodBye();
			stopRecog();
		}

		else if(transcript.includes('what is the time') ||transcript.includes('can you tell me the time')||transcript.includes('the time')){
			tellTime();
		}

		else if(transcript.includes('what is the date today') ||transcript.includes('can you tell me the date')||transcript.includes('the date')){
			tellDate();
		}

		else if(transcript.includes('movie')){
			transcript=transcript.substring(transcript.indexOf('movie')+6).trim();
			console.log(transcript);
			emitMovie({
				message: transcript,
				surity: confidence
			});
		}

		else if(transcript.includes('news') || transcript.includes('headlines')){
			
			var category = '';

			newsCategories.forEach(c=>{
				if(transcript.includes(c)){
					category = c;
				}
			})
				
			emitHeadlines({
				category,
				surity: confidence
			});
		}

		else if(transcript.includes('weather')){
			
			forecast = false;

			if(transcript.includes('tomorrow')){
				forecast = true;
				transcript = transcript.replace('tomorrow', '');
			}

			if(transcript.includes('in')){
				transcript=transcript.substring(transcript.indexOf('in')+2).trim();

				console.log(transcript);
				emitWeather({
					message: transcript
				});

			}
			else {
				console.log('default');
				emitWeather({
					message: 'default'
				});
			}
			
		}

		else if(transcript.includes('search')){
			if(transcript.includes('for')){
				transcript = transcript.replace('for', '');
			}
			searchHit(transcript.trim());
		}

		else if(transcript.includes('open')){
			openHit(transcript);
		}
	};
}



// Helper Functions

function searchHit(msg){

	if(msg.includes('search')){
		msg = msg.replace('search', '');
	}

	if(msg.includes('stackoverflow')||msg.includes('stack overflow')){
		msg = msg.replace('stackoverflow', '');
		msg = msg.replace('stack overflow', '');
		let stackoverflowSearch = `https://stackoverflow.com/search?q=${msg}`;
		window.open(stackoverflowSearch, '_blank');
	}

	if(msg.includes('google')){
		msg = msg.replace('google', '');
		let googleSearch = `https://google.com/search?q=${msg}`;
		window.open(googleSearch, '_blank');
	}

	if(msg.includes('npm')){
		msg = msg.replace('npm', '');

		let npmSearch = `https://www.npmjs.com/search?q=${msg}`;
		window.open(npmSearch, '_blank');
	}
}


function openHit(msg){

	websiteList.forEach(site=>{
		if(msg.includes(site.keyword)){
			window.open(site.url, '_blank');
		}
	})
}

function getGreeting(){

	let date = new Date();
	let hour = date.getHours();
	let greeting = '';
	if(hour<12){
		return 'Good Morning!';
	}
	if(hour>=12 && hour<18){
		return 'Good Afternoon!';
	}
	else{
		return 'Good Evening!';
	}
}


function irisGreet(){
	newSpeak(getGreeting() +' This is Iris. How can I help you?');
}

function sayGoodBye(){
	newSpeak('Iris signing off.');
}

function tellTime(){
	let date = new Date();
  	let time = date.toLocaleTimeString();
  	newSpeak('The time is: ' + time);
}

function tellDate(){
	let date = new Date();
	let day = date.toDateString();
	newSpeak(day);
}


// New Voiceover Stuff--------------------------------------------

const synth = window.speechSynthesis;


// Dom Selectors
const voiceSelect = document.querySelector('#voice-select');


// Init voices array
let voices = [];


const getVoices = () => {
  voices = synth.getVoices();
};

if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = getVoices;
}

const newSpeak = (data) => {


	if (synth.speaking) {
    console.error(`Already speaking...${data}`);
    return;
  	}

	// Get speak text
	const speakText = new SpeechSynthesisUtterance(data);

	speakText.onstart = e => {
		console.log('Iris: '+data);
		stopRecog(); //Stops recognition so bot doesnt hear itself
	}

	// Speak end
    speakText.onend = e => {
      console.log('------------------------');
      if(data!='Iris signing off.' && data!='Hello there.'){
      	startRecog(); //Resumes recognition after speech ends
      }
    };

    // Speak error
    speakText.onerror = e => {
      console.error('Something went wrong');
    };

    voices.forEach(v=>{
    	if (v.name == 'Google UK English Female'){
    		speakText.voice = v;
    	}
    })

    speakText.volume = 1;
    speakText.pitch = 1;
    speakText.rate = 1;

    // Speak
    synth.speak(speakText);

};

// Voiceover Stuff Ends --------------------------------------------------

// Websocket Connection
var socket = io.connect('http://localhost:3456');

function emitServer(data){
	socket.emit('command', data);
};

function emitMovie(data){
	socket.emit('emitMovie', data);
}

function emitWeather(data){
	socket.emit('emitWeather', data);
}

function emitHeadlines(data){
	socket.emit('emitHeadlines', data);
}

socket.on('sendMovie', data=>{
	var movieInfo = `The movie ${data.title} was released in ${data.year} and is rated ${data.rating} on IMDB.`;
	window.open(data.poster, '_blank');
	console.log(data.imdburl);
	newSpeak(movieInfo);
})

socket.on('sendWeather', data=>{

	var weatherInfo = `The weather in ${data.location.name} is ${data.current.skytext} with a temperature of ${data.current.temperature} degree Celsius.`;
	if(forecast){
		var avgTemp = (parseInt(data.forecast[0].low) + parseInt(data.forecast[0].high))/2;
		weatherInfo = `The weather tomorrow in ${data.location.name} is ${data.forecast[0].skytextday} with a temperature of ${avgTemp} degree Celsius.`
	}

	newSpeak(weatherInfo);
})

socket.on('sendHeadlines', data=>{

	for(i=0; i<6; i++){
		console.log(`${data[i].title}`);
	}
	console.log(`Read more at ${data[0].sourceURL}`);
})

const fs = require('fs');
const bodyParser = require('body-parser');

const data = fs.readFileSync('additional.json');
const additional = JSON.parse(data);

const afinndata = fs.readFileSync('afinn.json');
const afinn = JSON.parse(afinndata);

const express = require('express');
const app = express();

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const server = app.listen(3000, () => {
  console.log('Open on localhost:3000');
});

// :makes it a param ? after makes it optional
app.get('/add/:word/:score?', addWord);

function addWord(request, response){
  var data = request.params;
  var word = data.word;
  var score = Number(data.score);

  additional[word] = score;

  if(!score){
    var reply = {
      msg: 'No score given'
    }
    response.send(reply); 
  }else{
    additional[word] = score;
    var data = JSON.stringify(additional, null, 2);
    fs.writeFile('additional.json', data, finished);
    
    function finished(err){
      console.log('all set.');
      var reply = {
        word: word,
        score: score,
        status: 'success'
      }
       response.send(reply); 
    }
  }
 
};

app.get('/all', sendAll);

function sendAll(request, response){
  var data = {
    additional: additional,
    afinn: afinn
  }

  response.send(data);
};

app.get('/search/:word', searchWord);

function searchWord(request, response){
  var word = request.params.word;
  var reply = '';
  if(additional[word]){
    reply = {
      status: 'found',
      word: word,
      score: additional[word]
    }
  }else{
    reply = {
      status: 'not found',
      word: word
    }
  }
  response.send(reply);
};

app.post('/analyze', analyzeThis);

function analyzeThis(request, response){
  var text = request.body.text;
  var words = text.split(/\W+/);

  var totalScore = 0;
  var score = 0;

  for(var i = 0; i < words.length; i++){
    var word = words[i];
    if(additional.hasOwnProperty(word)){
      score = Number(additional[word]);
    }else if (afinn.hasOwnProperty(word)){
      score = Number(afinn[word]);
    }
    totalScore += score;
  }
  console.log(score, words);
  var comp = totalScore / words.length;

  reply = {
    score: totalScore,
    comparative: comp
  }

  response.send(reply); 
};
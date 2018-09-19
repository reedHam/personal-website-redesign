var express = require('express');
var app = express();
var server = require('http').Server(app);
app.set('view engine', 'ejs');

app.use('/css', express.static(__dirname + '/css'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/scripts', express.static(__dirname + '/scripts'));

app.get('/', function (req, res) {
    res.render('pages/index', {title: "Reed Hambrook"});
});

app.get('/connect4', function (req, res) {
    res.render('pages/connect4', {title: "Connect 4"});
});

app.get('/GPUFractal', function (req, res) {
    res.render('pages/GPUFractal', {title: "GPU Fractal"});
});

server.listen(8080, '127.0.0.1');

const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');


const app = express();

const domain = 'reedhambrook.ca'
const privateKey = fs.readFileSync(`/etc/letsencrypt/live/${domain}/privkey.pem`, 'utf8');
const certificate = fs.readFileSync(`/etc/letsencrypt/live/${domain}/cert.pem`, 'utf8');
const ca = fs.readFileSync(`/etc/letsencrypt/live/${domain}/chain.pem`, 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

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

app.get('/sudokuSolver', function (req, res) {
    res.render('pages/sudokuSolver', {title:'Sudoku Solver'});
});

app.get('/.well-known/acme-challenge/SLSLpqYQU2UzU9CYB7V8cRw98H5NOtiSKt2oyUJz2T8', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send('SLSLpqYQU2UzU9CYB7V8cRw98H5NOtiSKt2oyUJz2T8.1u4AdD5tfMehKt5I1Lo0SY9r5EXK-f_ksiAsShXZsZw');
});

httpServer.listen(80, '138.68.234.6');
httpsServer.listen(443, '138.68.234.6');

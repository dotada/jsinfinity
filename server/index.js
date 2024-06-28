import * as fs from 'fs';
import { Server } from 'socket.io';
const io = new Server(3000, {maxHttpBufferSize: 1e8});
import express from 'express';
const app = express();
import path, { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let file = '';
let id = '0';

if (!fs.existsSync('id.txt')) {
    fs.open('id.txt', 'w', function (err, file) {
        if (err) throw err;
    });
    fs.writeFile('id.txt', '1', function (err) {
        if (err) throw err;
    });
};

function refresh() {
    fs.readdirSync('./worlds').forEach((file) => {
        app.get(`/${file}`, (req, res) => {
            res.sendFile(join(__dirname, "worlds", req.url.replace("/", "")))
        });
    });
};

io.on('connection', (socket) => {
    socket.on('description', (dsc) => {
        fs.readFile('id.txt', function(err, data){
            if (err) throw err;
            id = data.toString('utf8');
            fs.open('./worlds/world_' + id + ".html", 'w', function(err, fd) {
                if (err) throw err;
                file = '';
                file += '<!DOCTYPE html>';
                file += `<html> \n <head> \n <meta name="viewport" content="width=device-width,initial-scale=1.0"> \n <title>Deja's infinite minecraft world catalog</title> \n`
                file += '<style> \n .list {display: flex; flex-direction: column;} \n </style> \n </head> \n <body> \n <ul class="list"> \n';
                file += '<b>World ' + id + '</b> \n';
                file += '<p>Description: ' + dsc + '</p> \n';
                fs.close(fd, () => {});
                
            });
        });
    });
    socket.on('image', (data) => {
        console.log('img');
        file += "<img width='1720' height='720' src='data:image/jpeg;base64," + data + "'> \n";
        file += "</ul> \n </body> \n </html> \n"
        fs.writeFile('./worlds/world_' + id + ".html", file, function (err) {
            if (err) throw err;
        });
        fs.writeFile('id.txt', (parseInt(id)+1).toString(), function(err) {
            if (err) throw err;
            refresh();
            socket.emit('status', 'done');
        });
    });
});

app.get('/', (req, res) => {
    let ret = '';
    ret += `<style> \n .list {display: flex; flex-direction: column;} \n </style> <ul class="list">`;
    fs.readdirSync('./worlds').forEach((file) => {
        ret += `<a href="${file}">${file.split('.')[0]}</a>`;
    });
    ret += "</ul> \n"
    res.send(ret);
});

app.listen(80, () => {
    console.log("express running on http://127.0.0.1:80");
    refresh();
});
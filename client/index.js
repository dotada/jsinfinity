import { io } from "socket.io-client";
import readlineSync from "readline-sync";
const socket = io("ws://127.0.0.1:3000");
import * as fs from 'fs';
import { exit } from "process";
let dscr = readlineSync.question('Description: ');
let imgpath = readlineSync.question('Image path: ');

socket.emit('description', dscr);
fs.readFile(imgpath, (err, data) => {
    if (err) {
        console.error('Error reading image:', err);
        return;
    }
    let dta = Buffer.from(data).toString('base64');
    socket.emit('image', dta);
});
socket.on('status', (arg) => {
    if (arg == "done") {
        exit();
    } else {
        console.log("the fuck?");
    }
})
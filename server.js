const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const PORT = process.env.PORT || 7000;

const app = express()

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

const server = http.createServer(app)

//criando o socket
const io = socketio(server);

let players = [];

io.on('connection', socket => {
    console.log(`Novo usuário online: ${socket.id}`);

    socket.emit('previousUsers', players);

    socket.on('disconnect', () => {
        
        let index = 0;
        console.log(players);
        for(var i = 0; i < players.length; i++){
            //console.log(players[i]);
            if(players[i].id == socket.id){
                index = i;
                //console.log(index)
            }
        }
        if (index > -1) {
            players.splice(index, 1);
        }
        console.log(players);
        io.emit('rUser', players);
    });

    socket.on('userEnter', data => {
        //console.log(data);
        players.push(data);
        io.emit('rUser', players);
    });

    socket.on('playerMarked', (data) => {
        for(var i = 0; i < players.length; i++){
            //console.log(players[i]);
            if(players[i].id == socket.id){
                players[i].marked = !players[i].marked;
                players[i].currentPos = data;
                //console.log(index)
            }
        }
        io.emit('serverMarked', players);
    });

    socket.on('adminConf', () => {
        io.emit('serverConf', {});
    });
})

server.listen(PORT, () => console.log(`Listening server on port ${PORT}`))

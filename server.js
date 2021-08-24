const express = require('express');
const useSocket = require('socket.io');


const app = express(); // express приложение
const server = require('http').Server(app); // прослойка между app и серваком
//const io = useSocket(server);
const io = require('socket.io')(server, { // создаем сокеты работающие через http сервер
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
        credentials: true,
        transports: ['websocket']
    }
});
//const io = require('socket.io')(server,{cors:{origin:"*"}});

app.use(express.json()); // парсить постдату
app.use(express.urlencoded({extended: true}));

const rooms = new Map();

app.get('/rooms/:id', (req, res) => { // когда придет get запрос по id комнате я ее ВЕРНУ!
  //const roomId = req.query.id; // строка после params
  //console.log(req.params);
  //const roomId = req.params.id;
  const { id: roomId } = req.params;
  const obj = rooms.has(roomId) ?  {
    users: [...rooms.get(roomId).get('users').values()],
    messages: [...rooms.get(roomId).get('messages').values()]
  } : { users: [], messages: [] };
  console.log('Получил даннные комнаты: ' + roomId);
  res.json(obj);
});

app.post('/rooms', (req, res) => {
  const {roomId, userName} = req.body;
  if(!rooms.has(roomId)){
    rooms.set(
      roomId,
      new Map([
      ['users', new Map()],
      ['messages', []],
    ]),
  );
    console.log('Комната создана! ID комнаты: ' + roomId);
  }
    console.log('Вошел в комнату ' + roomId);
  //console.log(req.body);
  //console.log(rooms);
  //console.log(Object.fromEntries(rooms));
  //res.json([...rooms.keys()]);

  res.send();
});


io.on('connection', socket => {
  socket.on('ROOM:JOIN', ({roomId, userName}) => {
    //console.log(roomId);
    socket.join(roomId); // для привязки к комнате
    rooms.get(roomId).get('users').set(socket.id, userName);
    console.log(rooms.get(roomId).get('users'));
    //const users = rooms.get(roomId).get('users').values(); // получаем имена пользователей
    const users = [...rooms.get(roomId).get('users').values()]; // получаем имена пользователей
    //console.log(users);
    //console.log(roomId);
    socket.to(roomId).emit('ROOM:SET_USERS', users);
  });

  socket.on('ROOM:NEW_MESSAGE', ({roomId, userName, text}) => {
    const obj = {
      userName,
      text,
    };
    rooms.get(roomId).get('messages').push(obj);
    // теперь надо оповестить всех пользователей
    socket.to(roomId).emit('ROOM:NEW_MESSAGE', obj);
    console.log(`Новое сообщение в комнате ${roomId}`);
  });

  socket.on('disconnect', () => {
    rooms.forEach((value, roomId) => {
      const userName = value.get('users').get(socket.id);
      if(value.get('users').delete(socket.id)) {
        console.log(`${userName} вышел из комнаты ${roomId}`);
        const users = [...value.get('users').values()];
        socket.to(roomId).emit('ROOM:SET_USERS', users);

      }
    });

  });
  //console.log(socket.id);
});



server.listen(9999, (err) => {
  if(err){
    throw Error(err);
  };
  console.log('Сервер запущен');
});

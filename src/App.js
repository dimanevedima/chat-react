import React, {useReducer, useEffect} from 'react';
//import socket from 'socket.io-client';
import socket from './socket';
import axios from 'axios';

import JoinBlock from './components/JoinBlock';
import Chat from './components/Chat';
import reducer from './reducer';
//const io = socket('http://localhost:9999');
//const io = socket();

const App = () => {
  const [state, dispatch] = useReducer(reducer, {
  joined: false,
  roomId: null,
  userName: null,
  users: [],
  messages: [],
});

  const onLogin = async (obj) => {
    dispatch({
      type: 'JOINED',
      payload: obj,
    });
    socket.emit('ROOM:JOIN', obj); // нужно отправить сокет запрос на бэкенд
    const {data} = await axios.get(`/rooms/${obj.roomId}`);
    //setUsers(data.users);
    dispatch({
      type: 'SET_DATA',
      payload: data,
    })
  };

  const addMessage = (message) => {
    dispatch({
      type: 'NEW_MESSAGE',
      payload: message,
    });
  };


  const setUsers = (users) => { // получаем пользователей теерь надо их сохранить
    dispatch({
      type: 'SET_USERS',
      payload: users,
    });
  };


  useEffect(() => {  // только один слушателей

    // socket.on('ROOM:JOINED', users => {
    //   console.log('NEW USER', users);
    //   dispatch({
    //     type: 'SET_USERS',
    //     payload: users,
    //   })
    // });
   //socket.on('ROOM:JOINED', setUsers);
   socket.on('ROOM:SET_USERS', setUsers);
   socket.on('ROOM:NEW_MESSAGE', message => {
     dispatch({
       type: 'NEW_MESSAGE',
       payload: message,
     });
   });
  },[]);


  window.socket = socket; // socket доступен в глобальной области
  //console.log(state);
  return (
    <div className="wrapper">
      {!state.joined ? <JoinBlock onLogin = {onLogin}/>
        : 
    <Chat {...state}  onAddMessage={addMessage}/>}

    </div>

  );
}

export default App;

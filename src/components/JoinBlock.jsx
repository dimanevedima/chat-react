import React, {useState} from 'react';
import axios from 'axios';

function JoinBlock({onLogin}) {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setLoading] = useState(false);


  const onEnter = async () => {
    if(!roomId || !userName){
      return alert('Неверные данные');
    };
    const obj = {
      roomId,
      userName
    };
    setLoading(true);
    await axios.post('./rooms', obj);
      //.then(onLogin);
    //console.log(roomId, userName);
    onLogin(obj);
    setRoomId('');
    setUserName('');
  };


  return (
    <div className="wrapper">
      <div className="join-block">
        <input
          type="text"
          placeholder="Room ID"
          value = {roomId}
          onChange = {e => setRoomId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Ваше имя"
          value = {userName}
          onChange = {e => setUserName(e.target.value)}
        />
      <button className="btn btn-success" onClick = {onEnter} disabled = {isLoading}>
              {isLoading ? 'ВХОД...' : 'ВОЙТИ'}

        </button>
      </div>
    </div>
  );
}

export default JoinBlock;

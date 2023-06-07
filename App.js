import { useEffect, useRef, useState } from 'react';
import './App.css';

// key od scaledrone accounta
const scaleDroneKey = 'VBzedHlaH1T4wk4u';
const roomName = 'observable-public-room-1';

// scaledrone
let drone = null;

function App() {
  const chatMessagesRef = useRef(null);

  const [userColorsList, setUserColorsList] = useState([]);

  const [messages, setMessages] = useState([]);
  
  const [newMessage, setNewMessage] = useState('');

  
  const [member, setMember] = useState({
    username: generateRandomUsername(),
    color: generateRandomColor()
  });

  
  useEffect(() => {
    
    drone = new window.Scaledrone(scaleDroneKey, {
      data: member
    });

    drone.on('open', error => {
      if (error) {
        return console.error(error);
      }

      setMember({ ...member, id: drone.clientId });
    });

    
    const room = drone.subscribe(roomName);

    room.on('data', (data, member) => {
      setMessages(prevMessages => [...prevMessages, data]);
    });

    room.on('members', function (members) {
      let colorsList = [];
      members.forEach(a => {
        colorsList.push(a.clientData.color)
      })

      setUserColorsList(prevColors => [...prevColors, colorsList]);
    });

    room.on('member_join', function (member) {
      setUserColorsList(prevColors => [...prevColors, member.clientData.color]);
    });

    room.on('member_leave', function (member) {
      let colorsList = userColorsList.filter(a => a != member.clientData.color);

      setUserColorsList(prevColors => [...prevColors, colorsList]);
    });
  }, []);

  
  useEffect(() => {
    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
  }, [messages]);

  function generateRandomUsername() {
    const adjectives = ['stipica', 'andrija', 'josko', 'maja', 'duska', 'ilona', 'natali', 'jan', 'nik', 'milan'];
    const nouns = ['maric', 'novakovic', 'draskovic', 'ercegovic', 'stipic', 'plejic', 'sarcevic', 'tomasovic', 'tudor', 'srsic'];

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

    const randomNumber = Math.floor(Math.random() * 1000);

    const username = randomAdjective + randomNoun + randomNumber;

    return username;
  }

  
  function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    let isColorUnique = false;

    while (!isColorUnique) {
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }

      const isColorUsed = userColorsList.some((userColor) => userColor === color);

      if (!isColorUsed) {
        isColorUnique = true;
      } else {
        color = '#';
      }
    }

    return color;
  };


  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      drone.publish({
        room: roomName,
        message: {
          text: newMessage.trim(),
          member: member
        },
      });

      setNewMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="navbar" style={{ backgroundColor: member.color }}>
      <div className='container'>
        <h1><b>{member.username}</b></h1>
      </div>
      <div className='container'>
        <div className="container-content">
          <div className="chat-container">
            <div className="chat-messages" ref={chatMessagesRef}>
              {messages.slice(0).reverse().map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.member.id == member.id ? 'current-user-message' : 'other-user-message'}`}
                >
                  <div className="user-photo" style={{ backgroundColor: message.member.color }} />
                  <div className="message-content">
                    <span className="sender">{message.member.username}</span>
                    <p className="text">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

export default App;
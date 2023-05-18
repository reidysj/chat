import { useEffect, useState } from "react";
import io from "socket.io-client";
import { v4 } from "uuid";

const PORT = 3001;
const socket = io(`http://localhost:${PORT}`);

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState("");
  const [room, setRoom] = useState("");
  const [chatIsVisible, setChatIsVisible] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    console.log("connected", socket.connected);
    socket.on("connect", () => {
      setIsConnected(true);
    });
    socket.on("disconnevt", () => {
      setIsConnected(false);
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [isConnected]);

  useEffect(() => {
    socket.on("receive_msg", ({ user, message }) => {
      const msg = `${user} send: ${message}`;
      setMessages((prevState) => [msg, ...prevState]);
    });
  }, [socket]);

  const handleEnterChatRoom = () => {
    if (user !== "" && room !== "") {
      setChatIsVisible(true);
      socket.emit("join_room", { user, room });
    }
  };

  const handleSendMessage = () => {
    const newMsgData = {
      room,
      user,
      message: newMessage,
    };
    socket.emit("send_msg", newMsgData);
    const msg = `${user} send: ${newMessage}`;
    setMessages((prevState) => [msg, ...prevState]);
    setNewMessage("");
  };

  return (
    <div style={{ pading: 20 }}>
      {!chatIsVisible ? (
        <>
          <input
            type="text"
            placeholder="user"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <br />
          <input
            type="text"
            placeholder="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <br />
          <button onClick={handleEnterChatRoom}>Enter</button>
        </>
      ) : (
        <>
          <h5>
            Room: {room} | User: {user}
          </h5>
          <div
            style={{
              height: 200,
              width: 250,
              border: "1px solid black",
              overflowY: "scroll",
              marginBottom: 10,
              padding: 10,
            }}
          >
            {messages.map((msg) => (
              <div key={v4()}>{msg}</div>
            ))}
          </div>
          <input
            type="text"
            placeholder="message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={handleSendMessage}>Send Message</button>
        </>
      )}
    </div>
  );
}

export default App;

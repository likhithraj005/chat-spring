import React, { useEffect, useState, useRef } from 'react'
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

//new feature
import Picker from 'emoji-picker-react';

var stompClient = null;
const ChatRoom = () => {

    const [privateChats, setPrivateChats] = useState(new Map())
    const [publicChats, setPublicChats] = useState([])
    const [tab, setTab] = useState("CHATROOM")

    //new feature
    const [unreadMessages, setUnreadMessages] = useState(new Map());


    const [userData, setUserData] = useState({
        username: '',
        receivername: '',
        connected: false,
        message: ''
    });

    const messageEndRef = useRef(null);

    // const scrollToBottom = () => {
    //     messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // };

    const scrollToBottom = () => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    // useEffect(() => {
    //     console.log(userData)
    // }, [userData])

    // useEffect(() => {
    //     return () => {
    //         if (stompClient) {
    //             stompClient.deactivate();
    //         }
    //     };
    // }, []);

    useEffect(() => {
        // scrollToBottom();

        // Delay scroll to ensure the DOM has updated
        setTimeout(scrollToBottom, 0);  // Scroll after the render is complete
    }, [publicChats, privateChats, tab]);  // Trigger scroll when messages or tab changes
    
    

    const connect = () => {

        //const Sock = new SockJS('http://chatserver-env.eba-ipfcthvz.eu-north-1.elasticbeanstalk.com/ws');
        //const Sock = new SockJS('http://localhost:8080/ws');
        
         // Log the WebSocket URL to the console for confirmation
        console.log(`WebSocket URL: ${process.env.REACT_APP_WS_URL}`);
        const Sock = new SockJS(process.env.REACT_APP_WS_URL);

        stompClient = new Client({
            webSocketFactory: () => Sock,
            debug: (str) => console.log(str), // For debugging
            reconnectDelay: 5000, // Reconnect delay in milliseconds
        });
    
        stompClient.onConnect = onConnected;
        stompClient.onStompError = onError;
    
        stompClient.activate(); // Activate the client
    };
    
    

    const onConnected = () => {
        setUserData({ ...userData, "connected": true })

        // stompClient.subscribe('/chatroom/public', onMessageReceived)
        // stompClient.subscribe('/user/' + userData.username + '/private', onPrivateMessage)

        stompClient.subscribe('/chatroom/public', onMessageReceived);
        stompClient.subscribe(`/user/${userData.username}/private`, onPrivateMessage);

        userJoin()
    }

    const userJoin = () => {
        var chatMessage = {
            senderName: userData.username,
            status: "JOIN"
        };

        stompClient.publish({
            destination: "/app/message",
            body: JSON.stringify(chatMessage),
        });        
    }

    // const onMessageReceived = (payload) => {
    //     var payloadData = JSON.parse(payload.body)

    //     switch (payloadData.status) {
    //         case "JOIN":
    //             if (!privateChats.get(payloadData.senderName)) {
    //                 privateChats.set(payloadData.senderName, [])
    //                 setPrivateChats(new Map(privateChats))
    //             }
    //             break;
    //         case "MESSAGE":
    //             publicChats.push(payloadData)
    //             setPublicChats([...publicChats])
    //             break;
    //         default:
    //             console.log(`Unknown status: ${payloadData.status}`)
    //     }

    // }

    //new feature
    const onMessageReceived = (payload) => {
        const payloadData = JSON.parse(payload.body);
    
        switch (payloadData.status) {
            case "JOIN":
                if (!privateChats.get(payloadData.senderName)) {
                    privateChats.set(payloadData.senderName, []);
                    setPrivateChats(new Map(privateChats));
                }
                break;
            case "MESSAGE":
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                if (tab !== "CHATROOM") {
                    setUnreadMessages((prev) => {
                        const newMap = new Map(prev);
                        newMap.set("CHATROOM", true);
                        return newMap;
                    });
                }
                break;
            default:
                console.log(`Unknown status: ${payloadData.status}`);
        }
    };

    // const onPrivateMessage = (payload) => {
    //     console.log(payload)
    //     var payloadData = JSON.parse(payload.body)
    //     if (privateChats.get(payloadData.senderName)) {
    //         privateChats.get(payloadData.senderName).push(payloadData)
    //         setPrivateChats(new Map(privateChats))
    //     } else {
    //         let list = []
    //         list.push(payloadData)
    //         privateChats.set(payloadData.senderName, list)
    //         setPrivateChats(new Map(privateChats))
    //     }
    // }

    //new feature
    const onPrivateMessage = (payload) => {
        const payloadData = JSON.parse(payload.body);
        if (privateChats.get(payloadData.senderName)) {
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));
        } else {
            let list = [];
            list.push(payloadData);
            privateChats.set(payloadData.senderName, list);
            setPrivateChats(new Map(privateChats));
        }
    
        if (tab !== payloadData.senderName) {
            setUnreadMessages((prev) => {
                const newMap = new Map(prev);
                newMap.set(payloadData.senderName, true);
                return newMap;
            });
        }
    };

    //new feature
    const handleTabChange = (newTab) => {
        setTab(newTab);
        setUnreadMessages((prev) => {
            const newMap = new Map(prev);
            newMap.delete(newTab);
            return newMap;
        });
    };
    

    const onError = (err) => {
        console.log(err)

    }

    const handleMessage = (event) => {
        const { value } = event.target
        setUserData({ ...userData, "message": value })
    }

    //new feature
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    //new feature
    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    //new feature
    const onEmojiClick = (emojiObject) => {
        setUserData((prevData) => ({
            ...prevData,
            message: prevData.message + emojiObject.emoji,
        }));
        setShowEmojiPicker(false); // Hide the picker after selecting an emoji
    };

    // const sendValue = () => {
    //     if (stompClient) {
    //         var chatMessage = {
    //             senderName: userData.username,
    //             message: userData.message,
    //             status: "MESSAGE"
    //         }
    //         console.log(chatMessage)

    //         stompClient.publish({
    //             destination: "/app/message",
    //             body: JSON.stringify(chatMessage),
    //         });
            
    //         setUserData({ ...userData, "message": "" })
    //     }
    // }

    const sendValue = () => {
        if (stompClient && userData.message.trim() !== "") {
            var chatMessage = {
                senderName: userData.username,
                message: userData.message,
                status: "MESSAGE"
            };
            stompClient.publish({
                destination: "/app/message",
                body: JSON.stringify(chatMessage),
            });
            setUserData({ ...userData, message: "" });
        }
    };
    

    const sendPrivateValue = () => {
        if (stompClient) {
            var chatMessage = {
                senderName: userData.username,
                receiverName: tab,
                message: userData.message,
                status: "MESSAGE"
            }

            if (userData.username !== tab) {
                privateChats.get(tab).push(chatMessage)
                setPrivateChats(new Map(privateChats))
            }
            
            stompClient.publish({
                destination: "/app/private-message",
                body: JSON.stringify(chatMessage),
            });
            
            setUserData({ ...userData, "message": "" })
        }
    }

    const handleUsername = (event) => {
        const { value } = event.target
        setUserData({ ...userData, "username": value })
    }

    // const registerUser = () => {
    //     connect()
    // }

    const registerUser = () => {
        if (userData.username.trim() === "") {
            alert("Username cannot be empty!");
            return;
        }
        connect();
    };


    return (
        <div className="container">
            {userData.connected ?
                <div className="chat-box">

                    <div className="member-list">
                        {/* <ul>
                            <li onClick={() => { setTab("CHATROOM") }} className={`member ${tab === "CHATROOM" && "active"}`}>Chatroom</li>
                            {[...privateChats.keys()].map((name, index) => (
                                <li onClick={() => { setTab(name) }} className={`member ${tab === name && "active"}`} key={index}>{name}</li>
                            ))}
                        </ul> */}

                        {/* new feature */}
                        <ul>
                            <li onClick={() => handleTabChange("CHATROOM")} className={`member ${tab === "CHATROOM" && "active"}`}>
                                Chatroom
                                {unreadMessages.get("CHATROOM") && <span className="unread-indicator"></span>}
                            </li>
                            {[...privateChats.keys()].map((name, index) => (
                                <li onClick={() => handleTabChange(name)} className={`member ${tab === name && "active"}`} key={index}>
                                    {name}
                                    {unreadMessages.get(name) && <span className="unread-indicator"></span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Public Chat Section */}

                    {/* {tab === "CHATROOM" && <div className="chat-content">
                        <ul className="chat-messages">
                            {publicChats.map((chat, index) => (
                                <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                    <div className="message-data">{chat.message}</div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                </li>
                            ))}
                        </ul>

                        <div className="send-message">
                            <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} />
                            <button type="button" className="send-button" onClick={sendValue}>send</button>
                        </div>
                    </div>} */}

                    {tab === "CHATROOM" && (
                        <div className="chat-content">
                            <ul className="chat-messages">
                                {publicChats.map((chat, index) => (
                                    <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                        {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                        <div className="message-data">{chat.message}</div>
                                        {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                    </li>
                                ))}

                                <div ref={messageEndRef} />
                            </ul>

                            <div className="send-message">

                                <input
                                    type="text"
                                    className="input-message"
                                    placeholder="Enter the message"
                                    value={userData.message}
                                    onChange={handleMessage}
                                />
                                
                                {/* new feature */}
                                <div className='send-emoji'>
                                    <button className="emoji-button" onClick={toggleEmojiPicker}>
                                        😊
                                    </button>
                                    {showEmojiPicker && (
                                        <Picker
                                            onEmojiClick={onEmojiClick}
                                            pickerStyle={{ position: "absolute", bottom: "60px" }}
                                        />
                                    )}
                                </div>

                                <button type="button" className="send-button" onClick={sendValue}>
                                    Send
                                </button>

                            </div>
                        </div>
                    )}



                    {/* Private Chat Section */}

                    {/* {tab !== "CHATROOM" && <div className="chat-content">
                        <ul className="chat-messages">
                            {[...privateChats.get(tab)].map((chat, index) => (
                                <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                    <div className="message-data">{chat.message}</div>
                                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                </li>
                            ))}
                        </ul>

                        <div className="send-message">
                            <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} />
                            <button type="button" className="send-button" onClick={sendPrivateValue}>send</button>
                        </div>
                    </div>} */}

                    {tab !== "CHATROOM" && (
                        <div className="chat-content">
                            <ul className="chat-messages">
                                {[...privateChats.get(tab)].map((chat, index) => (
                                    <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                                        {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                                        <div className="message-data">{chat.message}</div>
                                        {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                                    </li>
                                ))}
                            </ul>

                            <div className="send-message">

                                <input
                                    type="text"
                                    className="input-message"
                                    placeholder="Enter the message"
                                    value={userData.message}
                                    onChange={handleMessage}
                                />

                                {/* new feature */}
                                <div className='send-emoji'>
                                    <button className="emoji-button" onClick={toggleEmojiPicker}>
                                        😊
                                    </button>
                                    {showEmojiPicker && (
                                        <Picker
                                            onEmojiClick={onEmojiClick}
                                            pickerStyle={{ position: "absolute", bottom: "60px" }}
                                        />
                                    )}
                                </div>
                                
                                <button type="button" className="send-button" onClick={sendPrivateValue}>
                                    Send
                                </button>

                            </div>
                        </div>
                    )}

                </div>
                :
                <div className="register">
                    <input
                        id="user-name"
                        placeholder="Enter your name"
                        name="userName"
                        value={userData.username}
                        onChange={handleUsername}
                        margin="normal"
                    />
                    <button type="button" onClick={registerUser}>
                        connect
                    </button>
                </div>}
        </div>
    )
}

export default ChatRoom
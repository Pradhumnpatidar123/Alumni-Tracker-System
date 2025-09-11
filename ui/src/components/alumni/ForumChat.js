import React, { useEffect, useRef, useState } from "react";
import { API_ALUMNI_URL, API_URL } from "../../utils";
import { useAuthCheck } from "../../hooks/useAuthCheck";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";

// Helper function to get profile image URL
const getProfileImageUrl = (profilePath) => {
  if (!profilePath) return null;
  // If it's already a full URL, return as is
  if (profilePath.startsWith('http')) return profilePath;
  // Otherwise, construct the URL from the server
  return `/img/${profilePath}`;
};
function AlumniForumChat() {
  const [chatData, setChatData] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [message, setMessage] = useState("");
  const [totalForumMember, setTotalForumMember] = useState(0);
  const [myId, setMyId] = useState(null);
  const [forumMembers, setForumMembers] = useState([]);
  const [showMembersList, setShowMembersList] = useState(false);
  const location = useLocation()
  const forumDetails = location.state?.forumDetails;
  //  const socket = socketIOClient.connect();
  // const [email, setEmail] = useState("");
  const { user } = useAuthCheck()
  const email = user?.email;
  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Cleanup socket on component unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);
  useEffect(() => {
    async function getChatData() {
      try {
        const response = await fetch(API_ALUMNI_URL + '/alumniForumChatView', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ forumDetails })
        });
        const data = await response.json();
        console.log("data", data);
        if (data.status === 200) {
          setChatData(Array.isArray(data.chatData) ? data.chatData : []);
          setTotalForumMember(data.totalForumMember || 0);
          setForumMembers(Array.isArray(data.forumMembers) ? data.forumMembers : []);
          setMessage(typeof data.message === 'string' ? data.message : '');
          setMyId(data.myId);
        } else {
          setMessage(typeof data.message === 'string' ? data.message : 'Error loading chat data');
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
        setMessage('Failed to load chat data');
      }
    }
    if (forumDetails) {
      getChatData();
    }
    return () => { };
  }, []);

  useEffect(() => {
    if (!forumDetails) return;
    
    if (!socketRef.current) {
      console.log('Initializing socket connection...');
      socketRef.current = io(API_URL, { 
        withCredentials: true,
        transports: ['websocket', 'polling'],
        timeout: 20000
      });
      
      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current.id);
        if (forumDetails?.forumId && myId) {
          socketRef.current.emit('forum:join', { forumId: forumDetails.forumId, userId: myId });
        }
      });
      
      socketRef.current.on('connect_error', (err) => {
        console.error('Socket connect_error:', err);
      });
      
      socketRef.current.on('forum:joined', (data) => {
        console.log('Successfully joined forum:', data.forumId);
      });
      
      socketRef.current.on('forum:newMessage', (payload) => {
        console.log('Received new message:', payload);
        if (payload?.forumId === forumDetails.forumId && payload?.chat) {
          setChatData((prev) => {
            const newChatData = Array.isArray(prev) ? [...prev, payload.chat] : [payload.chat];
            // Scroll to bottom after state update
            setTimeout(() => scrollToBottom(), 100);
            return newChatData;
          });
        }
      });
      
      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });
    }
    
    // Join room if socket is already connected
    if (socketRef.current && socketRef.current.connected && forumDetails?.forumId && myId) {
      socketRef.current.emit('forum:join', { forumId: forumDetails.forumId, userId: myId });
    }
    
    return () => {
      if (socketRef.current && forumDetails?.forumId) {
        console.log('Leaving forum:', forumDetails.forumId);
        socketRef.current.emit('forum:leave', { forumId: forumDetails.forumId });
      }
    };
  }, [forumDetails, myId]);

  // Function to scroll to bottom of chat container
  // Helper function to format date and time
  const formatDateTime = (sentDate, sentTime) => {
    if (!sentDate || !sentTime || sentDate === 'Date' || sentTime === 'Time') {
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-GB'); // DD/MM/YYYY format
      const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }); // hh:mm:ss AM/PM format
      return `${formattedDate} | ${formattedTime}`;
    }
    return `${sentDate} | ${sentTime}`;
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Auto-scroll when chatData changes
  useEffect(() => {
    scrollToBottom();
  }, [chatData]);


  const handleSendMessage = async (e) => {
    e.preventDefault(); // Prevent form submission
    if (inputMessage.trim()) {
      try {
        const response = await fetch(API_ALUMNI_URL + '/alumniForumChat',
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: inputMessage, forumDetails, email })
          }
        );
        const data = await response.json();
        console.log(data);
        if (data.success) {
          setMessage(typeof data.message === 'string' ? data.message : '');
          // Update with server response (this will have correct timestamps)
          setChatData(Array.isArray(data.chatData) ? data.chatData : []);
          setTotalForumMember(data.totalForumMember || 0);
          setForumMembers(Array.isArray(data.forumMembers) ? data.forumMembers : []);
          // Scroll to bottom after sending message
          setTimeout(() => scrollToBottom(), 100);
        } else {
          setMessage(typeof data.message === 'string' ? data.message : 'Error sending message');
        }
        setInputMessage(""); // Clear input message
      } catch (error) {
        console.error('Error sending message:', error);
        setMessage('Failed to send message');
      }
    }
  }
  if (!forumDetails) {
    return (
      <div className="container">
        <div className="text-center py-4">
          <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
          <h5 className="text-muted">Forum details not found</h5>
          <p className="text-muted">Please return to the forum list and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .chat-container::-webkit-scrollbar {
          width: 8px;
        }
        
        .chat-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .chat-container::-webkit-scrollbar-thumb {
          background: #fdbe33;
          border-radius: 4px;
        }
        
        .chat-container::-webkit-scrollbar-thumb:hover {
          background: #e6a82c;
        }
        
        .message-bubble {
          word-wrap: break-word;
          word-break: break-word;
          white-space: pre-wrap;
          overflow-wrap: break-word;
          hyphens: auto;
          line-height: 1.4;
        }
        
        .message-container {
          display: flex;
          margin-bottom: 10px;
          clear: both;
        }
        
        .message-container.sent {
          justify-content: flex-end;
        }
        
        .message-container.received {
          justify-content: flex-start;
        }
        
        .profile-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fdbe33, #e6a82c);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #122750;
          font-weight: bold;
          font-size: 12px;
          margin-right: 8px;
          flex-shrink: 0;
          border: 2px solid #122750;
          overflow: hidden;
        }
        
        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .members-sidebar {
          position: fixed;
          top: 0;
          right: -300px;
          width: 280px;
          height: 100vh;
          background: white;
          box-shadow: -2px 0 10px rgba(0,0,0,0.1);
          transition: right 0.3s ease;
          z-index: 1000;
          overflow-y: auto;
        }
        
        .members-sidebar.open {
          right: 0;
        }
        
        .member-card {
          padding: 12px;
          border-bottom: 1px solid #e5e5e5;
          transition: background 0.2s;
        }
        
        .member-card:hover {
          background: #f8f9fa;
        }
      `}</style>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-5 col-md-6">
            <div className="about-img">
              <img src="img/chat.jpg" alt="Image" />
            </div>
          </div>

          <div className="col-lg-7 col-md-6">
            <div className="section-header text-left">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="mb-0">{forumDetails?.forumTopic || "Forum Topic"}</h6>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setShowMembersList(!showMembersList)}
                  style={{fontSize: '12px', padding: '4px 8px'}}
                >
                  <i className="fas fa-users me-1"></i>
                  {totalForumMember} Members
                </button>
              </div>
              <p className="text-muted mb-2" style={{fontSize: '14px'}}>
                {forumDetails?.description || "Description"}
              </p>
              <div className="text-muted" style={{fontSize: '13px'}}>
                <i className="fas fa-calendar me-1"></i>
                {forumDetails?.startDate || "Date"} | {forumDetails?.startTime || "Time"}
              </div>
              {/* {message && (
                <div className="mt-2 p-2 rounded" style={{fontSize: '12px', backgroundColor: '#e8f4fd', color: '#0066cc', border: '1px solid #b3d9ff'}}>
                  <i className="fas fa-info-circle me-1"></i>
                  {typeof message === 'string' ? message : ''}
                </div>
              )} */}
            </div>

            <div className="about-text bg-warning" style={{ height: "60vh" }}>
              <div className="bg-light chat-container" ref={chatContainerRef} style={{ height: "80%", overflowY: "scroll", scrollBehavior: "smooth" }}>
                {Array.isArray(chatData) && chatData.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  Array.isArray(chatData) && chatData.map((obj, idx) => (
                    <div key={idx} className={`message-container ${obj.alumniId === myId ? 'sent' : 'received'}`}>
                      {obj.alumniId === myId ? (
                        <div
                          className="message-bubble"
                          style={{
                            maxWidth: "70%",
                            padding: "10px 15px",
                            borderRadius: "18px 18px 5px 18px",
                            backgroundColor: "#fdbe33",
                            color: "black",
                            animation: "slideInRight 0.3s ease-out",
                            wordWrap: "break-word",
                            wordBreak: "break-word",
                            whiteSpace: "pre-wrap",
                            overflowWrap: "break-word",
                            lineHeight: "1.4",
                            fontSize: "14px"
                          }}
                        >
                          <div style={{ marginBottom: "5px" }}>
                            {obj?.message || 'No message content'}
                          </div>
                          <div style={{ textAlign: "right", fontSize: "11px", opacity: "0.8" }}>
                            {formatDateTime(obj?.sentDate, obj?.sentTime)}
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex align-items-start" style={{maxWidth: "75%"}}>
                          <div className="profile-avatar" title={obj?.alumniName || 'Alumni'}>
                            {obj?.profile ? (
                              <img 
                                src={getProfileImageUrl(obj.profile)} 
                                alt={obj?.alumniName || 'Alumni'}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div style={{display: obj?.profile ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
                              {(obj?.alumniName || 'A').charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div
                            className="message-bubble"
                            style={{
                              flex: 1,
                              padding: "10px 15px",
                              borderRadius: "18px 18px 18px 5px",
                              backgroundColor: "#122750",
                              color: "white",
                              animation: "slideInLeft 0.3s ease-out",
                              wordWrap: "break-word",
                              wordBreak: "break-word",
                              whiteSpace: "pre-wrap",
                              overflowWrap: "break-word",
                              lineHeight: "1.4",
                              fontSize: "14px"
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <div style={{ color: "#fdbe33", fontSize: "12px", fontWeight: "600" }}>
                                {obj?.alumniName || 'Alumni'}
                              </div>
                            </div>
                            <div style={{ marginBottom: "5px" }}>
                              {obj?.message || 'No message content'}
                            </div>
                            <div style={{ textAlign: "right", fontSize: "11px", opacity: "0.8" }}>
                              {formatDateTime(obj?.sentDate, obj?.sentTime)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="w-100 py-1 px-2" style={{ backgroundColor: "#fdbe33" }}>
                <div className="mb-1" style={{ fontSize: 10, color: "#122750" }} aria-live="polite" > {inputMessage.length}/1000 characters </div>
                <form onSubmit={handleSendMessage} style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "flex-end" }}>
                  <textarea 
                    className="col-12 col-lg" 
                    style={{ 
                      borderRadius: 8, 
                      resize: "none", 
                      height: inputMessage.length > 50 ? (inputMessage.length > 150 ? 80 : 60) : 40,
                      minHeight: 40,
                      maxHeight: 80,
                      border: "1px solid #030f27", 
                      padding: 8, 
                      fontSize: 13, 
                      flex: "1 1 240px",
                      lineHeight: "1.3",
                      transition: "height 0.2s ease"
                    }} 
                    placeholder="Type your message here..." 
                    value={inputMessage} 
                    maxLength={1000} 
                    onChange={(e) => setInputMessage(e.target.value)} 
                    onKeyDown={(e) => { 
                      if (e.key === "Enter" && !e.shiftKey) { 
                        e.preventDefault(); 
                        handleSendMessage(e); 
                      } 
                    }} 
                    aria-label="Type a message" 
                  />
                  <button
                    type="submit"
                    className="btn"
                    style={{
                      height: "40px",
                      minWidth: "60px",
                      borderWidth: 0,
                      backgroundColor: "#122750",
                      color: "white",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      padding: "0 12px"
                    }}>
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Members Sidebar */}
      <div className={`members-sidebar ${showMembersList ? 'open' : ''}`}>
        <div className="p-3 border-bottom bg-primary text-white">
          <div className="d-flex align-items-center justify-content-between">
            <h6 className="mb-0">Forum Members</h6>
            <button 
              className="btn btn-sm btn-outline-light"
              onClick={() => setShowMembersList(false)}
              style={{fontSize: '12px', padding: '2px 6px'}}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div className="p-2">
          {Array.isArray(forumMembers) && forumMembers.length > 0 ? (
            forumMembers.map((member, index) => (
              <div key={member.alumniId || index} className="member-card">
                <div className="d-flex align-items-center">
                  <div className="profile-avatar me-2">
                    {member?.profile ? (
                      <img 
                        src={getProfileImageUrl(member.profile)} 
                        alt={member?.alumniName || member?.name || 'Alumni'}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{display: member?.profile ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
                      {(member?.alumniName || member?.name || 'A').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold" style={{fontSize: '13px', color: '#122750'}}>
                      {member?.alumniName || member?.name || 'Unknown'}
                      {member.alumniId === myId && (
                        <span className="badge bg-warning text-dark ms-1" style={{fontSize: '10px'}}>You</span>
                      )}
                    </div>
                    {member?.email && (
                      <div className="text-muted" style={{fontSize: '10px'}}>
                        <i className="fas fa-envelope me-1"></i>
                        {member.email}
                      </div>
                    )}
                    {member?.currentCompany && (
                      <div className="text-muted" style={{fontSize: '10px'}}>
                        <i className="fas fa-building me-1"></i>
                        {member.currentCompany}
                      </div>
                    )}
                    {member?.designation && (
                      <div className="text-muted" style={{fontSize: '10px'}}>
                        <i className="fas fa-user-tie me-1"></i>
                        {member.designation}
                      </div>
                    )}
                    {member?.stream && member?.branch && (
                      <div className="text-muted" style={{fontSize: '10px'}}>
                        <i className="fas fa-graduation-cap me-1"></i>
                        {member.stream} - {member.branch}
                      </div>
                    )}
                    {member?.passOutYear && (
                      <div className="text-muted" style={{fontSize: '10px'}}>
                        <i className="fas fa-calendar me-1"></i>
                        Class of {member.passOutYear}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted p-3" style={{fontSize: '13px'}}>
              <i className="fas fa-users fa-2x mb-2"></i>
              <div>No member details available</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Backdrop */}
      {showMembersList && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999}}
          onClick={() => setShowMembersList(false)}
        ></div>
      )}
    </>
  );
}

export default AlumniForumChat;

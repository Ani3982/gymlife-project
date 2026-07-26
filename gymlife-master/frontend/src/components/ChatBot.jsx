import React, { useState, useRef, useEffect } from 'react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hi there! I am your GymLife AI Fitness Assistant. How can I help you crush your fitness goals today?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  const quickReplies = [
    'What are your hours?',
    'Tell me about classes',
    'Calculate BMI details',
    'Membership pricing plans'
  ];

  const getBotResponse = (userText) => {
    const text = userText.toLowerCase();
    
    if (text.includes('hour') || text.includes('open') || text.includes('time')) {
      return 'GymLife is open 24/7 for all VIP members! Our staffed hours are Monday to Friday: 6:00 AM - 10:00 PM, and Saturday & Sunday: 8:00 AM - 8:00 PM.';
    }
    if (text.includes('class') || text.includes('timetable') || text.includes('offer')) {
      return 'We offer Strength training, Weightlifting, Indoor Cycling, Kettlebell, Boxing, and HIIT classes. You can view details on our /class-details page or schedule a session in the timetable!';
    }
    if (text.includes('bmi') || text.includes('calculate')) {
      return 'You can check your Body Mass Index directly on our website! Head over to the "Bmi calculate" page under the "Pages" tab in our navigation menu.';
    }
    if (text.includes('price') || text.includes('pricing') || text.includes('plan') || text.includes('membership')) {
      return 'Our plans start from just $39.00/single class drop-in. We also offer Unlimited monthly access ($59.00/6-month contract) and premium annual passes ($99.00/month). You can enroll directly on our home page!';
    }
    if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
      return 'Hello! How can I help you today? Ask me about workouts, class details, hours, or membership options!';
    }
    if (text.includes('workout') || text.includes('exercise') || text.includes('train')) {
      return 'To get started, we recommend scheduling an appointment with one of our certified trainers (like Athart Rachel) via our website form, or checking our Services page for customized training plans!';
    }
    
    return "I'm here to help you get strong! Ask me about classes, gym hours, pricing plans, or trainers, or visit our Contact page to speak with our staff directly.";
  };

  const handleSendMessage = (textToSend) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const responseText = getBotResponse(textToSend);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: responseText
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#f36100',
          border: 'none',
          boxShadow: '0 4px 20px rgba(243, 97, 0, 0.4)',
          cursor: 'pointer',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        className="chatbot-toggle-btn"
      >
        {isOpen ? (
          <i className="fa fa-times" style={{ color: '#fff', fontSize: '24px' }}></i>
        ) : (
          <i className="fa fa-comments" style={{ color: '#fff', fontSize: '26px' }}></i>
        )}
        <span 
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: '#00e676',
            border: '2px solid #fff',
            animation: 'pulse 2s infinite'
          }}
        />
      </button>

      {/* CSS Styles injection */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.9; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.9; }
        }
        .chatbot-toggle-btn:hover {
          transform: scale(1.08);
          background-color: #e55a00;
        }
        .quick-reply-pill:hover {
          background-color: #f36100 !important;
          color: #fff !important;
          border-color: #f36100 !important;
        }
      `}</style>

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '105px',
            right: '30px',
            width: '360px',
            height: '500px',
            backgroundColor: '#151515',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            border: '1px solid #2d2d2d',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9998,
            fontFamily: "'Muli', sans-serif"
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #1f1f1f 0%, #0d0d0d 100%)',
              borderBottom: '1px solid #2d2d2d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '50%', 
                  backgroundColor: '#f36100', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}
              >
                <i className="fa fa-android" style={{ color: '#fff', fontSize: '18px' }}></i>
              </div>
              <div>
                <h4 style={{ color: '#fff', margin: 0, fontSize: '15px', fontWeight: '800' }}>GymLife AI Assistant</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00e676' }} />
                  <span style={{ color: '#00e676', fontSize: '11px', fontWeight: '600' }}>Active Now</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4c4c4' }}
            >
              <i className="fa fa-angle-down" style={{ fontSize: '20px' }}></i>
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              backgroundColor: '#111'
            }}
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                    backgroundColor: msg.sender === 'user' ? '#f36100' : '#222',
                    color: '#fff',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    border: msg.sender === 'user' ? 'none' : '1px solid #333'
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Typing Loader */}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 15px', backgroundColor: '#222', borderRadius: '12px 12px 12px 0', border: '1px solid #333' }}>
                <span style={{ color: '#f36100', fontSize: '12px', fontStyle: 'italic' }}>AI is typing...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div
            style={{
              padding: '10px 15px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              borderTop: '1px solid #2d2d2d',
              backgroundColor: '#151515'
            }}
          >
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(reply)}
                className="quick-reply-pill"
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: '1px solid #333',
                  backgroundColor: '#222',
                  color: '#c4c4c4',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: '600'
                }}
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: '12px 15px',
              borderTop: '1px solid #2d2d2d',
              display: 'flex',
              gap: '10px',
              backgroundColor: '#1a1a1a',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: '10px 15px',
                borderRadius: '20px',
                border: '1px solid #333',
                backgroundColor: '#111',
                color: '#fff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleSendMessage(inputText)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#f36100',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 2px 10px rgba(243, 97, 0, 0.3)'
              }}
            >
              <i className="fa fa-paper-plane" style={{ color: '#fff', fontSize: '14px' }}></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;

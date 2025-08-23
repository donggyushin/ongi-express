# 실시간 채팅 클라이언트 가이드

이 문서는 ongi-express 서버의 실시간 채팅 기능을 클라이언트에서 사용하는 방법을 설명합니다.

## 설치

먼저 클라이언트 프로젝트에 Socket.io 클라이언트를 설치하세요:

```bash
npm install socket.io-client
```

## 기본 설정

### JavaScript/TypeScript

```javascript
import { io } from 'socket.io-client';

// 서버 연결
const socket = io('http://localhost:3000', {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 연결 상태 확인
socket.on('connect', () => {
  console.log('서버에 연결되었습니다:', socket.id);
});

socket.on('disconnect', () => {
  console.log('서버와의 연결이 끊어졌습니다');
});
```

### React 예제

```jsx
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ChatComponent = ({ chatId, currentUser }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // 소켓 연결
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    // 채팅방 참여
    newSocket.emit('join-chat', chatId);

    // 메시지 수신 리스너
    newSocket.on('message', (data) => {
      setMessages(prev => [...prev, data.message]);
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      newSocket.emit('leave-chat', chatId);
      newSocket.disconnect();
    };
  }, [chatId]);

  const sendMessage = () => {
    if (socket && newMessage.trim()) {
      socket.emit('send-message', {
        chatId,
        message: {
          id: generateId(), // 고유 ID 생성 함수
          writerProfileId: currentUser.profileId,
          text: newMessage,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
      setNewMessage('');
    }
  };

  return (
    <div>
      {/* 메시지 목록 */}
      <div className="messages">
        {messages.map(message => (
          <div key={message.id} className="message">
            <strong>{message.writerProfileId}:</strong> {message.text}
            <span className="timestamp">{message.createdAt}</span>
          </div>
        ))}
      </div>
      
      {/* 메시지 입력 */}
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="메시지를 입력하세요..."
        />
        <button onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
};
```

## Socket 이벤트 API

### 1. 서버로 보내는 이벤트 (emit)

#### 채팅방 참여
```javascript
socket.emit('join-chat', chatId);
```

#### 채팅방 나가기
```javascript
socket.emit('leave-chat', chatId);
```

#### 메시지 전송
```javascript
socket.emit('send-message', {
  chatId: 'chat_12345',
  message: {
    id: "message_unique_id",
    writerProfileId: "user_profile_id", 
    text: "안녕하세요!",
    createdAt: "2025-08-23T05:58:13.486Z",
    updatedAt: "2025-08-23T05:58:13.486Z"
  }
});
```

### 2. 서버에서 받는 이벤트 (on)

#### 메시지 수신
```javascript
socket.on('message', (data) => {
  console.log('새 메시지:', data.message);
  // data.message 구조:
  // {
  //   id: "message_unique_id",
  //   writerProfileId: "user_profile_id",
  //   text: "메시지 내용",
  //   createdAt: "2025-08-23T05:58:13.486Z",
  //   updatedAt: "2025-08-23T05:58:13.486Z"
  // }
});
```

#### 연결 상태 이벤트
```javascript
socket.on('connect', () => {
  console.log('연결됨:', socket.id);
});

socket.on('disconnect', () => {
  console.log('연결 끊어짐');
});

socket.on('connect_error', (error) => {
  console.error('연결 오류:', error);
});
```

## 메시지 데이터 형식

모든 메시지는 다음 형식을 따릅니다:

```typescript
interface Message {
  id: string;                    // 메시지 고유 ID
  writerProfileId: string;       // 작성자 프로필 ID
  text: string;                  // 메시지 내용
  createdAt: string;             // 생성 시간 (ISO 8601 형식)
  updatedAt: string;             // 수정 시간 (ISO 8601 형식)
}
```

## 실제 사용 예제

### 1. 간단한 채팅 앱

```javascript
class ChatApp {
  constructor(serverUrl, chatId, userProfileId) {
    this.socket = io(serverUrl);
    this.chatId = chatId;
    this.userProfileId = userProfileId;
    this.init();
  }

  init() {
    // 서버 연결 시 채팅방 참여
    this.socket.on('connect', () => {
      console.log('서버 연결 성공');
      this.socket.emit('join-chat', this.chatId);
    });

    // 메시지 수신 처리
    this.socket.on('message', (data) => {
      this.displayMessage(data.message);
    });

    // 연결 종료 시 채팅방 나가기
    window.addEventListener('beforeunload', () => {
      this.socket.emit('leave-chat', this.chatId);
    });
  }

  sendMessage(text) {
    const message = {
      id: this.generateMessageId(),
      writerProfileId: this.userProfileId,
      text: text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.socket.emit('send-message', {
      chatId: this.chatId,
      message: message
    });
  }

  displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
      <strong>${message.writerProfileId}:</strong>
      <span>${message.text}</span>
      <small>${new Date(message.createdAt).toLocaleTimeString()}</small>
    `;
    
    document.getElementById('messages').appendChild(messageElement);
    
    // 스크롤을 최신 메시지로 이동
    messageElement.scrollIntoView();
  }

  generateMessageId() {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  disconnect() {
    this.socket.emit('leave-chat', this.chatId);
    this.socket.disconnect();
  }
}

// 사용 예제
const chat = new ChatApp('http://localhost:3000', 'chat_12345', 'user_profile_123');

// 메시지 전송
document.getElementById('send-button').addEventListener('click', () => {
  const input = document.getElementById('message-input');
  if (input.value.trim()) {
    chat.sendMessage(input.value);
    input.value = '';
  }
});
```

### 2. Vue.js 예제

```vue
<template>
  <div class="chat-container">
    <div class="messages" ref="messagesContainer">
      <div 
        v-for="message in messages" 
        :key="message.id"
        class="message"
        :class="{ 'my-message': message.writerProfileId === currentUser.profileId }"
      >
        <div class="message-content">
          <strong v-if="message.writerProfileId !== currentUser.profileId">
            {{ message.writerProfileId }}:
          </strong>
          {{ message.text }}
        </div>
        <div class="timestamp">
          {{ formatTime(message.createdAt) }}
        </div>
      </div>
    </div>
    
    <div class="input-container">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        placeholder="메시지를 입력하세요..."
        class="message-input"
      />
      <button @click="sendMessage" :disabled="!newMessage.trim()">
        전송
      </button>
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  props: {
    chatId: String,
    currentUser: Object
  },
  
  data() {
    return {
      socket: null,
      messages: [],
      newMessage: ''
    };
  },
  
  mounted() {
    this.initSocket();
  },
  
  beforeUnmount() {
    if (this.socket) {
      this.socket.emit('leave-chat', this.chatId);
      this.socket.disconnect();
    }
  },
  
  methods: {
    initSocket() {
      this.socket = io('http://localhost:3000');
      
      this.socket.on('connect', () => {
        console.log('서버에 연결됨');
        this.socket.emit('join-chat', this.chatId);
      });
      
      this.socket.on('message', (data) => {
        this.messages.push(data.message);
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      });
    },
    
    sendMessage() {
      if (!this.newMessage.trim()) return;
      
      const message = {
        id: this.generateId(),
        writerProfileId: this.currentUser.profileId,
        text: this.newMessage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.socket.emit('send-message', {
        chatId: this.chatId,
        message
      });
      
      this.newMessage = '';
    },
    
    generateId() {
      return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    formatTime(dateString) {
      return new Date(dateString).toLocaleTimeString();
    },
    
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      container.scrollTop = container.scrollHeight;
    }
  }
};
</script>
```

## 주의사항

1. **연결 관리**: 컴포넌트 언마운트나 페이지 이동 시 반드시 `leave-chat`을 호출하고 소켓 연결을 해제하세요.

2. **메시지 ID**: 각 메시지는 고유한 ID를 가져야 합니다. 클라이언트에서 임시 ID를 생성하고, 서버에서 실제 저장된 메시지 ID로 교체할 수 있습니다.

3. **에러 처리**: 네트워크 오류나 서버 문제에 대비해 적절한 에러 처리를 구현하세요.

4. **성능 최적화**: 많은 메시지가 있는 경우 가상화나 페이지네이션을 고려하세요.

5. **보안**: 실제 운영환경에서는 적절한 인증 및 권한 검증을 구현해야 합니다.

## 서버 설정

서버는 다음 주소에서 실행됩니다:
- 개발환경: `http://localhost:3000`
- WebSocket 엔드포인트: 자동으로 `/socket.io/` 경로에 설정됩니다

CORS는 모든 도메인에서 접근 가능하도록 설정되어 있습니다.
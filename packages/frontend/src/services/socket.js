import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinBoard(boardId) {
    if (this.socket) {
      this.socket.emit('joinBoard', boardId);
    }
  }

  leaveBoard(boardId) {
    if (this.socket) {
      this.socket.emit('leaveBoard', boardId);
    }
  }

  emitBoardUpdate(boardId, board) {
    if (this.socket) {
      this.socket.emit('boardUpdate', { boardId, board });
    }
  }

  onBoardUpdate(callback) {
    if (this.socket) {
      this.socket.on('boardUpdated', callback);
    }
  }

  offBoardUpdate() {
    if (this.socket) {
      this.socket.off('boardUpdated');
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();

class SessionStore {
  findSession(sessionId) {}
  saveSession(sessionId, session) {}
  findAllSessions() {}
}

class InMemorySessionStore extends SessionStore {
  constructor() {
    super();
    this.sessions = new Map();
  }

  findSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  saveSession(sessionId, session) {
    this.sessions.set(sessionId, session);
  }

  deleteSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  findAllSessions() {
    return [...this.sessions.values()];
  }
}

module.exports = {
  InMemorySessionStore
};

const app = require("./config/express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Server is running on port: ${process.env.SERVER_PORT}`);
});

// Socket.io
const { InMemorySessionStore } = require("./wss/SessionStore");
const sessionStore = new InMemorySessionStore();

io.use((socket, next) => {
  const sessionId = socket.handshake.auth.sessionId;

  if (sessionId) {
    const session = sessionStore.findSession(sessionId);
    if (session) {
      socket.sessionId = sessionId;
      socket.userId = session.userId;
      return next();
    }
  }

  const userId = socket.handshake.auth.userId;

  if (userId == undefined) {
    console.log("Invalid userId");
    return next(new Error("invalid userId"));
  }

  socket.sessionId = randomId();
  socket.userId = userId;

  next();
});

io.on("connection", (socket) => {
  // persist session
  sessionStore.saveSession(socket.sessionId, {
    userId: socket.userId,
    connected: true,
  });

  // emit session details
  socket.emit("session", {
    sessionId: socket.sessionId,
    userId: socket.userId,
  });

  socket.join(socket.userId);

  const users = [];

  sessionStore.findAllSessions().forEach((session) => {
    users.push({
      userId: session.userId,
      connected: session.connected,
    });
  });

  socket.emit("users", users);

  socket.broadcast.emit("user connected", {
    userId: socket.userId,
  });

  socket.on(
    "private message",
    ({
      mensagem_id,
      usuario_emissor_id,
      usuario_receptor_id,
      mensagem_conteudo,
      mensagem_data,
    }) => {
      const message = {
        mensagem_id,
        usuario_emissor_id,
        usuario_receptor_id,
        mensagem_conteudo,
        mensagem_data,
      };

      socket
        .to(usuario_receptor_id)
        .to(socket.userId)
        .emit("private message", message);
    }
  );

  socket.on("typing", () => {
    socket.broadcast.emit("typing", {
      userId: socket.userId,
    });
  });

  socket.on("stop typing", () => {
    socket.broadcast.emit("stop typing", {
      userId: socket.userId,
    });
  });

  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userId).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      socket.broadcast.emit("user disconnected", {
        userId: socket.userId,
        connected: false,
      });

      sessionStore.deleteSession(socket.sessionId);
    }
  });
});

http.listen(process.env.WSS_PORT, function () {
  console.log(`Socket is listening on port: ${process.env.WSS_PORT}`);
});

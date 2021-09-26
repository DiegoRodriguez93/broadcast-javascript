var listOfUsers = {};

const stream = (socket) => {
  const deleteDisconnetedUsers = () => {
    Object.keys(listOfUsers).forEach((userId) => {
      if (!Object.keys(socket.server.clients().connected).includes(userId)) {
        delete listOfUsers[userId];
        socket.broadcast.emit("listOfUsers", listOfUsers);
      }
    });
  };

  socket.on("subscribe", (data) => {
    //subscribe/join a room
    socket.join(data.room);
    socket.join(data.socketId);

    //Inform other members in the room of new user's arrival
    if (socket.adapter.rooms[data.room].length > 1) {
      socket.to(data.room).emit("new user", { socketId: data.socketId });
    }
  });

  socket.on("newUserStart", (data) => {
    socket.to(data.to).emit("newUserStart", { sender: data.sender });
  });

  socket.on("sdp", (data) => {
    socket
      .to(data.to)
      .emit("sdp", { description: data.description, sender: data.sender });
  });

  socket.on("ice candidates", (data) => {
    socket.to(data.to).emit("ice candidates", {
      candidate: data.candidate,
      sender: data.sender,
    });
  });

  socket.on("chat", (data) => {
    socket.to(data.room).emit("chat", {
      sender: data.sender,
      msg: data.msg,
      admin: data.admin,
      senderSocketId: data.senderSocketId,
    });
  });

  socket.on("online", ({ socketId, username }) => {
    if (
      !listOfUsers[socketId] &&
      Object.keys(socket.server.clients().connected).includes(socketId)
    ) {
      listOfUsers[socketId] = username;
      socket.broadcast.emit("listOfUsers", listOfUsers);
    }

    deleteDisconnetedUsers();
  });

  socket.on("offline", ({ socketId }) => {
    console.log("User disconnected");
    if (listOfUsers[socketId]) {
      delete listOfUsers[socketId];
      socket.broadcast.emit("listOfUsers", listOfUsers);
    }

    deleteDisconnetedUsers();
  });

  socket.on("disconnecting", () => {
    deleteDisconnetedUsers();
  });

  socket.on("disconnect", () => {
    deleteDisconnetedUsers();
  });

  socket.on("banUser", ({ senderSocketId }) => {
    socket.broadcast.emit("banUser", { senderSocketId });
  });

  setInterval(() => {
    socket.broadcast.emit("listOfUsers", listOfUsers);
  }, 30000);
};

module.exports = stream;

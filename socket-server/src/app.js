const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// in-memory store of documents, don't do this in production, use db. 
const documents = {};


// .on is an event listener, 1st parameter is name of event, 2nd is a callback that executes when event fires with the event payload.
io.on("connection", socket => {
  let previousId;
  const safeJoin = currentId => {
    socket.leave(previousId);
    socket.join(currentId);
    previousId = currentId;
  };
  
  // event type that sock is listening from the client
  socket.on('getDoc', docId => {
    safeJoin(docId);
    // event type that is emitted from socket to client
    socket.emit("document", documents[docId]);
  });
 
  // event type that sock is listening from the client
  socket.on("addDoc", doc => {
    documents[doc.id] = doc;
    safeJoin(doc.id);
    // event type that is emitted from socket to client
    io.emit("documents", Object.keys(documents));
    socket.emit("document", doc);
  });
  
  // event type that sock is listening from the client
  socket.on("editDoc", doc => {
    documents[doc.id] = doc;
    // event type that is emitted from socket to client
    socket.to(doc.id).emit("document", doc);
  });
  // event type that is emitted from socket to client
  io.emit("documents", Object.keys(documents));

  console.log(`Socket ${socket.id} has connected.`);
});

http.listen(4444, () => {
  console.log('Listening on port 4444.');
});
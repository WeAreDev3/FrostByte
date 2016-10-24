/*
** app.js is where the server starts its program.
** It instantiates a new node.js server, opens its
** port to any incoming clients, and configures socket.io.
*/

// Include all of the required node modules
let http = require('http')
let path = require('path')
let express = require('express')

// Create a working node app
let app = express()
let server = http.createServer(app)

// Instantiate a websocket server
let io = require('socket.io').listen(server)

// Link all of our files together
let router = require('./server/router')

// Instantiate the lobby object at the very beginning to globalize
let lobbies = {}

// Set the main directory for client files to the /client directory
app.set('view options', {
  layout: false
})
app.use(express.static(path.resolve(__dirname, 'client')))
app.get('/changelog', (req, res) => {
  res.sendfile(path.resolve('./client/changelog.html'))
})

// Generates and returns a list of all of the lobbies on the server
let createLobbyList = () => {
  let lobbyList = {}

  for (let lobby in lobbies) {
    if (lobbies.hasOwnProperty(lobby)) {
      lobbyList[lobby] = {
        'playerCount': Object.keys(lobbies[lobby].clients).length
      }
    }
  }

  return lobbyList
}

// Runs 'callback' on all connected clients
let forEachSocket = callback => {
  let clients = io.sockets.connected
  let clientIds = Object.keys(clients)

  for (let i = clientIds.length - 1; i >= 0; i--) {
    callback(clients[clientIds[i]])
  }
}

// Define what happens when a user connects to the server
io.on('connection', socket => {
  // Log the new socket's ID to the server's console
  console.log('Socket connected:', socket.id)

  // When signing in, send them all the lobbies
  socket.on('signIn', data => {
    socket.name = data.name
    socket.isInLobby = true
    socket.emit('lobbyList', createLobbyList())
  })

  // When the player requests that a new lobby be created, create a new lobby
  socket.on('newLobby', () => {
    let lobby = router.createLobby(5)
    let listOfLobbies

    lobbies[lobby.id] = lobby

    listOfLobbies = createLobbyList()
    forEachSocket(socket => {
      if (socket.isInLobby) {
        socket.emit('lobbyList', listOfLobbies)
      }
    })
  })

  // When the player is ready to play, add them to an open lobby
  socket.on('play', data => {
    router.findLobby(lobbies, data.lobbyId).addPlayer(socket)
    socket.isInLobby = false

    let listOfLobbies = createLobbyList()
    forEachSocket(socket => {
      if (socket.isInLobby) {
        socket.emit('lobbyList', listOfLobbies)
      }
    })
  })

  // Process data received from the socket
  socket.on('message', message => {
    if (!socket.player) {
      router.findOpenLobby(lobbies).addPlayer(socket)
    }

    // Do whatever the message requires
    socket.player.parseMessage(message)
  })

  // Define what happens when a user disconnects
  socket.on('disconnect', () => {
    // Log the socket's disconnection w/ ID to the console
    console.log('Socket disconnected:', socket.id)
    if (socket.player) {
      let listOfLobbies

      // Remove the player & user from the lobby
      console.log('Player left lobby', socket.player.lobby.id)
      socket.player.lobby.removePlayer(socket)

      // If the user was the last one in the lobby, destroy the lobby
      if (!Object.keys(socket.player.lobby.clients).length) {
        socket.player.lobby.remove(lobbies)
      }

      listOfLobbies = createLobbyList()
      forEachSocket(socket => {
        if (socket.isInLobby) {
          socket.emit('lobbyList', listOfLobbies)
        }
      })
    }
  })
})

// Set the server to listen for clients on localhost:3000
server.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', function () {
  let addr = server.address()
  // Log the server's address to the console
  console.log('Server listening at', addr.address + ':' + addr.port)
})

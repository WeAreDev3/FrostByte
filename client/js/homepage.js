import socket from './socket'

window.addEventListener('load', () => {
  document.getElementById('play').addEventListener('click', signIntoGame)
  document.getElementById('createLobby').addEventListener('click', () => socket.emit('newLobby'))

  const lobbies = document.getElementById('lobbies')
  document.getElementById('joinLobby').addEventListener('click', () => {
    let lobbyId = lobbies.querySelector('tr.selected td').textContent

    if (lobbyId) {
      lobbies.classList.add('remove-display')

      // Tell the  server we are ready to play the game (I lost the game)
      socket.emit('play', { lobbyId })

      startGame()
    }
  })
})

function signIntoGame () {
  let usernameInput = document.getElementById('username')
  let username = usernameInput.value.trim()

  if (username.length) {
    document.getElementById('signIn').classList.add('remove-display')

    socket.emit('signIn', {
      name: username
    })
  } else {
    usernameInput.value = username
    usernameInput.focus()
  }
}

function startGame () {
  document.getElementById('intro').classList.add('playing')
  document.getElementById('frame').classList.add('playing')
  document.querySelector('html').classList.add('playing')
  document.querySelector('header').classList.add('playing')
}

import Game from './game'
import MainPlayer from './mainplayer'
import Player from './player'
import Enemy from './enemy'
import Bullet from './bullet'
import Hud from './hud'
import io from 'socket.io'

const socket = io()
export default socket

let game = null

socket.on('connect', () => {
  console.log(`Connected successfully as ${socket.id}`)
})

socket.on('lobbyList', (lobbies) => {
  let lobbyTable = document.querySelector('#lobbies table')
  let lobbyRow = 0

  for (let lobby in lobbies) {
    if (lobbies.hasOwnProperty(lobby)) {
      if (lobbyTable.innerText.indexOf(lobby) === -1) {
        // Add a new lobby to the table
        let row = document.createElement('tr')
        let td = document.createElement('td')
        td.textContent = lobby
        row.appendChild(td)

        td = document.createElement('td')
        td.textContent = lobbies[lobby].playerCount
        row.appendChild(td)

        row.addEventListener('click', (event) => {
          let row = event.target.tagName === 'TR' ? event.target : event.target.parentNode
          let selected = row.parentNode.querySelectorAll('.selected')

          for (let i = selected.length - 1; i >= 0; i--) {
            selected[i].classList.remove('selected')
          }

          row.classList.add('selected')
        })

        lobbyTable.querySelector('tbody').appendChild(tr)
      } else {
                // Update the lobby size
        lobbyTable.querySelectorAll('tbody tr')[lobbyRow].querySelector('td:last-of-type').innerText = lobbies[lobby].playerCount
      }

      lobbyRow++
    }
  }

  lobbyTable.parentElement.classList.remove('remove-display')
})

socket.on('joinedLobby', (data) => {
  console.log(`Joined the lobby: ${data.id}`)

  let hud = new Hud(document.getElementById('your-stats'))

    // If player reconnects, don't start another game
  if (game == null) {
    game = new Game(data.width, data.height, 1)
    console.log('New Game:', game)

    game.currentPlayer = new MainPlayer(socket.id, username, hud)
    game.addPlayer(game.currentPlayer)
    game.currentPlayer.hud.setLevel(game.level)

    game.start()
  } else {
    game.currentPlayer = new MainPlayer(socket.id, username, hud)
    game.addPlayer(game.currentPlayer)
    game.currentPlayer.hud.setLevel(game.level)
  }
})

socket.on('update', (update) => {
    // For every player in the update
  for (let playerID in update.players) {
        // Check if they are new
    if (!game.players[playerID]) {
      game.addPlayer(new Player(playerID, update.players[playerID].name))
      console.log('Player added:', game.players[playerID])
    }

        // Apply the change
    game.players[playerID].setState(update.players[playerID])

    if (playerID === game.currentPlayer.id && update.players[playerID].hitPoints) {
            // console.log('Your health changed: ', update.players[playerID].hitPoints);
      game.currentPlayer.hud.setHealth(update.players[playerID].hitPoints)
    }
  }

    // Check if any players left
  game.forEachPlayer((player, id) => {
    if (!(id in update.players)) {
      console.log('Player left:', id)
      delete game.players[id]
    }
  })

    // For each enemy in the update
  for (let enemyID in update.enemies) {
        // Check if they are new
    if (!game.enemies[enemyID]) {
      game.addEnemy(new Enemy(enemyID, update.enemies[enemyID]))
    }

        // Apply the change
    game.enemies[enemyID].setState(update.enemies[enemyID])
  }

    // Check if any enemies died
  game.forEachEnemy((enemy, id) => {
    if (!(id in update.enemies)) {
            // console.log('Enemy died:', id);
      delete game.enemies[id]
    }
  })

    // For each bullet in the update
  for (let bulletID in update.bullets) {
        // Check if it is new
    if (!game.bullets[bulletID]) {
      game.addBullet(new Bullet(update.bullets[bulletID].gun, bulletID))
    }

        // Apply the change
    game.bullets[bulletID].setState(update.bullets[bulletID])
  }

    // Check if any bullets disappeared
  game.forEachBullet((bullet, id) => {
    if (!(id in update.bullets)) {
            // console.log(id !== 'undefined' ? 'Server' : 'Client', 'bullet disappeared' + (id !== 'undefined' ? ': ' + id : ''));
      delete game.bullets[id]
    }
  })

  if (typeof update.game.level !== 'undefined') {
    game.level = update.game.level
    game.currentPlayer.hud.setLevel(game.level)
  }
})

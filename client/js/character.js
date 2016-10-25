/*
 * character.js (client) - a base class for player and enemy.
 * It sets up functions that are used by both classes
 */

Character = Class.extend({
  init: function (id, x, y) {
    this.id = id
    this.setPosition(x, y)

    this.previousState = {}
  },
  setSize: function (size) {
    this.size = size
  },
  setSpeed: function (speed) {
    this.speed = speed
  },
  setMobility: function (mobility) {
    this.mobility = mobility
  },
  setDirection: function (direction) {
    this.direction = direction
  },
  setPosition: function (x, y) {
    this.x = x
    this.y = y
  },
  setColor: function (r, g, b, a) {
        // Assuming giving Red and Green and Blue separately and optional Alpha
    a = a !== undefined ? a : '1'
    this.color = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
  },
  setState: function (state) {
        // When an update comes in from the server, this is how that change takes effect
    for (var item in state) {
      switch (item) {
        case 'direction':
          this.setDirection(state[item])
          break
        case 'x':
          this.x = state[item]
          break
        case 'y':
          this.y = state[item]
          break
        case 'hitPoints':
          this.setHitPoints(state[item])
          break
        case 'maxHitPoints':
          this.maxHitPoints = state[item]
          break
        case 'stats':
          for (var stat in state[item]) {
            if (state[item].hasOwnProperty(stat)) {
              if (stat === 'score') {
                this.setScore(state[item][stat])
              } else if (stat === 'kills') {
                this.setKills(state[item][stat])
              }
            }
          }
          break
        case 'color':
          this.color = state[item]
          break
        case 'name':
          this.name = state[item]
      }
    }
  },
  resetHitPoints: function (maxHitPoints) {
    if (maxHitPoints !== undefined) {
      this.maxHitPoints = maxHitPoints
    }

    this.hitPoints = this.maxHitPoints
  },
  setHitPoints: function (hitPoints) {
    if (hitPoints > this.maxHitPoints) {
      this.hitPoints = this.maxHitPoints
    } else if (hitPoints < 0) {
      this.hitPoints = 0
    } else {
      this.hitPoints = hitPoints
    }
  },
  healthGone: function () {
        // Percentage from 0-1 of how much health is gone
    return 1 - (this.hitPoints / this.maxHitPoints)
  },
  hit: function (damage) {
    this.setHitPoints(this.hitPoints - damage)

    if (this.hitPoints <= 0) {
      this.kill()
    }
  },
  kill: function () {
    this.setHitPoints(0)
    this.setSpeed(0)
    this.setMobility(0)
  },
  getChangedState: function () {
    var currentState = {
        'x': this.x,
        'y': this.y,
        'direction': this.direction,
        'maxHitPoints': this.maxHitPoints,
        'hitPoints': this.hitPoints,
        'color': this.color
      },
      changes = {}

    for (var item in currentState) {
      if (currentState.hasOwnProperty(item)) {
        if (currentState[item] !== this.previousState[item]) {
          changes[item] = currentState[item]
        }
      }
    }

    this.previousState = currentState
    return changes
  },
  draw: function (context, scale) {},
  update: function (timeElapsed) {}
})

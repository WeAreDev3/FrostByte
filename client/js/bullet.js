/*
** bullet.js (client-side) defines the Bullet class,
** giving it the ability to update on the client before
** the next server update (client smoothing),
** and draw
*/

Bullet = Class.extend({
  init: function (gun, direction, id) {
    this.id = typeof direction === 'number' ? id : direction

    this.gun = gun
    this.speed = this.gun.bulletSpeed
    this.direction = typeof direction === 'number' ? direction : this.gun.player.direction

        // (x1, y1) is the first point of the line that makes up the bullet, (x2, y2) being the second
    this.x1 = this.gun.player.x - (5 + this.gun.player.size) * Math.cos(this.direction)
    this.y1 = this.gun.player.y - (5 + this.gun.player.size) * Math.sin(this.direction)
    this.x2 = this.x1 - 10 * Math.cos(this.direction)
    this.y2 = this.y1 - 10 * Math.sin(this.direction)

        // prevX is used when determining
    this.prevX = this.x1

        // Holds the last known state about the bullet
    this.previousState = {}
  },
  getChangedState: function () {
        // Get only the properties that changed
    var currentState = {
      'gun': {
        'player': {
          'id': this.gun.player.id,
          'x': this.x1,
          'y': this.y1,
          'size': this.gun.player.size
        },
        'damage': this.gun.damage,
        'bulletSpeed': this.speed
      },
      'direction': this.direction
    }

    for (var item in currentState) {
      if (currentState.hasOwnProperty(item)) {
        if (currentState[item] !== this.previousState[item]) {
          this.previousState = currentState
          return currentState
        }
      }
    }

    return null
  },
  setState: function (state) {
        // Given an update, apply it
    for (var item in state) {
      this[item] = state[item]
    }
  },
  draw: function (context, scale) {
        // Draws a line between two points
    var x1 = this.x1 * scale,
      x2 = this.x2 * scale,
      y1 = this.y1 * scale,
      y2 = this.y2 * scale

    context.beginPath()

    context.moveTo(x1, y1)
    context.lineTo(x2, y2)

    context.lineWidth = 1
    context.strokeStyle = '#003b4e'
    context.stroke()

    context.closePath()
  },
  update: function (timeElapsed) {
        // If off the screen, remove it
    if (this.x1 < 0 || this.x1 > Game.width || this.y1 < 0 || this.y1 > Game.height) {
      Game.removeBullet(this)
      return
    }

        // m is the slope of the line, m2 is opposite reciprocal, or the slope of the perpendicular line
    var m = (this.y2 - this.y1) / (this.x2 - this.x1),
      m2 = -1 / m,
      intersection = []

        // Loop through all enemies
    for (var i = 0, len = Game.enemies.length; i < len; i++) {
            // The x and y intersect of the line made between the two points and enemy
      intersection[0] = ((Game.enemies[i].x * -m2) + (this.x1 * m) + Game.enemies[i].y - this.y1) / (m - m2)
      intersection[1] = m * intersection[0] - (m * this.x1) + this.y1

            // Only check alive enemies, aka. not ones that are fading out
      if (Game.enemies[i].hitPoints > 0) {
                // If the enemy is intersecting that line
        if (this.x2 > this.prevX ? intersection[0] > this.prevX && intersection[0] < this.x2 : intersection[0] < this.prevX && intersection[0] > this.x2) {
                    // The enemy distance to that line
          var distanceFromBulletLine = Math.sqrt(Math.pow((Game.enemies[i].x - intersection[0]), 2) + Math.pow((Game.enemies[i].y - intersection[1]), 2))

          if (distanceFromBulletLine <= Game.enemies[i].size) {
            Game.enemies[i].hit(this.gun.damage)
            Game.removeBullet(this)
            return
          }
        }
      }
    }

        // If the bullet hasn't already been destroyed from the above conditions, update its stats
    this.prevX = this.x1
    this.x1 -= this.speed * Math.cos(this.direction) * timeElapsed * 100
    this.y1 -= this.speed * Math.sin(this.direction) * timeElapsed * 100
    this.x2 = this.x1 - 10 * Math.cos(this.direction)
    this.y2 = this.y1 - 10 * Math.sin(this.direction)
  }
})

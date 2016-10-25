import * as uuid from 'uuid'
import * as utils from './utils'

export default class Bullet {
  constructor (gun, direction) {
    this.id = uuid()
    this.gun = gun
    this.speed = this.gun.bulletSpeed
    this.direction = direction || this.gun.player.direction // TODO: improve optional case
    this.direction += gun.accuracy * 0.001 * (2 * Math.random() - 1) // TODO: handle magic numbers

    this.x1 = this.gun.player.x - (5 + this.gun.player.size) * Math.cos(this.direction)
    this.y1 = this.gun.player.y - (5 + this.gun.player.size) * Math.sin(this.direction)
    this.x2 = this.x1 - 10 * Math.cos(this.direction)
    this.y2 = this.xy1 - 10 * Math.sin(this.direction)

    this.prevX = this.x1

    this.previousState = {}
  }

  getChangedState () {
    // TODO: convert currentState to an instance of a class
    let currentState = {
      'gun': {
        'player': {
          'id': this.gun.player.id,
          'x': this.x1,
          'y': this.y1,
          'direction': this.direction,
          'size': this.gun.player.size
        }
      },
      'damage': this.gun.damage,
      'bulletSpeed': this.speed
    }

    // TODO: externalize this function (as a 'diff' method in the State class mentioned above)
    let changes = {}
    for (let item in currentState) {
      if (currentState.hasOwnProperty(item)) {
        if (currentState[item] !== this.previousState[item]) {
          changes[item] = currentState[item]
        }
      }
    }

    this.previousState = currentState

    return changes
  }

  update (timeElapsed) {
    let game = this.gun.player.lobby.game

    // TODO: make this predicate a call to the game object, passing it x1, y1
    if (this.x1 < 0 || this.x1 > game.width || this.y1 > game.height) {
      game.removeBullet(this)
      return
    }

    let slope = (this.y2 - this.y1) / (this.x2 - this.x1) // slope of bullet line
    // TODO: replace intersection with 2 variables or similar structure
    let intersection = [] // pair of intersection points

    game.forEachEnemy((enemy, id) => {
      if (enemy.healthGone() < 1) {
        // TODO: check that the line below is completely correct
        intersection[0] = ((enemy.x / slope) + (this.x1 * slope) + enemy.y - this.y1) / (slope + 1 / slope)
        intersection[1] = slope * intersection[0] - (slope * this.x1) + this.y1

        // Check if the enemy intersects with path of the bullet
        // TODO: simplify this predicate
        if (this.x2 > this.prevX
          ? intersection[0] > this.prevX && intersection[0] < this.x2
          : intersection[0] < this.prevX && intersection[0] > this.x2) {
          let distanceFromBulletLine = utils.distance(enemy.x, enemy.y, intersection[0], intersection[1])

          if (distanceFromBulletLine <= enemy.size) {
            enemy.hit(this.gun.damage)

            if (enemy.damageLeft >= 0) {
              // TODO: handle magic number
              let score = Math.round((enemy.speed / 70) * this.gun.damage)
              this.gun.player.stats.score += score
              this.gun.player.stats.lifeScore += score
              this.gun.player.stats.damage += this.gun.damage
            }

            if (enemy.hitPoints <= 0) {
              this.gun.player.stats.kills++
            }

            game.removeBullet(this)
            return true // TODO: what's the point of the true?
          }
        }
      }
    })

    // If the bullet hasn't already been destroyed, update its stats
    this.prevX = this.x1
    this.x1 -= this.speed * Math.cos(this.direction) * timeElapsed * 100
    this.y1 -= this.speed * Math.sin(this.direction) * timeElapsed * 100
    this.x2 = this.x1 - 10 * Math.cos(this.direction)
    this.y2 = this.y1 - 10 * Math.sin(this.direction)
  }
}

export default class Character {
  constructor (id, x, y) {
    // Define its ID and position on the screen, as passed in when created
    this.id = id
    this.setPosition(x, y)

    // Define a couple of variables that will come in handy for recording stuff
    this.previousState = {}
    this.forceUpdate = false
  }

  // Give the character a different size
  setSize (size) {
    this.size = size
  }

  // Give the character a different speed
  setSpeed (speed) {
    this.speed = speed
  }

  // Give the character a different mobility (rotational speed)
  setMobility (mobility) {
    this.mobility = mobility
  }

  // Give the character a different direction
  setDirection (direction) {
    this.direction = direction
  }

  // Give the character a different position
  setPosition (x, y) {
    this.x = x
    this.y = y
  }

  // Give the character a new color (alpha is optional)
  // TODO: create a Color class and use it here
  setColor (r, g, b, a) {
    a = a || 1
    this.color = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
  }

  // Update the character's color to reflect the health level
  // TODO: create a Color class and use it here
  updateColor () {
    let healthGone = this.healthGone()

    // Transition the color based on health
    this.setColor(parseInt(this.baseColor.start.red + (healthGone * this.baseColor.delta.red)),
                  parseInt(this.baseColor.start.green + (healthGone * this.baseColor.delta.green)),
                  parseInt(this.baseColor.start.blue + (healthGone * this.baseColor.delta.green)))
  }

  // Set the character's score for the round back to 0
  resetRoundScore () {
    this.lifeScore = 0
    console.log('Round score reset') // TODO: replace this with better logging utility
  }

  // Set the character's health back to 100%
  resetHitPoints (maxHitPoints) {
    if (!maxHitPoints) console.error('maxHitPoints not passed to resetHitPoints')
    this.maxHitPoints = maxHitPoints
    this.isDead = false
    this.hitPoints = this.maxHitPoints
    this.updateColor()
  }

  // Set the character's health to the given value
  setHitPoints (hitPoints) {
    // Limit hitPoints to between 0 and maxHitPoints
    this.hitPoints = Math.min(Math.max(hitPoints, 0), this.maxHitPoints)

    this.updateColor()
  }

  // Calculate the total number of hitpoints lost so far
  healthGone () {
    return 1 - (this.hitPoints / this.maxHitPoints)
  }

  // Handle being hit using the specified damage
  hit (damage) {
    this.setHitPoints(this.hitPoints - damage)

    this.health() <= 0 && this.kill()
  }

  // Kill the player
  kill () {
    this.setHitPoints(0)
    this.setSpeed(0)
    this.setMobility(0)
  }

  getChangedState () {
    // TODO: convert currentState to an instance of a class
    let currentState = {
      'x': this.x,
      'y': this.y,
      'direction': this.direction,
      'maxHitPoints': this.maxHitPoints,
      'hitPoints': this.hitPoints,
      'color': this.color,
      'name': this.name
    }

    let changes = {}

    // Determine whether to get actual changes or force the entire
    // instance to be updated
    if (!this.forceUpdate) {
      // TODO: externalize this function (as a 'diff' method in the State class mentioned above)
      for (let item in currentState) {
        if (currentState.hasOwnProperty(item)) {
          if (currentState[item] !== this.previousState[item]) {
            changes[item] = currentState[item]
          }
        }
      }
    } else {
      changes = currentState
      this.forceUpdate = false
    }

    this.previousState = currentState

    return changes
  }
}

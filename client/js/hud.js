import { formatNumber } from './utils'

export default class Hud {
  constructor (hudElement) {
    this.hud = hudElement
    this.playerHealth = hudElement.querySelector('#player-health').childNodes[0]
    this.maxPlayerHealth = hudElement.querySelector('#max-player-health')
    this.healthMeter = hudElement.querySelector('#health-meter')
    this.score = hudElement.querySelector('#player-score')
    this.kills = hudElement.querySelector('#player-kills')
    this.level = hudElement.querySelector('#game-level')
  }

  setHealth (hitPoints, maxHitPoints) {
    if (maxHitPoints !== undefined) {
      this.healthMeter.max = maxHitPoints
      this.healthMeter.low = maxHitPoints * 0.3
      this.maxPlayerHealth.textContent = maxHitPoints
    }

    this.healthMeter.value = hitPoints
    this.playerHealth.nodeValue = hitPoints
  }

  setScore (score) {
    this.score.textContent = formatNumber(score)
  }

  setKills (kills) {
    this.kills.textContent = formatNumber(kills)
  }

  setLevel (level) {
    this.level.textContent = level
  }
}

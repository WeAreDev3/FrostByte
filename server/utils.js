// Calculates the distance between two points
exports.distance = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

// Formats a number with 'K' and 'M' postfixes if needed
exports.formatNumber = number => {
  if (number < 1000) return number
  if (number < 100000) return (number / 1000).toFixed(1) + 'K'
  if (number < 1000000) return (number / 1000).toFixed(0) + 'K'
  if (number < 10000000) return (number / 1000).toFixed(1) + 'M'
  if (number < 100000000) return (number / 1000).toFixed(0) + 'M'
}

// Returns a random number between 0 and max
// TODO: merge with randomRange() below
exports.random = max => Math.random() * max

// Returns a random integer between 0 and max
// TODO: merge with randomRangeInt() below
exports.randomInt = range => Math.floor(Math.random() * range) // TODO: floor or round?

// Returns a random number between min and max
exports.randomRange = (min, max) => min + (Math.random() * (max - min))

// Returns a random integer between min and max
exports.randomRangeInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1))

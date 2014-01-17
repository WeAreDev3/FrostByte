var Utils = {};

Utils.random = function(range) {
    return Math.random() * range;
};

Utils.randomInt = function(range) {
    return Math.floor(Math.random() * range);
};

Utils.randomRange = function(min, max) {
    return min + (Math.random() * (max - min));
};

Utils.randomRangeInt = function(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
};

module.exports = Utils;

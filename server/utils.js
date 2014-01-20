var Utils = {
    random: function(range) {
        return Math.random() * range;
    },
    randomInt: function(range) {
        return Math.floor(Math.random() * range);
    },
    randomRange: function(min, max) {
        return min + (Math.random() * (max - min));
    },
    randomRangeInt: function(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));

    }
};

module.exports = Utils;

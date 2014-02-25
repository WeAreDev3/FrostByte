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

    },
    formatNumber: function(number) {
        if (number < 1000) { // 1,000
            return number;
        } else if (number < 100000) { // 10,000
            return (number / 1000).toFixed(1) + 'K';
        } else if (number < 1000000) { // 1,000,000
            return (number / 1000).toFixed(0) + 'K';
        } else if (number < 10000000) { // 10,000,000
            return (number / 1000000).toFixed(1) + 'M';
        } else if (number < 1000000000) { // 1,000,000,000
            return (number / 1000000).toFixed(0) + 'M';
        }
    }
};

module.exports = Utils;

var cls = require('./class');

var Entity = cls.Class.extend({
    init: function(id, type, x, y) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
    }
});

module.exports = Entity;

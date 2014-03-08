var Logger = function() {
    return this.log;
};

Logger.prototype.log = function() {
    var args = [].slice.call(arguments, 0),
        date = '[' + (new Date()).toISOString() + ']';

    args.splice(0, 0, date);
    console.log.apply(console, args);
};

if (typeof module !== 'undefined') {
    module.exports = new Logger();
} else {
    var log = new Logger();
}

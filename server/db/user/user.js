// user prototype
var User = function(config) {
  this.username = config.username || 'anonymous';
  this.loggedIn = config.loggedIn || false;
  this.room = config.room || undefined;
  this.status = config.status || 'offline';
};

module.exports = User;

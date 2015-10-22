var User = require('./user');

// temporary user storage
var users = {
  'kana': new User({username: 'kana'}),
  'randy': new User({username: 'randy'}),
  'terry': new User({username: 'terry'})
};

module.exports = users;

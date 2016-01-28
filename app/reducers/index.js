// Reducers that handle the actions dispatched and update their state accordingly

var reducers = {
  routing: require('redux-simple-router').routeReducer,
  songs: require('./songs.js'),
  player: require('./player.js'),
  interfaceStatus: require('./interfaceStatus.js'),
  scrapingServers: require('./scrapingServers.js'),
  covers: require('./covers.js'),
  friends: require('./friends.js'),
  devices: require('./devices.js'),
  instances: require('./instances.js'),
  sync: require('./sync.js'),
  favorites: require('./favorites.js')
}

module.exports = reducers

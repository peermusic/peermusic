// Actions getting dispatched by Redux.
// These actions are the only way to modify the view layer.
// These actions should trigger non-interface related tasks (e.g. player engine).
// After dispatching (returning) the action, this gets handled by the according reducers

var actions = {
  ...require('./songs.js'),
  ...require('./player.js'),
  ...require('./interfaceStatus.js'),
  ...require('./scrapingServers.js'),
  ...require('./covers.js'),
  ...require('./instances.js'),
  ...require('./sync.js'),
  ...require('./torrent.js')
}

module.exports = actions

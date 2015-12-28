const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('../Songs/SongTable.jsx')

var defaultColumns = {
  index: true,
  activeRow: false,
  queue: false
}

function PlayingNext ({ songs, options }) {
  options = Object.assign({}, defaultColumns, options)

  var historyDisplay = songs.length === 0
      ? <h3>You didn't queue any songs yet!</h3>
      : <SongTable songs={songs} options={options}/>

  return (
      <div>
        <h2>Playing Next</h2>
        {historyDisplay}
      </div>
  )
}

function mapStateToProps (state) {
  // Get the songs in the user queue and map the actual songs on the ids
  var songs = state.player.userQueue.map(h => state.songs.filter(s => s.id === h)[0])

  return {songs}
}

module.exports = connect(mapStateToProps)(PlayingNext)

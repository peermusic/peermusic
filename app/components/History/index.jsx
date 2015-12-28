const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('../Songs/SongTable.jsx')

function History ({ songs }) {
  var historyDisplay = songs.length === 0
      ? <h3>You didn't play any songs yet!</h3>
      : <SongTable songs={songs} columns={{index: true, activeRow: false}}/>

  return (
      <div>
        <h2>History</h2>
        {historyDisplay}
      </div>
  )
}

function mapStateToProps (state) {
  // Get the songs in the history before the current pointer and map the actual songs on the ids
  var songs = state.player.history.songs.filter((h, i) => i < state.player.history.currentIndex)
  songs.reverse()
  songs = songs.map(h => state.songs.filter(s => s.id === h)[0])

  return {songs}
}

module.exports = connect(mapStateToProps)(History)

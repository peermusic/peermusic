const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('../Songs/SongTable.jsx')
const MobilePageHeader = require('../MobilePageHeader.jsx')

function History ({ songs }) {
  var historyDisplay = songs.length === 0
      ? <h3>You didn't play any songs yet!</h3>
      : <SongTable songs={songs} options={{index: true, activeRow: false, playbackSingle: true, availability: false}}/>

  return (
      <div>
        <MobilePageHeader title='History'/>
        <div className='page-heading'>
          <h2>History</h2>
        </div>
        <div className='actual-page-content'>
          {historyDisplay}
        </div>
      </div>
  )
}

function mapStateToProps (state) {
  // Get the songs in the history before the current pointer and map the actual songs on the ids
  var songs = state.player.history.songs.filter((h, i) => i < state.player.history.currentIndex)
  songs.reverse()
  songs = songs.map(h => state.songs.filter(s => s.id === h)[0]).filter(x => x)

  return {songs}
}

module.exports = connect(mapStateToProps)(History)

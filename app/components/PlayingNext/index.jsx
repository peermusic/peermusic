const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('../Songs/SongTable.jsx')
const MobilePageHeader = require('../MobilePageHeader.jsx')

var defaultColumns = {
  index: true,
  activeRow: false,
  queue: false,
  playbackSingle: true,
  availability: false
}

function PlayingNext ({ songs, options }) {
  options = Object.assign({}, defaultColumns, options)

  var historyDisplay = songs.length === 0
      ? <h3>You don't have any songs queued for playback.</h3>
      : <SongTable songs={songs} options={options}/>

  return (
      <div>
        <MobilePageHeader title='Playing next'/>
        <div className='page-heading'>
          <h2>Playing Next</h2>
        </div>
        <div className='actual-page-content'>
          {historyDisplay}
        </div>
      </div>
  )
}

function mapStateToProps (state) {
  // Get the songs in the user queue and map the actual songs on the ids
  const userQueue = state.player.userQueue.map(h => state.songs.filter(s => s.id === h)[0]).filter(x => x)
  const automaticQueue = state.player.automaticQueue.map(h => state.songs.filter(s => s.id === h)[0]).filter(x => x).map(x => ({...x, desaturated: true}))

  // Limit the length to 15 automatically queued entries
  const length = userQueue.length + 15
  const songs = [].concat(userQueue, automaticQueue).slice(0, length)

  return {songs}
}

module.exports = connect(mapStateToProps)(PlayingNext)

const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('../Songs/SongTable.jsx')

function BannedSongs ({ songs }) {
  const options = {play: false, queue: false, favorite: false, actionDisabled: true, removeBan: true, desaturateRemote: false, availability: false}
  const songDisplay = songs.length > 0 ? <SongTable songs={songs} options={options}/> : <h3>You didn't ban any songs yet.</h3>

  return (
      <div>
        {songDisplay}
      </div>
    )
}

BannedSongs.propTypes = {
  songs: React.PropTypes.array
}

module.exports = connect(
    (state) => ({
      songs: state.sync.bannedSongs
    })
)(BannedSongs)

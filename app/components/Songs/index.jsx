const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('./SongTable.jsx')

function Songs ({ songs }) {
  const songDisplay = songs.length > 0 ? <SongTable songs={songs}/> : <h3>You didn't add any songs yet!<br/>Start by dragging and dropping some songs into this window.</h3>

  return (
      <div>
        <h2>Songs</h2>
        {songDisplay}
      </div>
  )
}

module.exports = connect(
    (state) => ({
      songs: state.songs
    })
)(Songs)

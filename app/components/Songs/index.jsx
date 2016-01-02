const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('./SongTable.jsx')
const { PLAYBACK_SONG } = require('../../actions')

function Songs ({ songs, PLAYBACK_SONG }) {
  const songDisplay = songs.length > 0 ? <SongTable songs={songs}/> : <h3>You didn't add any songs yet!<br/>Start by dragging and dropping some songs into this window.</h3>

  return (
      <div>
        <div className='page-heading'>
          <h2>Songs</h2>
          {songs.length > 0 &&
            <button className='play-all'
                    onClick={() => PLAYBACK_SONG(songs, 0)}>
              <i className='fa fa-play'/> Play all
            </button>
          }
        </div>
        {songDisplay}
      </div>
  )
}

module.exports = connect(
  (state) => ({
    songs: state.songs
  }),
  {PLAYBACK_SONG}
)(Songs)

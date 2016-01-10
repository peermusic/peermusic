const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('./SongTable.jsx')
const HorizontalNavigation = require('../HorizontalNavigation.jsx')
const { PLAYBACK_SONG } = require('../../actions')

function Songs ({ songs, PLAYBACK_SONG }) {
  var songDisplay = <h3>You didn't add any songs yet!<br/>Start by dragging and dropping some songs into this window.</h3>

  if (songs.length > 0) {
    const views = [
      {name: 'All songs', content: <SongTable songs={songs}/>},
      {name: 'Own songs', content: <SongTable songs={songs}/>},
      {name: 'Songs of friends', content: <SongTable songs={songs}/>}
    ]
    songDisplay = <HorizontalNavigation views={views} identifier='songs'/>
  }

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
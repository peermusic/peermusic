const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('../Songs/SongTable.jsx')
const { PLAYBACK_SONG } = require('../../actions')
const MobilePageHeader = require('../MobilePageHeader.jsx')

function Favorites ({ songs, PLAYBACK_SONG }) {
  var favoritesDisplay = songs.length === 0
      ? <h3>You didn't add any favorites yet!<br/>Click the heart next to any song for them to appear here.</h3>
      : <SongTable songs={songs} options={{availability: false}}/>

  return (
      <div>
        <MobilePageHeader title='Favorites'/>
        <div className='page-heading'>
          <h2>Favorites</h2>
          {songs.length > 0 &&
            <button className='play-all'
                    onClick={() => PLAYBACK_SONG(songs, 0)}>
              <i className='fa fa-play'/> Play all
            </button>
          }
        </div>
        <div className='actual-page-content'>
          {favoritesDisplay}
        </div>
      </div>
  )
}

module.exports = connect(
    (state) => ({
      songs: state.songs.filter(s => s.favorite)
    }),
  {PLAYBACK_SONG}
)(Favorites)

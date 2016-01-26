const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('../Songs/SongTable.jsx')
const { PLAYBACK_SONG } = require('../../actions')
const MobilePageHeader = require('../MobilePageHeader.jsx')
const HorizontalNavigation = require('../HorizontalNavigation.jsx')

function Favorites ({ songs, notAvailableSongs, PLAYBACK_SONG }) {
  var favoritesDisplay = songs.length === 0
    ? <h3>You didn't add any favorites yet!<br/>Click the heart next to any song for them to appear here.</h3>
    : <SongTable songs={songs}/>

  var options = {play: false, queue: false, favorite: true, actionDisabled: true, desaturateRemote: false, availability: false}
  var notAvailableFavoritesDisplay = notAvailableSongs.length === 0
    ? <h3>All your favorites are available!</h3>
    : <SongTable songs={notAvailableSongs} options={options}/>

  const views = [
    {path: '/favorites/available', name: 'Available', content: favoritesDisplay},
    {path: '/favorites/not-available', name: 'Not available', content: notAvailableFavoritesDisplay}
  ]

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
      <HorizontalNavigation views={views}/>
    </div>
  )
}

module.exports = connect(
  (state) => {
    const songIds = state.songs.map(x => x.id)
    return {
      songs: state.songs.filter(s => s.favorite),
      notAvailableSongs: state.favorites.filter(s => songIds.indexOf(s.id) === -1)
    }
  },
  {PLAYBACK_SONG}
)(Favorites)

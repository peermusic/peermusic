const React = require('react')
const { connect } = require('react-redux')
const SearchForm = require('../Search.jsx')
const SongTable = require('../Songs/SongTable.jsx')
const { PLAYBACK_SONG } = require('../../actions')
const MobilePageHeader = require('../MobilePageHeader.jsx')

function Search ({ query, songs, PLAYBACK_SONG }) {
  var results = songs.length === 0 ? <h3>No songs found.</h3> : <SongTable songs={songs}/>

  return (
      <div>
        <MobilePageHeader title='Search'/>
        <div className='page-heading'>
          <h2>Songs matching '{query}'</h2>
          {songs.length > 0 &&
            <button className='play-all'
                    onClick={() => PLAYBACK_SONG(songs, 0)}>
              <i className='fa fa-play'/> Play all
            </button>
          }
        </div>
        <div className='actual-page-content'>
          <h2 className='mobile-only'>
            Songs matching '{query}'
          </h2>
          <SearchForm placeholder='Search again...'/>
          <div className='search-results'>{results}</div>
        </div>
      </div>
  )
}

function mapStateToProps (state) {
  // Get the query off the routing path
  const query = state.routing.path.toString().replace(/^.*\?query=(.*)$/, '$1')

  // Only bind songs to the view that match the query
  const songs = state.songs.filter((song) => {
    return matches(query, song.title) || matches(query, song.artist) || matches(query, song.album)
  })

  return {query, songs}
}

function matches (needle, haystack) {
  if (!haystack) {
    return false
  }
  return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1
}

module.exports = connect(mapStateToProps, {PLAYBACK_SONG})(Search)

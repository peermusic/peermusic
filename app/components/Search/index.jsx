const React = require('react')
const { connect } = require('react-redux')
const SearchForm = require('../Search.jsx')
const SongTable = require('../Songs/SongTable.jsx')

function Search ({ query, songs }) {
  var results = songs.length === 0 ? <h3>No songs found.</h3> : <SongTable songs={songs}/>

  return (
      <div>
        <h2>Songs matching '{query}'</h2>
        <SearchForm placeholder='Search again...'/>
        <div className='search-results'>{results}</div>
      </div>
  )
}

function mapStateToProps (state) {
  // Get the query off the routing path
  const query = state.routing.path.toString().replace(/^.*query=(.*)$/, '$1')

  // Only bind songs to the view that match the query
  const songs = state.songs.filter((song) => {
    return matches(query, song.title) || matches(query, song.artist) || matches(query, song.album)
  })

  return {query, songs}
}

function matches (needle, haystack) {
  return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1
}

module.exports = connect(mapStateToProps)(Search)

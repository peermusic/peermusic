const React = require('react')
const { connect } = require('react-redux')
const ArtistOverview = require('./ArtistOverview.jsx')
const ArtistDetail = require('./ArtistDetail.jsx')

function Albums ({query}) {
  return !query ? <ArtistOverview/> : <ArtistDetail artist={query.artist}/>
}

function mapStateToProps (state) {
  var query = state.routing.path.toString().replace(/^.*\?artist=(.*)$/, '$1')

  if (query === '/artists') {
    query = null
  } else {
    query = {artist: query}
  }

  return {query}
}

module.exports = connect(mapStateToProps)(Albums)

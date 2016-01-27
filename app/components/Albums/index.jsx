const React = require('react')
const { connect } = require('react-redux')
const AlbumOverview = require('./AlbumOverview.jsx')
const AlbumDetail = require('./AlbumDetail.jsx')

function Albums ({query}) {
  return !query ? <AlbumOverview/> : <AlbumDetail album={query.album}/>
}

function mapStateToProps (state) {
  var query = state.routing.path.toString().replace(/^.*\?album=(.*)$/, '$1')

  if (query === '/albums') {
    query = null
  } else {
    query = {album: decodeURIComponent(query)}
  }

  return {query}
}

module.exports = connect(mapStateToProps)(Albums)

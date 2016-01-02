const React = require('react')
const { connect } = require('react-redux')
const AlbumOverview = require('./AlbumOverview.jsx')
const AlbumDetail = require('./AlbumDetail.jsx')

function Albums ({query}) {
  return !query ? <AlbumOverview/> : <AlbumDetail album={query.album} artist={query.artist}/>
}

function mapStateToProps (state) {
  var query = state.routing.path.toString().replace(/^.*\?album=(.*)&artist=(.*)$/, '$1=++=++=$2').split('=++=++=')

  if (query[0] === '/albums') {
    query = null
  } else {
    query = {album: query[0], artist: query[1]}
  }

  return {query}
}

module.exports = connect(mapStateToProps)(Albums)

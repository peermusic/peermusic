const React = require('react')
const { connect } = require('react-redux')
const AlbumTable = require('./AlbumTable.jsx')
const MobilePageHeader = require('../MobilePageHeader.jsx')
const InitialImportMessage = require('../InitialImportMessage.jsx')

function AlbumOverview ({ albums }) {
  var albumsDisplay = albums.length > 0 ? <AlbumTable albums={albums}/>
      : <InitialImportMessage/>

  return (
      <div>
        <MobilePageHeader title='Albums'/>
        <div className='page-heading'>
          <h2>Albums</h2>
        </div>
        <div className='actual-page-content'>
          {albumsDisplay}
        </div>
      </div>
  )
}

function mapStateToProps (state) {
  // Grab the albums from the songs
  var albums = _uniqueArray(state.songs.map((song) => ({
    album: song.album
  })))

  // Remove empty albums
  albums = albums.filter(a => a.album)

  // Add the song number to the albums
  albums = albums.map(x => {
    x.songs = state.songs.filter(y => y.album === x.album).length
    x.coverUrl = _getCover(state.songs.find(y => y.album === x.album).coverId, state)
    return x
  })

  // Order the albums by the album title
  albums.sort((a, b) => (a.album > b.album) ? 1 : ((b.album > a.album) ? -1 : 0))

  return {albums}
}

function _uniqueArray (array) {
  array = array.map(x => JSON.stringify(x))
  array = array.filter((v, i, self) => self.indexOf(v) === i)
  return array.map(x => JSON.parse(x))
}

function _getCover (id, state) {
  const cover = state.covers.filter(c => c.id === id)[0]
  return cover ? cover.url : ''
}

module.exports = connect(mapStateToProps)(AlbumOverview)

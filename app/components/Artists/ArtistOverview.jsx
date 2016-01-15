const React = require('react')
const { connect } = require('react-redux')
const ArtistTable = require('./ArtistTable.jsx')
const MobilePageHeader = require('../MobilePageHeader.jsx')
const InitialImportMessage = require('../InitialImportMessage.jsx')

function ArtistOverview ({ artists }) {
  var artistDisplay = artists.length > 0 ? <ArtistTable artists={artists}/>
      : <InitialImportMessage/>

  return (
      <div>
        <MobilePageHeader title='Artists'/>
        <div className='page-heading'>
          <h2>Artists</h2>
        </div>
        <div className='actual-page-content'>
          {artistDisplay}
        </div>
      </div>
  )
}

function mapStateToProps (state) {
  // Grab the artists from the songs
  var artists = _uniqueArray(state.songs.map((song) => ({
    artist: song.artist
  })))

  // Remove artists that have artist not set
  artists = artists.filter(a => a.artist)

  // Map the artists with their properties
  artists = artists.map(a => {
    const songs = state.songs.filter(s => s.artist === a.artist)
    const coverUrl = _getCover(songs.filter(c => c.coverId)[0].coverId, state)
    return {...a, songs: songs.length, coverUrl}
  })

  // Order the artists by their name
  artists.sort((a, b) => (a.artist > b.artist) ? 1 : ((b.artist > a.artist) ? -1 : 0))

  return {artists}
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

module.exports = connect(mapStateToProps)(ArtistOverview)

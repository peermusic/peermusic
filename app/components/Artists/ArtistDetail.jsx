const React = require('react')
const { connect } = require('react-redux')
const AlbumDetail = require('../Albums/AlbumDetail.jsx')

function ArtistDetail ({ artist, albums }) {
  return (
      <div>
        <h2>{artist}</h2>
        <div>
        {albums.map((album, i) => {
          return (
              <div className='artist-album' key={i}>
                <AlbumDetail artist={artist} album={album.name} artistPage={true}/>
              </div>
          )
        })}
        </div>
      </div>
  )
}

function mapStateToProps (state, ownProps) {
  // Get all songs of this artist
  const totalSongs = state.songs.filter(x => x.artist === ownProps.artist)
  var albums = _uniqueArray(totalSongs.map(x => x.album).filter(x => x))

  // Get the year for each album
  albums = albums.map(a => {
    const year = Math.min(...totalSongs.filter(x => x.album === a).map(s => s.year).filter(s => s))
    return {name: a, year: year === Infinity ? null : year}
  })

  // Order the albums by year
  albums.sort((a, b) => (a.year < b.year) ? 1 : ((b.year < a.year) ? -1 : 0))

  return {albums}
}

function _uniqueArray (array) {
  array = array.map(x => JSON.stringify(x))
  array = array.filter((v, i, self) => self.indexOf(v) === i)
  return array.map(x => JSON.parse(x))
}

module.exports = connect(mapStateToProps)(ArtistDetail)

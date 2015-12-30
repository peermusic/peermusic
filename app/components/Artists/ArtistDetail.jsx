const React = require('react')
const { connect } = require('react-redux')
const AlbumDetail = require('../Albums/AlbumDetail.jsx')

function ArtistDetail ({ artist, totalSongs, albums }) {
  return (
      <div>
        <h2>{artist}</h2>
        <div>
        {albums.map((album, i) => {
          return (
              <div className='artist-album' key={i}>
                <AlbumDetail totalSongs={totalSongs} artist={artist} album={album.name} artistPage={true}/>
              </div>
          )
        })}
        </div>
      </div>
  )
}

function mapStateToProps (state, ownProps) {
  // Get all songs of this artist
  const artistSongs = state.songs.filter(x => x.artist === ownProps.artist)
  var albums = _uniqueArray(artistSongs.map(x => x.album).filter(x => x))

  // Get the year for each album
  albums = albums.map(a => {
    var songs = artistSongs.filter(x => x.album === a)
    songs.sort((a, b) => (a.track > b.track) ? 1 : ((b.track > a.track) ? -1 : 0))
    const year = Math.min(...songs.map(s => s.year).filter(s => s))
    return {name: a, songs: songs, year: year === Infinity ? null : year}
  })

  // Order the albums by year
  albums.sort((a, b) => (a.year < b.year) ? 1 : ((b.year < a.year) ? -1 : 0))

  // Grab the total songs off the albums (same order as in display)
  // so we can play all songs of an artist after each other
  var totalSongs = albums.map(x => x.songs)
  if (totalSongs.length > 0) {
    totalSongs = totalSongs.reduce((a, b) => a.concat(b))
  }

  return {albums, totalSongs}
}

function _uniqueArray (array) {
  array = array.map(x => JSON.stringify(x))
  array = array.filter((v, i, self) => self.indexOf(v) === i)
  return array.map(x => JSON.parse(x))
}

module.exports = connect(mapStateToProps)(ArtistDetail)

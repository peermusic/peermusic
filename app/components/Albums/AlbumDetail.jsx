const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('../Songs/SongTable.jsx')
const { Link } = require('react-router')

function AlbumDetail ({ album, artist, songs, totalSongs, currentCover, artistPage }) {
  if (songs.length > 0) {
    var albumDuration = Math.round(songs.map(x => x.length).reduce((a, b) => a + b) / 60)
    var year = songs.map(s => s.year).filter(s => s)[0]
  }

  if (artistPage) {
    const linkTargetAlbum = '/albums?album=' + album + '&artist=' + artist
    album = <Link to={linkTargetAlbum}>{album}</Link>
  }

  const linkTargetArtist = '/artists?artist=' + artist

  return (
      <div>
        <div className='album-header'>
          <img src={currentCover}/>
          <div>
            <h2>{album}</h2>
            <h3>
              {!artistPage &&
                <span>
                  <Link to={linkTargetArtist} className='artist'>{artist}</Link>
                  <span className='padder'>&mdash;</span>
                </span>
              }
              {year &&
                <span>
                  {year}
                  <span className='padder'>&mdash;</span>
                </span>
              }
              {songs.length} {songs.length > 1 ? 'songs' : 'song'}
              <span className='padder'>&mdash;</span>
              {albumDuration} minutes
            </h3>
          </div>
        </div>
        <SongTable songs={songs} totalSongs={totalSongs ? totalSongs : songs} options={{track: true, artist: false, album: false}}/>
      </div>
  )
}

function mapStateToProps (state, ownProps) {
  var songs = state.songs.filter(x => x.album === ownProps.album && x.artist === ownProps.artist)

  // Order the songs by track
  songs.sort((a, b) => (a.track > b.track) ? 1 : ((b.track > a.track) ? -1 : 0))

  // Grab the cover off the first track
  const currentCover = state.covers.filter(c => c.id === songs[0].coverId)[0]

  return {
    songs,
    currentCover: currentCover ? currentCover.url : ''
  }
}

module.exports = connect(mapStateToProps)(AlbumDetail)

const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('../Songs/SongTable.jsx')

function AlbumDetail ({ album, artist, songs, currentCover }) {
  if (songs.length > 0) {
    var albumDuration = Math.round(songs.map(x => x.length).reduce((a, b) => a + b) / 60)
    var year = songs.map(s => s.year).filter(s => s)[0]
  }

  return (
      <div>
        <div className='album-header'>
          <img src={currentCover}/>
          <div>
            <h2>{album}</h2>
            <h3>
              {artist}
              {year &&
                <span>
                  <span className='padder'>&mdash;</span>
                  {year}
                </span>
              }
              <span className='padder'>&mdash;</span>
              {songs.length} {songs.length > 1 ? 'songs' : 'song'}
              <span className='padder'>&mdash;</span>
              {albumDuration} minutes
            </h3>
          </div>
        </div>
        <SongTable songs={songs} options={{track: true, artist: false, album: false}}/>
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

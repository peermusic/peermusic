const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('../Songs/SongTable.jsx')

function AlbumDetail ({ album, artist, songs, currentCover }) {
  if (songs.length > 0) {
    var albumDuration = Math.round(songs.map(x => x.length).reduce((a, b) => a + b) / 60)
  }

  return (
      <div>
        <div className='album-header'>
          <img src={currentCover}/>
          <div>
            <h2>{album}</h2>
            <h3>
              {artist}
              <span className='padder'>&mdash;</span>
              {songs.length} {songs.length > 1 ? 'songs' : 'song'}
              <span className='padder'>&mdash;</span>
              {albumDuration} minutes
            </h3>
          </div>
        </div>
        <SongTable songs={songs} showRows={{track: true, title: true}}/>
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

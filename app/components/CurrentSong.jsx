const React = require('react')
const { connect } = require('react-redux')
const { Link } = require('react-router')
import { pushPath } from 'redux-simple-router'

function CurrentSong ({ currentSong, currentCover, mobile, pushPath }) {
  if (currentSong === undefined) {
    return <div className='current-song'></div>
  }

  var artist = currentSong.artist
  var album = currentSong.album
  var touchHandler = {}

  if (!mobile) {
    var linkTargetArtist = '/artists?artist=' + currentSong.artist
    var linkTargetAlbum = '/albums?album=' + currentSong.album + '&artist=' + currentSong.artist
    artist = <Link to={linkTargetArtist}>{currentSong.artist}</Link>
    album = <Link to={linkTargetAlbum}>{currentSong.album}</Link>
  }

  if (mobile) {
    touchHandler = {
      onTouchStart: () => pushPath('/currently-playing')
    }
  }

  return (
      <div className='current-song' {...touchHandler}>
        <img src={currentCover} className='cover-art'/>
        <div className='text'>
          <div className='song-title'>{currentSong.title}</div>
          <div className='song-artist'>
            {artist} &mdash; {album}
          </div>
        </div>
      </div>
  )
}

function mapStateToProps (state) {
  // Get the currently running song and it's cover
  const currentSong = state.songs.filter(s => s.id === state.player.songId)[0]
  const currentCover = !currentSong ? null : state.covers.filter(c => c.id === currentSong.coverId)[0]

  return {
    currentSong: currentSong,
    currentCover: currentCover ? currentCover.url : ''
  }
}

module.exports = connect(mapStateToProps, { pushPath })(CurrentSong)

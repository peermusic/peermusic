const React = require('react')
const { connect } = require('react-redux')

function CurrentSong ({ currentSong, currentCover }) {
  if (currentSong === undefined) {
    return <div className='current-song'></div>
  }

  return (
      <div className='current-song'>
        <img src={currentCover} className='cover-art'/>
        <div className='text'>
          <div className='song-title'>{currentSong.title}</div>
          <div className='song-artist'>
            {currentSong.artist} &mdash; {currentSong.album}
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

module.exports = connect(mapStateToProps)(CurrentSong)

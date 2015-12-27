const React = require('react')
const { connect } = require('react-redux')

function CurrentSong ({ currentSong }) {
  if (currentSong === undefined) {
    return <div className='current-song'></div>
  }

  return (
      <div className='current-song'>
        <img src='' className='cover-art'/>
        <div className='text'>
          <div className='song-title'>{currentSong.title}</div>
          <div className='song-artist'>
            {currentSong.artist} &mdash; {currentSong.album}
          </div>
        </div>
      </div>
  )
}

module.exports = connect(
    (state) => ({
      currentSong: state.songs.filter(s => s.id === state.player.songId)[0]
    })
)(CurrentSong)

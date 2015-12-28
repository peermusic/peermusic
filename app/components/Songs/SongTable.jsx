const React = require('react')
const { connect } = require('react-redux')
const SongRow = require('./SongRow.jsx')

function SongTable ({ songs, currentSong, showRows = {title: true, artist: true, album: true} }) {
  return (
      <table className='song-table'>
        <tbody>
        <tr>
          {showRows.track && <th className='number'>#</th>}
          <th/>
          {showRows.title && <th>Title</th>}
          {showRows.artist && <th>Artist</th>}
          {showRows.album && <th>Album</th>}
          <th className='creation-date'>Added</th>
          <th className='song-time'>Length</th>
          <th/>
          <th/>
        </tr>
        {songs.map((song) => {
          var playing = song.id === currentSong
          return <SongRow key={song.id} song={song} playing={playing} showRows={showRows}/>
        })}
        </tbody>
      </table>
  )
}

module.exports = connect(
    (state) => ({
      currentSong: state.player.songId
    })
)(SongTable)

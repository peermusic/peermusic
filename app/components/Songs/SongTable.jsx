const React = require('react')
const { connect } = require('react-redux')
const SongRow = require('./SongRow.jsx')

function SongTable ({ songs, currentSong }) {
  return (
      <table className='song-table'>
        <tbody>
        <tr>
          <th/>
          <th>Title</th>
          <th>Artist</th>
          <th>Album</th>
          <th className='creation-date'>Added</th>
          <th className='song-time'>Length</th>
          <th/>
          <th/>
        </tr>
        {songs.map((song) => {
          var playing = song.id === currentSong
          return <SongRow key={song.id} song={song} playing={playing}/>
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

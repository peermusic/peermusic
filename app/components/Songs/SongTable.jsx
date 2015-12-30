const React = require('react')
const { connect } = require('react-redux')
const SongRow = require('./SongRow.jsx')

var defaultColumns = {
  index: false,
  track: false,
  play: true,
  activeRow: true,
  playbackSingle: false,
  title: true,
  artist: true,
  album: true,
  added: true,
  length: true,
  queue: true,
  favorite: true,
  remove: false,
  availability: true
}

function SongTable ({ songs, totalSongs, currentSong, options }) {
  options = Object.assign({}, defaultColumns, options)

  return (
      <table className='song-table'>
        <tbody>
        <tr>
          {options.index && <th className='number'>#</th>}
          {options.track && <th className='number'>#</th>}
          {options.play && <th className='play-button'/>}
          {options.title && <th>Title</th>}
          {options.artist && <th>Artist</th>}
          {options.album && <th>Album</th>}
          {options.added && <th className='creation-date'>Added</th>}
          {options.length && <th className='song-time'>Length</th>}
          {options.availability && <th className='availability'/>}
          {options.queue && <th className='add-button'/>}
          {options.favorite && <th className='favorite-button'/>}
          {options.remove && <th className='remove-button'/>}
          {options.removeDownload && <th className='remove-button'/>}
        </tr>
        {songs.map((song, i) => {
          const playing = song.id === currentSong
          const index = totalSongs ? totalSongs.indexOf(song) : i
          return <SongRow key={i} song={song} songs={totalSongs || songs} index={index} playing={playing} options={options}/>
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

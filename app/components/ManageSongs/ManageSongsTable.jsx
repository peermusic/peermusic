const React = require('react')
const { connect } = require('react-redux')
const classNames = require('classnames')
const DateFormat = require('../DateFormat.jsx')
const Duration = require('../Duration.jsx')
const { PLAYER_SET_SONG, REMOVE_SONG } = require('../../actions')
const { Link } = require('react-router')

function ManageSongsTable ({ songs, currentSong, PLAYER_SET_SONG, REMOVE_SONG }) {
  if (songs.length === 0) {
    return <h3>You didn't add any songs yet!<br/>Start by dragging and dropping some songs into this window.</h3>
  }

  return (
      <table className='song-table'>
        <tbody>
        <tr>
          <th>Title</th>
          <th>Artist</th>
          <th>Album</th>
          <th className='creation-date'>Added</th>
          <th className='song-time'>Length</th>
          <th className='remove-button'/>
        </tr>
        {songs.map((song) => {
          var rowClass = classNames({active: song.id === currentSong})
          var artistClass = classNames('artist', {inactive: !song.artist})
          var albumClass = classNames('album', {inactive: !song.album})
          var linkTargetAlbum = '/albums?album=' + song.album + '&artist=' + song.artist
          var album = !song.album ? '—' : <Link to={linkTargetAlbum}>{song.album}</Link>

          return (
              <tr key={song.id} className={rowClass} onDoubleClick={() => PLAYER_SET_SONG(song.id) }>
                <td className='title'>{song.title}</td>
                <td className={artistClass}>{song.artist || '—'}</td>
                <td className={albumClass}>{album}</td>
                <td className='creation-date'>
                  <DateFormat then={song.addedAt}/>
                </td>
                <td className='song-time'>
                  <Duration seconds={song.length}/>
                </td>
                <td className='remove-button'>
                  <a onClick={() => REMOVE_SONG(song.id)}><i className='fa fa-trash'/></a>
                </td>
              </tr>
          )
        })}
        </tbody>
      </table>
  )
}

module.exports = connect(
    (state) => ({
      currentSong: state.player.songId
    }),
    {PLAYER_SET_SONG, REMOVE_SONG}
)(ManageSongsTable)

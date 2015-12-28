const React = require('react')
const { connect } = require('react-redux')
const classNames = require('classnames')
const { PLAYER_SET_SONG } = require('../../actions')
const DateFormat = require('../DateFormat.jsx')
const Duration = require('../Duration.jsx')

function SongRow ({ song, playing, PLAYER_SET_SONG }) {
  var playButton = playing ? <i className='fa fa-volume-up'/>
      : <a onClick={() => PLAYER_SET_SONG(song.id) }><i className='fa fa-play'/></a>
  var rowClass = classNames({active: playing})
  var artistClass = classNames('artist', {inactive: !song.artist})
  var albumClass = classNames('album', {inactive: !song.album})
  var favoriteClass = classNames('favorite-button', {active: song.favorite})

  return (
      <tr className={rowClass} onDoubleClick={() => PLAYER_SET_SONG(song.id) }>
        <td className='play-button'>{playButton}</td>
        <td className='title'>{song.title}</td>
        <td className={artistClass}>{song.artist || '—'}</td>
        <td className={albumClass}>{song.album || '—'}</td>
        <td className='creation-date'>
          <DateFormat then={song.addedAt}/>
        </td>
        <td className='song-time'>
          <Duration seconds={song.length}/>
        </td>
        <td className='add-button'>
          <a href='#'><i className='fa fa-plus'/></a>
        </td>
        <td className={favoriteClass}>
          <a href='#'><i className='flaticon-favorite'/></a>
        </td>
      </tr>
  )
}

module.exports = connect(null, {PLAYER_SET_SONG})(SongRow)

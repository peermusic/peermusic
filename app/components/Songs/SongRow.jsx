const React = require('react')
const { connect } = require('react-redux')
const classNames = require('classnames')
const { PLAYER_SET_SONG, REMOVE_SONG, TOGGLE_SONG_FAVORITE } = require('../../actions')
const DateFormat = require('../DateFormat.jsx')
const Duration = require('../Duration.jsx')
const { Link } = require('react-router')

function SongRow ({ i, song, playing, PLAYER_SET_SONG, REMOVE_SONG, TOGGLE_SONG_FAVORITE, options }) {
  var index, track, play, title, artist, album, added, length, queue, favorite, remove, rowClass

  if (options.index) {
    index = <th className='number'>{i}</th>
  }

  if (options.track) {
    track = <th className='number'>{song.track}</th>
  }

  if (options.play) {
    const playButton = playing && options.activeRow ? <i className='fa fa-volume-up'/>
        : <a onClick={() => PLAYER_SET_SONG(song.id) }><i className='fa fa-play'/></a>
    play = <td className='play-button'>{playButton}</td>
  }

  if (options.title) {
    title = <td className='title'>{song.title}</td>
  }

  if (options.artist) {
    const artistClass = classNames('artist', {inactive: !song.artist})
    artist = <td className={artistClass}>{song.artist || '—'}</td>
  }

  if (options.album) {
    const linkTargetAlbum = '/albums?album=' + song.album + '&artist=' + song.artist
    const albumClass = classNames('album', {inactive: !song.album})
    const albumLink = !song.album ? '—' : <Link to={linkTargetAlbum}>{song.album}</Link>
    album = <td className={albumClass}>{albumLink}</td>
  }

  if (options.added) {
    added = <td className='creation-date'><DateFormat then={song.addedAt}/></td>
  }

  if (options.length) {
    length = <td className='song-time'><Duration seconds={song.length}/></td>
  }

  if (options.queue) {
    queue = <td className='add-button'><a href='#'><i className='fa fa-plus'/></a></td>
  }

  if (options.favorite) {
    const favoriteClass = classNames('favorite-button', {active: song.favorite})
    favorite = <td className={favoriteClass}><a onClick={() => TOGGLE_SONG_FAVORITE(song.id)}><i className='flaticon-favorite'/></a></td>
  }

  if (options.remove) {
    remove = <td className='remove-button'><a onClick={() => REMOVE_SONG(song.id)}><i className='fa fa-trash'/></a></td>
  }

  if (options.activeRow) {
    rowClass = classNames({active: playing})
  }

  return (
      <tr className={rowClass} onDoubleClick={() => PLAYER_SET_SONG(song.id) }>
        {index}
        {track}
        {play}
        {title}
        {artist}
        {album}
        {added}
        {length}
        {queue}
        {favorite}
        {remove}
      </tr>
  )
}

module.exports = connect(null, {PLAYER_SET_SONG, REMOVE_SONG, TOGGLE_SONG_FAVORITE})(SongRow)

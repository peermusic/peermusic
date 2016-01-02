const React = require('react')
const { connect } = require('react-redux')
const classNames = require('classnames')
const { PLAYBACK_SONG, PLAYBACK_USER_QUEUE, REMOVE_SONG, TOGGLE_SONG_FAVORITE } = require('../../actions')
const DateFormat = require('../DateFormat.jsx')
const Duration = require('../Duration.jsx')
const { Link } = require('react-router')

function SongRow ({ song, songs, index, playing, PLAYBACK_SONG, PLAYBACK_USER_QUEUE, REMOVE_SONG, TOGGLE_SONG_FAVORITE, options }) {
  var number, track, play, title, artist, album, added, length, availability, queue, favorite, remove, rowClass

  // Generate a playback function based on the options
  const playback = (options.playbackSingle) ? () => PLAYBACK_SONG([song], 0) : () => PLAYBACK_SONG(songs, index)

  if (options.index) {
    number = <th className='number'>{index + 1}</th>
  }

  if (options.track) {
    track = <th className='number'>{song.track}</th>
  }

  if (options.play) {
    const playButton = playing && options.activeRow
        ? <i className='fa fa-volume-up'/>
        : <a onClick={() => playback() }><i className='fa fa-play'/></a>
    play = <td className='play-button'>{playButton}</td>
  }

  if (options.title) {
    title = <td className='title'>{song.title}</td>
  }

  if (options.artist) {
    const linkTargetArtist = '/artists?artist=' + song.artist
    const artistClass = classNames('artist', {inactive: !song.artist})
    const artistLink = !song.artist ? '—' : <Link to={linkTargetArtist}>{song.artist}</Link>
    artist = <td className={artistClass}>{artistLink}</td>
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

  if (options.availability) {
    // TODO availability for friends: availability = <td className='availability (good|average|bad)'><i className='flaticon-download'/></td>
    // TODO when downloading: availability = <td className='availability downloading'><i className='flaticon-downloading'/></td>
    availability = <td className='availability'><i className='flaticon-harddrive'/></td>
  }

  if (options.queue) {
    queue = <td className='add-button'><a onClick={() => PLAYBACK_USER_QUEUE(song.id)}><i className='fa fa-plus'/></a></td>
  }

  if (options.favorite) {
    const favoriteClass = classNames('favorite-button', {active: song.favorite})
    favorite = <td className={favoriteClass}><a onClick={() => TOGGLE_SONG_FAVORITE(song.id)}><i className='flaticon-favorite'/></a></td>
  }

  if (options.remove) {
    remove = <td className='remove-button'><a onClick={() => REMOVE_SONG(song.id)}><i className='fa fa-trash'/></a></td>
  }

  if (options.removeDownload) {
    remove = <td className='remove-button'><a><i className='fa fa-trash'/></a></td>
  }

  var classes = (options.activeRow) ? {active: playing} : {}
  classes = {...classes, desaturated: song.desaturated}
  rowClass = classNames(classes)

  return (
      <tr className={rowClass} onDoubleClick={() => playback()}>
        {number}
        {track}
        {play}
        {title}
        {artist}
        {album}
        {added}
        {length}
        {availability}
        {queue}
        {favorite}
        {remove}
      </tr>
  )
}

module.exports = connect(null, {PLAYBACK_SONG, PLAYBACK_USER_QUEUE, REMOVE_SONG, TOGGLE_SONG_FAVORITE})(SongRow)

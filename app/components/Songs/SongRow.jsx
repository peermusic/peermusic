const React = require('react')
const { connect } = require('react-redux')
const classNames = require('classnames')
const { PLAYBACK_SONG, PLAYBACK_USER_QUEUE, REMOVE_SONG, TOGGLE_SONG_FAVORITE, PLAYER_SET_PLAYING, REQUEST_SONG } = require('../../actions')
const DateFormat = require('../DateFormat.jsx')
const Duration = require('../Duration.jsx')
const { Link } = require('react-router')
var Tappable = require('react-tappable')

class SongRow extends React.Component {

  renderIndex () {
    return <th className='number'>{this.props.index + 1}</th>
  }

  renderTrack () {
    return <th className='number'>{this.props.song.track}</th>
  }

  renderPlayAndDownload (playback, download) {
    if (!this.props.song.local) {
      const downloadButton = this.props.downloading
        ? <i className='fa fa-refresh'/>
        : <a onClick={() => download()}><i className='fa fa-arrow-down'/></a>
      return <td className='download-button'>{downloadButton}</td>
    }

    const playButton = this.props.options.activeRow && this.props.selected && this.props.playing
        ? <i className='fa fa-volume-up'/>
        : <a onClick={() => playback()}><i className='fa fa-play'/></a>
    return <td className='play-button'>{playButton}</td>
  }

  renderTitle (playback, download) {
    return (
        <td className='title'>
          <div className='desktop-only'>
            {this.props.song.title}
          </div>
          <div className='mobile-only'>
            <Tappable onTap={() => this.props.song.local ? playback() : download()}>
              {this.props.song.title}
              <small>
                {this.props.song.artist}
                {this.props.options.album &&
                <span> - {this.props.song.album}</span>
                }
              </small>
            </Tappable>
          </div>
        </td>
    )
  }

  renderArtist () {
    const linkTargetArtist = '/artists?artist=' + this.props.song.artist
    const artistClass = classNames('artist', {inactive: !this.props.song.artist})
    const artistLink = !this.props.song.artist ? '—' : <Link to={linkTargetArtist}>{this.props.song.artist}</Link>
    return <td className={artistClass}>{artistLink}</td>
  }

  renderAlbum () {
    const linkTargetAlbum = '/albums?album=' + this.props.song.album + '&artist=' + this.props.song.artist
    const albumClass = classNames('album', {inactive: !this.props.song.album})
    const albumLink = !this.props.song.album ? '—' : <Link to={linkTargetAlbum}>{this.props.song.album}</Link>
    return <td className={albumClass}>{albumLink}</td>
  }

  renderAdded () {
    return <td className='creation-date'><DateFormat then={this.props.song.addedAt}/></td>
  }

  renderLength () {
    return <td className='song-time'><Duration seconds={this.props.song.duration}/></td>
  }

  renderAvailability () {
    if (this.props.song.local) {
      return <td className='availability'><i className='flaticon-harddrive'/></td>
    }

    return (
      <td className='availability'>
        <span className='desktop-only'><i className='flaticon-download'/></span>
        <span className='mobile-only'>{this.props.downloading ? <i className='fa fa-refresh'/> : <i className='flaticon-download'/>}</span>
      </td>
    )
  }

  renderQueue () {
    if (!this.props.song.local) {
      return <td className='add-button'><a><i className='fa fa-plus'/></a></td>
    }

    return (
        <td className='add-button'>
          <a onClick={() => this.props.PLAYBACK_USER_QUEUE(this.props.song.id)}> <i className='fa fa-plus'/></a>
        </td>
    )
  }

  renderFavorite () {
    const favoriteClass = classNames('favorite-button', {active: this.props.song.favorite})
    return (
        <td className={favoriteClass}>
          <a onClick={() => this.props.TOGGLE_SONG_FAVORITE(this.props.song.id)}><i className='flaticon-favorite'/></a>
        </td>
    )
  }

  renderRemove () {
    return <td className='remove-button'><a onClick={() => this.props.REMOVE_SONG(this.props.song.id)}><i className='fa fa-trash'/></a>
    </td>
  }

  renderRemoveDownload () {
    return <td className='remove-button'><a><i className='fa fa-trash'/></a></td>
  }

  playbackFunction () {
    if (!this.props.song.local) {
      return () => {}
    }

    if (this.props.options.activeRow && this.props.selected && !this.props.playing) {
      return () => this.props.PLAYER_SET_PLAYING(true)
    }

    if (this.props.options.playbackSingle) {
      return () => this.props.PLAYBACK_SONG([this.props.song], 0)
    }

    return () => this.props.PLAYBACK_SONG(this.props.songs, this.props.index)
  }

  downloadFunction () {
    if (this.props.song.local) {
      return () => {}
    }

    return () => this.props.REQUEST_SONG(this.props.song.id)
  }

  render () {
    // Generate a playback function based on the options
    const playback = this.playbackFunction()
    const download = this.downloadFunction()

    const classes = classNames({
      active: this.props.options.activeRow && this.props.selected,
      desaturated: this.props.song.desaturated || !this.props.song.local
    })

    return (
        <tr className={classes} onDoubleClick={() => playback()}>
          {this.props.options.index ? this.renderIndex() : undefined}
          {this.props.options.track ? this.renderTrack() : undefined}
          {this.props.options.play ? this.renderPlayAndDownload(playback, download) : undefined}
          {this.props.options.title ? this.renderTitle(playback, download) : undefined}
          {this.props.options.artist ? this.renderArtist() : undefined}
          {this.props.options.album ? this.renderAlbum() : undefined}
          {this.props.options.added ? this.renderAdded() : undefined}
          {this.props.options.length ? this.renderLength() : undefined}
          {this.props.options.availability ? this.renderAvailability() : undefined}
          {this.props.options.queue ? this.renderQueue() : undefined}
          {this.props.options.favorite ? this.renderFavorite() : undefined}
          {this.props.options.remove ? this.renderRemove() : undefined}
          {this.props.options.removeDownload ? this.renderRemoveDownload() : undefined}
        </tr>
    )
  }
}

SongRow.propTypes = {
  song: React.PropTypes.object,
  songs: React.PropTypes.array,
  index: React.PropTypes.number,
  playing: React.PropTypes.bool,
  downloading: React.PropTypes.bool,
  selected: React.PropTypes.bool,
  options: React.PropTypes.object,
  PLAYBACK_SONG: React.PropTypes.func,
  PLAYBACK_USER_QUEUE: React.PropTypes.func,
  REMOVE_SONG: React.PropTypes.func,
  TOGGLE_SONG_FAVORITE: React.PropTypes.func,
  PLAYER_SET_PLAYING: React.PropTypes.func,
  REQUEST_SONG: React.PropTypes.func
}

module.exports = connect(null, {PLAYBACK_SONG, PLAYBACK_USER_QUEUE, REMOVE_SONG, TOGGLE_SONG_FAVORITE, PLAYER_SET_PLAYING, REQUEST_SONG})(SongRow)

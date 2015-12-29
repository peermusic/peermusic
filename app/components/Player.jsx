const React = require('react')
const ReactDOM = require('react-dom')
const { connect } = require('react-redux')
const classNames = require('classnames')
const { TOGGLE_PLAYING_NEXT_PANEL, PLAYER_SET_PLAYING, PLAYER_SEEK, PLAYER_SET_VOLUME, PLAYBACK_NEXT, PLAYBACK_BACK, TOGGLE_SONG_FAVORITE } = require('../actions')
const Duration = require('./Duration.jsx')

class Player extends React.Component {
  constructor () {
    super()
    this.state = {
      isSeeking: false,
      seekingDuration: 0
    }
  }

  getSeekerDuration () {
    return ReactDOM.findDOMNode(this.refs.seeker).value
  }

  startSeeking () {
    this.setState({
      isSeeking: true,
      seekingDuration: this.getSeekerDuration()
    })
  }

  seeking () {
    this.setState({
      isSeeking: true,
      seekingDuration: this.getSeekerDuration()
    })
  }

  stopSeeking () {
    var seek = this.getSeekerDuration()
    this.setState({
      isSeeking: false
    })
    this.props.PLAYER_SEEK(seek)
  }

  setVolume () {
    this.props.PLAYER_SET_VOLUME(ReactDOM.findDOMNode(this.refs.volume).value)
  }

  render () {
    const { player, currentSong, backEnabled, playingNextPanel, TOGGLE_PLAYING_NEXT_PANEL, PLAYER_SET_PLAYING, PLAYBACK_NEXT, PLAYBACK_BACK, TOGGLE_SONG_FAVORITE } = this.props

    const backButton = (backEnabled)
        ? <button onClick={() => PLAYBACK_BACK()}><i className='fa fa-step-backward'/></button>
        : <button disabled><i className='fa fa-step-backward'/></button>

    var volume = player.volume
    var playingToggle = !player.playing
    var playButton = player.playing ? <i className='fa fa-pause'/> : <i className='fa fa-play'/>
    var favoriteClass = classNames('favorite', {active: currentSong && currentSong.favorite})
    var playlistClass = classNames('playlist', {active: playingNextPanel})
    var currentDuration = 0
    var maxDuration = 0

    if (currentSong) {
      maxDuration = currentSong.length
      currentDuration = this.state.isSeeking || player.currentDuration === undefined ? this.state.seekingDuration : player.currentDuration
    }

    return (
        <div className='player'>
          <div className='buttons'>
            {backButton}
            <button className='play' onClick={() => PLAYER_SET_PLAYING(playingToggle)}>{playButton}</button>
            <button onClick={() => PLAYBACK_NEXT()}><i className='fa fa-step-forward'/></button>
          </div>

          <div className='seeker'>
            <div className='current-time'><Duration seconds={currentDuration}/></div>
            <input className='progressbar range-slider'
                   type='range'
                   min='0'
                   max={maxDuration}
                   value={currentDuration}
                   onMouseDown={() => this.startSeeking()}
                   onChange={() => this.seeking()}
                   onMouseUp={() => this.stopSeeking()}
                   ref='seeker'/>
            <div className='song-length'><Duration seconds={maxDuration}/></div>
          </div>

          <div className='volume'>
            <i className='fa fa-volume-up'/>
            <input type='range' className='range-slider' min='0' max='1' step='0.005' value={volume}
                   onChange={() => this.setVolume()} ref='volume'/>
          </div>

          <div className={favoriteClass}>
            <a onClick={() => TOGGLE_SONG_FAVORITE(currentSong.id)}><i className='flaticon-favorite'/></a>
          </div>

          <div className={playlistClass}>
            <a onClick={() => TOGGLE_PLAYING_NEXT_PANEL() }><i className='flaticon-queue'/></a>
          </div>

          <div className='shuffle'>
            <a><i className='fa fa-random'/></a>
          </div>

          <div className='radio'>
            <a>Radio</a>
          </div>

          <div className='share'>
            <a><i className='fa fa-share-square'/></a>
          </div>
        </div>
    )
  }
}

module.exports = connect(
    (state) => ({
      currentSong: state.songs.filter(s => s.id === state.player.songId)[0],
      player: state.player,
      backEnabled: state.player.history.currentIndex !== 0,
      playingNextPanel: state.interfaceStatus.playingNextPanel
    }),
    {TOGGLE_PLAYING_NEXT_PANEL, PLAYER_SET_PLAYING, PLAYER_SEEK, PLAYER_SET_VOLUME, PLAYBACK_NEXT, PLAYBACK_BACK, TOGGLE_SONG_FAVORITE}
)(Player)

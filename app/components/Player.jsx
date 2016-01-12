const React = require('react')
const ReactDOM = require('react-dom')
const { connect } = require('react-redux')
const classNames = require('classnames')
const {
    TOGGLE_PLAYING_NEXT_PANEL,
    PLAYER_SET_PLAYING,
    PLAYER_SEEK,
    PLAYER_SET_VOLUME,
    PLAYBACK_NEXT,
    PLAYBACK_BACK,
    TOGGLE_SONG_FAVORITE,
    TOGGLE_RANDOM_PLAYBACK,
    TOGGLE_REPEAT_PLAYBACK,
    TOGGLE_RADIO_PLAYBACK
} = require('../actions')
const Duration = require('./Duration.jsx')
const CurrentSong = require('./CurrentSong.jsx')

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
    const {
        player, currentSong, backEnabled, playingNextPanel, randomPlayback, radioPlayback,
        repeatPlayback, TOGGLE_PLAYING_NEXT_PANEL, PLAYER_SET_PLAYING, PLAYBACK_NEXT,
        PLAYBACK_BACK, TOGGLE_SONG_FAVORITE, TOGGLE_RANDOM_PLAYBACK, TOGGLE_REPEAT_PLAYBACK, TOGGLE_RADIO_PLAYBACK
    } = this.props

    const backButton = (backEnabled)
        ? <button onClick={() => PLAYBACK_BACK()}><i className='fa fa-step-backward'/></button>
        : <button disabled><i className='fa fa-step-backward'/></button>

    var volume = player.volume
    var playingToggle = !player.playing
    var playButton = player.playing ? <i className='fa fa-pause'/> : <i className='fa fa-play'/>
    var playerClass = classNames('player', {bottom: !this.props.inline})
    var repeatClass = classNames('repeat', {active: repeatPlayback})
    var favoriteClass = classNames('favorite', {active: currentSong && currentSong.favorite})
    var playlistClass = classNames('playlist', {active: playingNextPanel})
    var shuffleClass = classNames('shuffle', {active: randomPlayback})
    var radioClass = classNames('radio', {active: radioPlayback})
    var currentDuration = 0
    var maxDuration = 0

    if (currentSong) {
      maxDuration = currentSong.duration
      currentDuration = this.state.isSeeking || player.currentDuration === undefined ? this.state.seekingDuration : player.currentDuration
    }

    return (
        <div className={playerClass}>
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
                   onTouchStart={() => this.startSeeking()}
                   onChange={() => this.seeking()}
                   onMouseUp={() => this.stopSeeking()}
                   onTouchEnd={() => this.stopSeeking()}
                   ref='seeker'/>
            <div className='song-length'><Duration seconds={maxDuration}/></div>
          </div>

          <div className='volume'>
            <i className='fa fa-volume-up'/>
            <input type='range' className='range-slider' min='0' max='1' step='0.005' value={volume}
                   onChange={() => this.setVolume()} ref='volume'/>
          </div>

          <div className='extra-buttons'>
            <div className={favoriteClass}>
              <a onClick={() => TOGGLE_SONG_FAVORITE(currentSong.id)}><i className='flaticon-favorite'/></a>
            </div>

            <div className={repeatClass}>
              <a onClick={() => TOGGLE_REPEAT_PLAYBACK()}><i className='fa fa-repeat'/></a>
            </div>

            <div className={shuffleClass}>
              <a onClick={() => TOGGLE_RANDOM_PLAYBACK()}><i className='fa fa-random'/></a>
            </div>

            <div className={radioClass}>
              <a onClick={() => TOGGLE_RADIO_PLAYBACK()}>Radio</a>
            </div>

            <div className={playlistClass}>
              <a onClick={() => TOGGLE_PLAYING_NEXT_PANEL() }><i className='flaticon-queue'/></a>
            </div>
          </div>

          <div className='mobile-current-song'>
            <CurrentSong mobile/>
          </div>

          <div className='buttons mobile-buttons'>
            <button className='play' onClick={() => PLAYER_SET_PLAYING(playingToggle)}>{playButton}</button>
            </div>
        </div>
    )
  }
}

Player.propTypes = {
  PLAYER_SEEK: React.PropTypes.func,
  PLAYER_SET_VOLUME: React.PropTypes.func,
  player: React.PropTypes.object,
  currentSong: React.PropTypes.object,
  backEnabled: React.PropTypes.bool,
  inline: React.PropTypes.bool,
  playingNextPanel: React.PropTypes.bool,
  randomPlayback: React.PropTypes.bool,
  radioPlayback: React.PropTypes.bool,
  repeatPlayback: React.PropTypes.bool,
  TOGGLE_PLAYING_NEXT_PANEL: React.PropTypes.func,
  PLAYER_SET_PLAYING: React.PropTypes.func,
  PLAYBACK_NEXT: React.PropTypes.func,
  PLAYBACK_BACK: React.PropTypes.func,
  TOGGLE_SONG_FAVORITE: React.PropTypes.func,
  TOGGLE_RANDOM_PLAYBACK: React.PropTypes.func,
  TOGGLE_REPEAT_PLAYBACK: React.PropTypes.func,
  TOGGLE_RADIO_PLAYBACK: React.PropTypes.func
}

module.exports = connect(
    (state) => ({
      currentSong: state.songs.filter(s => s.id === state.player.songId)[0],
      player: state.player,
      backEnabled: state.player.history.currentIndex !== 0,
      playingNextPanel: state.interfaceStatus.playingNextPanel,
      randomPlayback: state.player.randomPlayback,
      repeatPlayback: state.player.repeatPlayback,
      radioPlayback: state.player.radioPlayback
    }),
    {TOGGLE_PLAYING_NEXT_PANEL, PLAYER_SET_PLAYING, PLAYER_SEEK, PLAYER_SET_VOLUME, PLAYBACK_NEXT, PLAYBACK_BACK, TOGGLE_SONG_FAVORITE, TOGGLE_RANDOM_PLAYBACK, TOGGLE_REPEAT_PLAYBACK, TOGGLE_RADIO_PLAYBACK}
)(Player)

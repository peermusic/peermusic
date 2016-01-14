const React = require('react')
const { connect } = require('react-redux')
const { PLAYBACK_SONG, PLAYER_SEEK, PLAYER_SET_PLAYING } = require('../actions')
import { pushPath } from 'redux-simple-router'

class ProtocolHandler extends React.Component {

  handlePlayback (songId, position) {
    const song = this.props.songs.filter(x => x.id === songId)[0]

    if (!song) {
      console.log('Song not found')
      this.props.pushPath('/songs/all')
      return
    }

    this.props.PLAYBACK_SONG([song], 0)
    this.props.PLAYER_SEEK(parseInt(position, 10))
    this.props.PLAYER_SET_PLAYING(true)
    this.props.pushPath('/songs/all')
  }

  componentDidMount () {
    window.setTimeout(() => {
      const uri = decodeURIComponent(this.props.routing.path.replace(/^.*\?s=(.*)$/, '$1'))
      var payload = uri.replace(/web\+peermusic:(\/\/)?/, '').split('#')

      switch (payload[0]) {
        case 'PLAYBACK':
          this.handlePlayback(...payload.splice(1))
      }
    }, 100)
  }

  render () {
    return false
  }
}

ProtocolHandler.propTypes = {
  routing: React.PropTypes.object,
  songs: React.PropTypes.array,
  pushPath: React.PropTypes.func,
  PLAYER_SEEK: React.PropTypes.func,
  PLAYBACK_SONG: React.PropTypes.func,
  PLAYER_SET_PLAYING: React.PropTypes.func
}

module.exports = connect(
  (state) => ({
    routing: state.routing,
    songs: state.songs
  }),
  {
    pushPath,
    PLAYER_SEEK,
    PLAYBACK_SONG,
    PLAYER_SET_PLAYING
  }
)(ProtocolHandler)

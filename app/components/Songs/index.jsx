const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('./SongTable.jsx')
const HorizontalNavigation = require('../HorizontalNavigation.jsx')
const { PLAYBACK_SONG } = require('../../actions')
const MobilePageHeader = require('../MobilePageHeader.jsx')
const InitialImportMessage = require('../InitialImportMessage.jsx')

function Songs ({ songs, PLAYBACK_SONG }) {
  var songDisplay = <div className='actual-page-content'>
    <InitialImportMessage/>
  </div>
  var playButton

  if (songs.length > 0) {
    const views = [
      {path: '/songs/all', name: 'All songs', content: <SongTable songs={songs}/>},
      {path: '/songs/own', name: 'Own songs', content: <SongTable songs={songs.filter(x => x.local)}/>},
      {path: '/songs/friends', name: 'Songs of friends', content: <SongTable songs={songs.filter(x => !x.local)}/>}
    ]
    songDisplay = <HorizontalNavigation views={views}/>
    playButton = (
        <button className='play-all' onClick={() => PLAYBACK_SONG(songs, 0)}>
          <i className='fa fa-play'/> Play all
        </button>
    )
  }

  return (
      <div>
        <MobilePageHeader title='Songs'/>
        <div className='page-heading'>
          <h2>Songs</h2>
          {playButton}
        </div>
        {songDisplay}
      </div>
  )
}

module.exports = connect(
  (state) => ({
    songs: state.songs
  }),
  {PLAYBACK_SONG}
)(Songs)

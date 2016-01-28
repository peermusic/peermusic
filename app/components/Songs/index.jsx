const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('./SongTable.jsx')
const HorizontalNavigation = require('../HorizontalNavigation.jsx')
const { PLAYBACK_SONG, REQUEST_INVENTORY } = require('../../actions')
const MobilePageHeader = require('../MobilePageHeader.jsx')
const InitialImportMessage = require('../InitialImportMessage.jsx')

function Songs ({ songs, PLAYBACK_SONG, REQUEST_INVENTORY }) {
  var songDisplay = <div className='actual-page-content'>
    <InitialImportMessage/>
  </div>

  if (songs.length > 0) {
    let remoteSongs = songs.filter(x => !x.local)
    let localSongs = songs.filter(x => x.local)
    const views = [
      {
        path: '/songs/all',
        name: 'All songs',
        content: <SongTable songs={songs}/>
      },
      {
        path: '/songs/own',
        name: 'Own songs',
        content: localSongs.length === 0
          ? <h3>You have no local songs added.</h3>
          : <SongTable songs={localSongs}/>
      },
      {
        path: '/songs/friends',
        name: 'Songs of friends',
        content: remoteSongs.length === 0
          ? <h3>There are no remote songs you don't have.</h3>
          : <SongTable songs={remoteSongs}/>
      }
    ]
    songDisplay = <HorizontalNavigation views={views}/>
  }

  return (
      <div>
        <MobilePageHeader title='Songs'/>
        <div className='page-heading'>
          <h2>Songs</h2>
          <button className='refresh-all' onClick={() => REQUEST_INVENTORY()}>
            <i className='fa fa-refresh'/> Refresh
          </button>
          <button className='play-all' onClick={() => PLAYBACK_SONG(songs, 0)}>
            <i className='fa fa-play'/> Play all
          </button>
        </div>
        {songDisplay}
      </div>
  )
}

module.exports = connect(
  (state) => ({
    songs: state.songs
  }),
  {PLAYBACK_SONG, REQUEST_INVENTORY}
)(Songs)

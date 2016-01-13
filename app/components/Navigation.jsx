const React = require('react')
const { Link } = require('react-router')
const { connect } = require('react-redux')
const CurrentSong = require('./CurrentSong.jsx')
const Search = require('./Search.jsx')
const { TOGGLE_MOBILE_NAVIGATION } = require('../actions')

function Navigation ({ TOGGLE_MOBILE_NAVIGATION }) {
  var linkProperties = {
    activeClassName: 'selected',
    onClick: () => TOGGLE_MOBILE_NAVIGATION()
  }

  return (
      <div className='navigation'>
        <a onClick={() => TOGGLE_MOBILE_NAVIGATION()} className='mobile-only close-navigation'>
          <i className='fa fa-times'/> Tap to close
        </a>
        <Search placeholder='Search...' callback={() => TOGGLE_MOBILE_NAVIGATION()}/>
        <div className='navigation-links'>
          <ul>
            <li className='heading'>Your music</li>
            <li className='mobile-only'><Link to='/currently-playing' className='flaticon-songs' {...linkProperties}>Currently playing</Link></li>
            <li><Link to='/songs' className='flaticon-songs' {...linkProperties}>Songs</Link></li>
            <li><Link to='/albums' className='flaticon-albums' {...linkProperties}>Albums</Link></li>
            <li><Link to='/artists' className='flaticon-artist' {...linkProperties}>Artists</Link></li>
            <li className='heading'>Playlists</li>
            <li><Link to='/favorites' className='flaticon-favorite' {...linkProperties}>Favorites</Link></li>
            <li><Link to='/playing-next' className='flaticon-queue' {...linkProperties}>Playing Next</Link></li>
            <li><Link to='/history' className='flaticon-history' {...linkProperties}>History</Link></li>
            <li className='heading'>Manage</li>
            <li><Link to='/manage-friends' className='flaticon-friends' {...linkProperties}>Friends</Link></li>
            <li><Link to='/manage-songs' className='flaticon-songs' {...linkProperties}>Songs</Link></li>
            <li><Link to='/manage-servers' className='flaticon-servers' {...linkProperties}>Servers</Link></li>
            <li><Link to='/manage-downloads' className='flaticon-download' {...linkProperties}>Downloads</Link></li>
          </ul>
        </div>
        <CurrentSong/>
      </div>
  )
}

module.exports = connect(
    (state) => ({
      routing: state.routing
    }),
    { TOGGLE_MOBILE_NAVIGATION }
)(Navigation)

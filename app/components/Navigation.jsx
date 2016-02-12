const React = require('react')
const { Link } = require('react-router')
const { connect } = require('react-redux')
const CurrentSong = require('./CurrentSong.jsx')
const Search = require('./Search.jsx')
const { TOGGLE_MOBILE_NAVIGATION } = require('../actions')
const classNames = require('classnames')

function Navigation ({ routing, TOGGLE_MOBILE_NAVIGATION }) {
  var linkProperties = {
    activeClassName: 'selected',
    onClick: () => TOGGLE_MOBILE_NAVIGATION()
  }

  var songLinkClasses = classNames('flaticon-songs', {selected: routing.path.indexOf('/songs') === 0})
  var favoritesLinkClasses = classNames('flaticon-favorite', {selected: routing.path.indexOf('/favorites') === 0})
  var friendsLinkClasses = classNames('flaticon-friends', {selected: routing.path.indexOf('/manage-friends') === 0})
  var devicesLinkClasses = classNames('flaticon-devices', {selected: routing.path.indexOf('/manage-devices') === 0})
  var manageSongsLinkClasses = classNames('flaticon-songs', {selected: routing.path.indexOf('/manage-songs') === 0})
  var manageServersLinkClasses = classNames('flaticon-servers', {selected: routing.path.indexOf('/manage-servers') === 0})
  var manageInternalsLinkClasses = classNames('flaticon-internals', {selected: routing.path.indexOf('/manage-internals') === 0})

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
            <li><Link to='/songs/all' className={songLinkClasses} {...linkProperties}>Songs</Link></li>
            <li><Link to='/albums' className='flaticon-albums' {...linkProperties}>Albums</Link></li>
            <li><Link to='/artists' className='flaticon-artist' {...linkProperties}>Artists</Link></li>
            <li className='heading'>Playlists</li>
            <li><Link to='/favorites/available' className={favoritesLinkClasses} {...linkProperties}>Favorites</Link></li>
            <li><Link to='/playing-next' className='flaticon-queue' {...linkProperties}>Playing Next</Link></li>
            <li><Link to='/history' className='flaticon-history' {...linkProperties}>History</Link></li>
            <li className='heading'>Manage</li>
            <li><Link to='/manage-downloads' className='flaticon-download' {...linkProperties}>Downloads</Link></li>
            <li><Link to='/manage-songs/own' className={manageSongsLinkClasses} {...linkProperties}>Collection</Link></li>
            <li><Link to='/manage-friends/authenticated' className={friendsLinkClasses} {...linkProperties}>Friends</Link></li>
            <li><Link to='/manage-devices/authenticated' className={devicesLinkClasses} {...linkProperties}>Devices</Link></li>
            <li><Link to='/manage-servers/scraping' className={manageServersLinkClasses} {...linkProperties}>Servers</Link></li>
            <li><Link to='/manage-internals/settings' className={manageInternalsLinkClasses} {...linkProperties}>Internals</Link></li>
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

/*globals Link */
const React = require('react')
const {
  // IndexLink,
  Link
} = require('react-router')
const { connect } = require('react-redux')
const CurrentSong = require('./CurrentSong.jsx')
const Search = require('./Search.jsx')

function Navigation () {
  var linkStyle = {
    activeClassName: 'selected'
  }

  return (
      <div className='navigation'>
        <Search placeholder='Search...'/>
        <div className='navigation-links'>
          <ul>
            <li className='heading'>Your music</li>
            <li><Link to='/songs' className='flaticon-songs' {...linkStyle}>Songs</Link></li>
            <li><Link to='/albums' className='flaticon-albums' {...linkStyle}>Albums</Link></li>
            <li><Link to='/artists' className='flaticon-artist' {...linkStyle}>Artists</Link></li>
            <li className='heading'>Playlists</li>
            <li><Link to='/favorites' className='flaticon-favorite' {...linkStyle}>Favorites</Link></li>
            <li><Link to='/playing-next' className='flaticon-queue' {...linkStyle}>Playing Next</Link></li>
            <li><Link to='/history' className='flaticon-history' {...linkStyle}>History</Link></li>
            <li className='heading'>Manage</li>
            <li><Link to='/manage-friends' className='flaticon-friends' {...linkStyle}>Friends</Link></li>
            <li><Link to='/manage-songs' className='flaticon-songs' {...linkStyle}>Songs</Link></li>
            <li><Link to='/manage-servers' className='flaticon-servers' {...linkStyle}>Servers</Link></li>
            <li><Link to='/manage-downloads' className='flaticon-download' {...linkStyle}>Downloads</Link></li>
          </ul>
        </div>
        <CurrentSong/>
      </div>
  )
}

module.exports = connect(
    (state) => ({
      routing: state.routing
    })
)(Navigation)

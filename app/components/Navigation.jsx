const React = require('react')
const { IndexLink, Link } = require('react-router')
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
            <li className='heading'>Manage</li>
            <li><Link to='/manage-songs' className='flaticon-songs' {...linkStyle}>Songs</Link></li>
            <li><Link to='/manage-servers' className='flaticon-servers' {...linkStyle}>Servers</Link></li>
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

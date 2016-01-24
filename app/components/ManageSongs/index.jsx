const React = require('react')
const HorizontalNavigation = require('../HorizontalNavigation.jsx')
const MobilePageHeader = require('../MobilePageHeader.jsx')
const OwnSongs = require('./OwnSongs.jsx')

function ManageSongs () {
  const views = [
    {path: '/manage-songs/own', name: 'Own songs', content: <OwnSongs/>}
  ]

  return (
    <div>
      <MobilePageHeader title='Manage songs'/>
      <div className='page-heading'>
        <h2>Manage songs</h2>
      </div>
      <HorizontalNavigation views={views}/>
    </div>
  )
}

module.exports = ManageSongs

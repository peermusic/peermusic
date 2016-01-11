const React = require('react')
const { connect } = require('react-redux')
const MobilePageHeader = require('../MobilePageHeader.jsx')
const CurrentSong = require('../CurrentSong.jsx')
const Player = require('../Player.jsx')

function CurrentlyPlaying () {
  return (
    <div>
      <MobilePageHeader title='Currently playing'/>
      <CurrentSong mobile/>
      <Player inline/>
    </div>
  )
}

module.exports = connect()(CurrentlyPlaying)

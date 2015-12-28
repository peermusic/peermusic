const React = require('react')
const { connect } = require('react-redux')
const Navigation = require('./Navigation.jsx')
const Player = require('./Player.jsx')
const DropPageWrapper = require('./DropPageWrapper.jsx')
const PlayingNext = require('./PlayingNext/index.jsx')

function App ({ children, currentUrl, playingNextPanel }) {
  var playingNext
  if (currentUrl !== '/playing-next' && playingNextPanel) {
    playingNext = <div className='content queue'><PlayingNext options={{index: false, play: false, added: false, length: false, favorite: false}}/></div>
  }

  return (
      <DropPageWrapper>
        <div className='top-content'>
          <Navigation/>
          <div className='content'>
            {children}
          </div>
          {playingNext}
        </div>
        <Player/>
      </DropPageWrapper>
  )
}

module.exports = connect(
    (state) => ({
      currentUrl: state.routing.path,
      playingNextPanel: state.interfaceStatus.playingNextPanel
    })
)(App)

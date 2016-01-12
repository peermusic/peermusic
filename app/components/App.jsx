const React = require('react')
const { connect } = require('react-redux')
const Navigation = require('./Navigation.jsx')
const Player = require('./Player.jsx')
const DropPageWrapper = require('./DropPageWrapper.jsx')
const PlayingNext = require('./PlayingNext/index.jsx')
const { HIDE_INITIAL_POPOVER } = require('../actions')

function App ({ children, currentUrl, playingNextPanel, initialPopover, HIDE_INITIAL_POPOVER }) {
  var playingNext, popover
  if (currentUrl !== '/playing-next' && playingNextPanel) {
    playingNext = <div className='content queue'><PlayingNext options={{index: false, play: false, added: false, length: false, favorite: false}}/></div>
  }

  if (initialPopover) {
    popover = (
      <div className='popover content'>
        <div>
          <h3 className='white'>Please agree to only use licence-free music with this tool.</h3>
          <div><button onClick={() => HIDE_INITIAL_POPOVER()}>Agree</button></div>
        </div>
      </div>
    )
  }

  return (
      <DropPageWrapper>
        {popover}
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
      playingNextPanel: state.interfaceStatus.playingNextPanel,
      initialPopover: state.interfaceStatus.initialPopover
    }),
    { HIDE_INITIAL_POPOVER }
)(App)

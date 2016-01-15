const React = require('react')
const { Link } = require('react-router')

function InitialImportMessage ({ manage }) {
  return (
    <div className='initial-import'>
      <img src='assets/import-songs.png'/>
      {manage
        ? <div className='mobile-only'>You didn't add any songs yet! Just tap the button above!</div>
        : <Link className='mobile-only' to='/manage-songs'>You didn't add any songs yet! You can add them by tapping here!</Link>
      }
      <div className='desktop-only'>
        You didn't add any songs yet!<br/>
        Start by dragging and dropping some songs into this window.
      </div>
    </div>
  )
}

InitialImportMessage.propTypes = {
  manage: React.PropTypes.bool
}

module.exports = InitialImportMessage

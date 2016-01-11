const React = require('react')
const { connect } = require('react-redux')
const { TOGGLE_MOBILE_NAVIGATION } = require('../actions')

function MobilePageHeader ({ title, TOGGLE_MOBILE_NAVIGATION }) {
  return (
      <div className='mobile-top-bar'>
        <div className='mobile-toggle'>
          <a className='burger' onClick={() => TOGGLE_MOBILE_NAVIGATION()}>
            <i className='fa fa-bars'/>
          </a>
          <div className='title'>{title}</div>
          <div className='padder'>
            <i className='fa fa-bars'/>
          </div>
        </div>
      </div>
  )
}

module.exports = connect(null, { TOGGLE_MOBILE_NAVIGATION })(MobilePageHeader)

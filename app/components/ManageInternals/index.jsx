const React = require('react')
const { connect } = require('react-redux')
const HorizontalNavigation = require('../HorizontalNavigation.jsx')
const MobilePageHeader = require('../MobilePageHeader.jsx')
const SettingsForm = require('./SettingsForm.jsx')

function ManageInternals ({  }) {
  const views = [
    {path: '/manage-internals/settings', name: 'Application settings', content: <SettingsForm/>},
  ]
  const internalsDisplay = <HorizontalNavigation views={views}/>

  return (
      <div>
        <MobilePageHeader title='Manage internals'/>
        <div className='page-heading'>
          <h2>Manage internals</h2>
        </div>
        {internalsDisplay}
      </div>
  )
}

module.exports = connect()(ManageInternals)

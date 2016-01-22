const React = require('react')
const { connect } = require('react-redux')
const HorizontalNavigation = require('../HorizontalNavigation.jsx')
const MobilePageHeader = require('../MobilePageHeader.jsx')

function ManageInternals ({  }) {
  const views = [
    {path: '/manage-internals/settings', name: 'Application settings', content: <span>Placeholder</span>},
  ]
  const internalsDisplay = <HorizontalNavigation views={views}/>

  return (
      <div>
        <MobilePageHeader title='Manage Internals'/>
        <div className='page-heading'>
          <h2>Manage Internals</h2>
        </div>
        {internalsDisplay}
      </div>
  )
}

module.exports = connect()(ManageInternals)

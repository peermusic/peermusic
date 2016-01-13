const React = require('react')
const { connect } = require('react-redux')
const ScrapingServerForm = require('./ScrapingServerForm.jsx')
const ScrapingServerTable = require('./ScrapingServerTable.jsx')
const MobilePageHeader = require('../MobilePageHeader.jsx')

function ManageServers ({ scrapingServers }) {
  var scrapingServerTable = scrapingServers.length === 0 ? <h3>No scraping servers added yet.</h3> : <ScrapingServerTable servers={scrapingServers}/>

  return (
      <div>
        <MobilePageHeader title='Manage servers'/>
        <div className='page-heading'>
          <h2>Manage servers</h2>
        </div>
        <div className='actual-page-content'>
          <ScrapingServerForm/>
          {scrapingServerTable}
        </div>
      </div>
  )
}

module.exports = connect(
    (state) => ({
      scrapingServers: state.scrapingServers
    })
)(ManageServers)

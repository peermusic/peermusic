const React = require('react')
const { connect } = require('react-redux')
const ScrapingServerForm = require('./ScrapingServerForm.jsx')
const ScrapingServerTable = require('./ScrapingServerTable.jsx')
const HubTable = require('./HubTable.jsx')
const MobilePageHeader = require('../MobilePageHeader.jsx')
const HorizontalNavigation = require('../HorizontalNavigation.jsx')

function ManageServers ({ scrapingServers, hubs }) {
  const ScrapingServers = (
    <div>
      <ScrapingServerForm/>
      {scrapingServers.length === 0 ? <h3>No scraping servers added yet.</h3> : <ScrapingServerTable servers={scrapingServers}/>}
    </div>
  )

  const Hubs = (
    <div>
      <h3>Hubs you have issued or received invites for</h3><br/>
      {hubs.length === 0 ? <h3>No hubs added yet.</h3> : <HubTable hubs={hubs}/>}
    </div>
  )

  const views = [
    {path: '/manage-servers/scraping', name: 'Scraping', content: ScrapingServers},
    {path: '/manage-servers/hubs', name: 'Hubs', content: Hubs}
  ]
  const serverDisplay = <HorizontalNavigation views={views}/>

  return (
      <div>
        <MobilePageHeader title='Manage servers'/>
        <div className='page-heading'>
          <h2>Manage servers</h2>
        </div>
        {serverDisplay}
      </div>
  )
}

module.exports = connect(
    (state) => ({
      scrapingServers: state.scrapingServers,
      hubs: state.instances.hubUrls
    })
)(ManageServers)

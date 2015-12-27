const React = require('react')
const { connect } = require('react-redux')
const ScrapingServerForm = require('./ScrapingServerForm.jsx')
const ScrapingServerTable = require('./ScrapingServerTable.jsx')

function ManageServers ({ scrapingServers }) {
  var scrapingServerTable = scrapingServers.length === 0 ? <h3>No scraping servers added yet.</h3> : <ScrapingServerTable servers={scrapingServers}/>

  return (
      <div>
        <h2>Manage scraping servers</h2>
        <ScrapingServerForm/>
        {scrapingServerTable}
      </div>
  )
}

module.exports = connect(
    (state) => ({
      scrapingServers: state.scrapingServers
    })
)(ManageServers)

const React = require('react')
const { connect } = require('react-redux')
const classNames = require('classnames')
const CopyableInput = require('../CopyableInput.jsx')
const { REMOVE_SCRAPING_SERVER } = require('../../actions')

function ScrapingServerTable ({ servers, REMOVE_SCRAPING_SERVER }) {
  return (
      <table className='song-table no-borders'>
        <tbody>
        <tr>
          <th className='number'>#</th>
          <th>Description</th>
          <th>Server URL</th>
          <th className='remove-button'/>
        </tr>
        {servers.map((server, i) => {
          var descriptionClass = classNames('desktop-only', {inactive: !server.description})
          return (
              <tr key={i}>
                <td className='number'>{i + 1}</td>
                <td className={descriptionClass}>{server.description || 'No description'}</td>
                <td className='break-cell'>
                  <span className='mobile-column-heading mobile-only'>{server.description || 'No description'}</span>
                  <CopyableInput value={server.serverUrl}/>
                </td>
                <td className='remove-button'><a onClick={() => REMOVE_SCRAPING_SERVER(i)}><i className='fa fa-trash'/></a></td>
              </tr>
          )
        })}
        </tbody>
      </table>
  )
}

module.exports = connect(null, {REMOVE_SCRAPING_SERVER})(ScrapingServerTable)

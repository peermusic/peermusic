const React = require('react')
const { connect } = require('react-redux')
const classNames = require('classnames')
const { REMOVE_SCRAPING_SERVER } = require('../../actions')

function ScrapingServerTable ({ servers, REMOVE_SCRAPING_SERVER }) {
  return (
      <table className='song-table'>
        <tbody>
        <tr>
          <th className='number'>#</th>
          <th>Server URL</th>
          <th>Description</th>
          <th/>
        </tr>
        {servers.map((server, i) => {
          var descriptionClass = classNames({inactive: !server.description})
          return (
              <tr key={i}>
                <td className='number'>{i + 1}</td>
                <td>{server.url}</td>
                <td className={descriptionClass}>{server.description || '—'}</td>
                <td><a onClick={() => REMOVE_SCRAPING_SERVER(i)}><i className='fa fa-trash'/></a></td>
              </tr>
          )
        })}
        </tbody>
      </table>
  )
}

module.exports = connect(null, {REMOVE_SCRAPING_SERVER})(ScrapingServerTable)

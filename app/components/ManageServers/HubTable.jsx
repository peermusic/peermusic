const React = require('react')

function HubTable ({ hubs }) {
  return (
      <table className='song-table no-borders'>
        <tbody>
        <tr>
          <th className='number'>#</th>
          <th>Hub URL</th>
        </tr>
        {hubs.map((hub, i) => {
          return (
              <tr key={i}>
                <td className='number'>{i + 1}</td>
                <td className='break-cell'>
                  {hub}
                </td>
              </tr>
          )
        })}
        </tbody>
      </table>
  )
}

module.exports = HubTable

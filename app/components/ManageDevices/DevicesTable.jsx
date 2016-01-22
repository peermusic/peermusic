const React = require('react')
const { connect } = require('react-redux')
const classNames = require('classnames')
const CopyableInput = require('../CopyableInput.jsx')
const { REMOVE_PEER } = require('../../actions')

function DevicesTable ({ devices, REMOVE_PEER }) {
  return (
      <table className='song-table no-borders'>
        <tbody>
        <tr>
          <th className='number'>#</th>
          <th>Description</th>
          <th>Device ID</th>
          <th className='remove-button'/>
        </tr>
        {devices.map((device, i) => {
          var descriptionClass = classNames('desktop-only', {inactive: !device.description})
          return (
              <tr key={i}>
                <td className='number'>{i + 1}</td>
                <td className={descriptionClass}>{device.description || '—'}</td>
                <td className='break-cell'>
                  <span className='mobile-column-heading mobile-only'>{device.description || 'No description'}</span>
                  <CopyableInput value={device.peerId}/>
                </td>
                <td className='remove-button'><a onClick={() => REMOVE_PEER(device.peerId)}><i className='fa fa-trash'/></a></td>
              </tr>
          )
        })}
        </tbody>
      </table>
  )
}

module.exports = connect(null, {REMOVE_PEER})(DevicesTable)

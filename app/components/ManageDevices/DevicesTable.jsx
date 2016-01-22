const React = require('react')
const { connect } = require('react-redux')
const classNames = require('classnames')
const CopyableInput = require('../CopyableInput.jsx')
const { REMOVE_PEER, SET_SHARING_LEVEL } = require('../../actions')

function DevicesTable ({ devices, myId, sharingLevel, REMOVE_PEER, SET_SHARING_LEVEL }) {
  function setMySharingLevel (event) {
    SET_SHARING_LEVEL(event.target.value, 'self')
  }

  return (
      <table className='song-table no-borders'>
        <tbody>
        <tr>
          <th className='number'>#</th>
          <th>Description</th>
          <th>Sharing Level</th>
          <th>Device ID</th>
          <th className='remove-button'/>
        </tr>

        <tr>
          <td className='number'></td>
          <td>This device</td>
          <td>
            <select defaultValue={sharingLevel} onChange={setMySharingLevel}>
              <option value='LEECH'>leech</option>
              <option value='PRIVATE'>private</option>
              <option value='FRIENDS'>friends</option>
              <option value='EVERYONE'>everyone</option>
            </select>
          </td>
          <td className='break-cell'>
            <span className='mobile-column-heading mobile-only'></span>
            <CopyableInput value={myId}/>
          </td>
          <td className='remove-button'></td>
        </tr>

        {devices.map((device, i) => {
          var descriptionClass = classNames('desktop-only', {inactive: !device.description})
          return (
              <tr key={i}>
                <td className='number'>{i + 1}</td>
                <td className={descriptionClass}>{device.description || '—'}</td>
                <td>
                  <select value={device.sharingLevel} disabled>
                    <option value='WAITING'>waiting...</option>
                    <option value='LEECH'>leech</option>
                    <option value='PRIVATE'>private</option>
                    <option value='FRIENDS'>friends</option>
                    <option value='EVERYONE'>everyone</option>
                  </select>
                </td>
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

module.exports = connect(null, {REMOVE_PEER, SET_SHARING_LEVEL})(DevicesTable)

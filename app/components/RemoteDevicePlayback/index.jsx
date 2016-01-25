const React = require('react')
const { connect } = require('react-redux')
const {TOGGLE_DEVICE_REMOTE_PLAYBACK} = require('../../actions')

function RemoteDevicePlayback ({ devices, TOGGLE_DEVICE_REMOTE_PLAYBACK }) {
  return (
      <div className='remote-sync-popover'>
        <h2>Remote playback</h2>
        <ul>
          {devices.map(device => {
            var className = device.remotePlayback ? 'enabled' : 'disabled'
            return (
              <li key={device.peerId} className={className}>
                <a onClick={() => TOGGLE_DEVICE_REMOTE_PLAYBACK(device.peerId)}>
                  {device.remotePlayback ? <i className='fa fa-volume-up'/> : <i className='fa fa-volume-off'/>}
                  {device.description}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
  )
}

module.exports = connect((state) => ({
  devices: state.devices
}), {TOGGLE_DEVICE_REMOTE_PLAYBACK})(RemoteDevicePlayback)

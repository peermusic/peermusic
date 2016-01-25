const React = require('react')
const { connect } = require('react-redux')
const classNames = require('classnames')
const CopyableInput = require('../CopyableInput.jsx')
const { REMOVE_PEER } = require('../../actions')

function FriendsTable ({ friends, REMOVE_PEER }) {
  return (
      <table className='song-table no-borders'>
        <tbody>
        <tr>
          <th className='number'>#</th>
          <th className='status desktop-only'>Status</th>
          <th>Description</th>
          <th>Friend ID</th>
          <th className='remove-button'/>
        </tr>
        {friends.map((friend, i) => {
          var descriptionClass = classNames('desktop-only', {inactive: !friend.description})
          return (
              <tr key={i}>
                <td className='number'>{i + 1}</td>
                <td className='status desktop-only'>
                  {friend.online ? <span className='online'><i className='fa fa-circle'/> Online</span> : <span className='offline'><i className='fa fa-circle-o'/> Offline</span>}
                </td>
                <td className={descriptionClass}>{friend.description || '—'}</td>
                <td className='break-cell'>
                  <span className='mobile-column-heading mobile-only'>{friend.description || 'No description'}</span>
                  <CopyableInput value={friend.peerId}/>
                  <div className='mobile-only mobile-status'>
                    Status:
                    {friend.online ? <span className='online'><i className='fa fa-circle'/> Online</span> : <span className='offline'><i className='fa fa-circle-o'/> Offline</span>}
                  </div>
                </td>
                <td className='remove-button'><a onClick={() => REMOVE_PEER(friend.peerId)}><i className='fa fa-trash'/></a></td>
              </tr>
          )
        })}
        </tbody>
      </table>
  )
}

module.exports = connect(null, {REMOVE_PEER})(FriendsTable)

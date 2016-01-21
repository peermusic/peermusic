const React = require('react')
const { connect } = require('react-redux')
const classNames = require('classnames')
const CopyableInput = require('../CopyableInput.jsx')
const { DISCARD_RECEIVED_INVITE } = require('../../actions')

function ReceivedInvitesTable ({ receivedInvitesList, DISCARD_RECEIVED_INVITE }) {
  return (
      <table className='song-table no-borders'>
        <tbody>
        <tr>
          <th className='number'>#</th>
          <th>Description</th>
          <th>Their ID</th>
          <th className='remove-button'/>
        </tr>
        {receivedInvitesList.map((invite, i) => {
          var inviteClass = classNames({inactive: !invite.description})
          var descriptionClass = classNames('desktop-only', {inactive: !invite.description})
          return (
            <tr key={i}>
              <td className='number'>{i + 1}</td>
              <td className={descriptionClass}>{invite.description || 'No description'}</td>
              <td className={inviteClass}>
                <span className='mobile-column-heading mobile-only'>{invite.description || 'No description'}</span>
                <CopyableInput value={invite.theirPubKey || '—'}/>
              </td>
              <td className='remove-button'><a onClick={() => DISCARD_RECEIVED_INVITE(i)}><i className='fa fa-trash'/></a></td>
            </tr>
          )
        })}
        </tbody>
      </table>
  )
}

module.exports = connect(null, {DISCARD_RECEIVED_INVITE})(ReceivedInvitesTable)

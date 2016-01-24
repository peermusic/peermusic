const React = require('react')
const { connect } = require('react-redux')
const classNames = require('classnames')
const CopyableInput = require('../CopyableInput.jsx')
const { DISCARD_ISSUED_INVITE } = require('../../actions')
const QRButton = require('../QRButton.jsx')

function IssuedInvitesTable ({ issuedInvitesList, DISCARD_ISSUED_INVITE }) {
  return (
      <table className='song-table no-borders'>
        <tbody>
        <tr>
          <th className='number'>#</th>
          <th>Description</th>
          <th>Invite URI</th>
          <th className='qr desktop-only'>Invite QR-Code</th>
          <th className='remove-button'/>
        </tr>
        {issuedInvitesList.map((invite, i) => {
          var inviteClass = classNames({inactive: !invite.description})
          var descriptionClass = classNames('desktop-only', {inactive: !invite.description})
          return (
            <tr key={i}>
              <td className='number'>{i + 1}</td>
              <td className={descriptionClass}>{invite.description || 'No description'}</td>
              <td className={inviteClass}>
                <span className='mobile-column-heading mobile-only'>{invite.description || 'No description'}</span>
                <CopyableInput value={invite.uri || '—'}/>
                <div className='mobile-qr-button mobile-only'><QRButton data={invite.uri}/></div>
              </td>
              <td className='desktop-only'>
                <QRButton data={invite.uri}/>
              </td>
              <td className='remove-button'><a onClick={() => DISCARD_ISSUED_INVITE(invite.sharedSignPubKey)}><i className='fa fa-trash'/></a></td>
            </tr>
          )
        })}
        </tbody>
      </table>
  )
}

module.exports = connect(null, {DISCARD_ISSUED_INVITE})(IssuedInvitesTable)

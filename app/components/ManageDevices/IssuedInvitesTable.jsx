const React = require('react')
const { connect } = require('react-redux')
const classNames = require('classnames')
const { DISCARD_ISSUED_INVITE } = require('../../actions')

function IssuedInvitesTable ({ issuedInvitesList, DISCARD_ISSUED_INVITE }) {
  return (
      <table className='song-table no-borders'>
        <tbody>
        <tr>
          <th className='number'>#</th>
          <th>Description</th>
          <th>Invite URI</th>
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
                <input type='text' value={invite.uri || '—'} readOnly onFocus={e => e.target.select()}/>
              </td>
              <td className='remove-button'><a onClick={() => DISCARD_ISSUED_INVITE(i)}><i className='fa fa-trash'/></a></td>
            </tr>
          )
        })}
        </tbody>
      </table>
  )
}

module.exports = connect(null, {DISCARD_ISSUED_INVITE})(IssuedInvitesTable)

const React = require('react')
const { connect } = require('react-redux')
const ReceiveInviteForm = require('./ReceiveInviteForm.jsx')
const ReceivedInvitesTable = require('./ReceivedInvitesTable.jsx')
const IssueInviteForm = require('./IssueInviteForm.jsx')
const IssuedInvitesTable = require('./IssuedInvitesTable.jsx')
const DevicesTable = require('./DevicesTable.jsx')
const HorizontalNavigation = require('../HorizontalNavigation.jsx')
const MobilePageHeader = require('../MobilePageHeader.jsx')

function ManageDevices ({ devices, issuedInvitesList, myId, receivedInvitesList, sharingLevel }) {
  const devicesView = (
      <div>
        <DevicesTable devices={devices} myId={myId} sharingLevel={sharingLevel}/>
        {devices.length === 0
            ? <div>
                <br/>
                <h3>No devices authenticated yet.</h3>
                <p>To authenticate devices, create a new invite on the "issue invites" page and paste the resulting URL into the "recieve invites" page on your other device.</p>
              </div>
            : null}
      </div>
  )

  const issueView = (
      <div>
        <IssueInviteForm/>
        {issuedInvitesList.length > 0 ? <div><h3>Pending</h3><br/><IssuedInvitesTable issuedInvitesList={issuedInvitesList}/></div>
            : <h3>No invites issued yet.</h3>}
      </div>
  )

  const receiveView = (
      <div>
        <ReceiveInviteForm/>
        {receivedInvitesList.length > 0 ? <div><h3>Pending</h3><br/><ReceivedInvitesTable receivedInvitesList={receivedInvitesList}/></div>
            : <h3>No invites to receive added yet.</h3>}
      </div>
  )

  const views = [
    {path: '/manage-devices/authenticated', name: 'Devices (' + devices.length + ')', content: devicesView},
    {path: '/manage-devices/issue', name: 'Issue Invites (' + issuedInvitesList.length + ')', content: issueView},
    {path: '/manage-devices/receive', name: 'Receive Invites (' + receivedInvitesList.length + ')', content: receiveView}
  ]

  return (
      <div>
        <MobilePageHeader title='Manage devices'/>
        <div className='page-heading'>
          <h2>Manage devices</h2>
        </div>
        <HorizontalNavigation views={views}/>
      </div>
  )
}

module.exports = connect(
    (state) => ({
      devices: state.devices,
      issuedInvitesList: state.instances.issuedInvitesList.filter((invite) => {
        return invite.ownInstance
      }),
      myId: state.instances.keyPair.publicKey,
      receivedInvitesList: state.instances.receivedInvitesList,
      sharingLevel: state.sync.sharingLevel
    })
)(ManageDevices)

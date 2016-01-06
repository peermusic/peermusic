const React = require('react')
const { connect } = require('react-redux')
const ReceiveInviteForm = require('./ReceiveInviteForm.jsx')
const ReceivedInvitesTable = require('./ReceivedInvitesTable.jsx')
const IssueInviteForm = require('./IssueInviteForm.jsx')
const IssuedInvitesTable = require('./IssuedInvitesTable.jsx')
const FriendsTable = require('./FriendsTable.jsx')

function ManageFriends ({ friends, issuedInvitesList, receivedInvitesList }) {
  var issuedInvitesTable = issuedInvitesList.length === 0
    ? <p>No invites issued yet.</p>
    : <IssuedInvitesTable issuedInvitesList={issuedInvitesList}/>
  var receivedInvitesTable = receivedInvitesList.length === 0
    ? <p>No invites received yet.</p>
    : <ReceivedInvitesTable receivedInvitesList={receivedInvitesList}/>
  var friendsTable = friends.length === 0
    ? <p>No friends authenticated yet.</p>
    : <FriendsTable friends={friends}/>

  return (
      <div>
        <h2>Manage friends</h2>

        <h3>Issue Invites</h3>
        <IssueInviteForm/>
        <h4>Pending</h4>
        {issuedInvitesTable}

        <br/><br/>
        <h3>Receive Invites</h3>
        <ReceiveInviteForm/>
        <h4>Pending</h4>
        {receivedInvitesTable}

        <br/><br/>
        <h3>Authenticated Friends</h3>
        {friendsTable}
      </div>
  )
}

module.exports = connect(
    (state) => ({
      friends: state.friends,
      issuedInvitesList: state.instances.issuedInvitesList,
      receivedInvitesList: state.instances.receivedInvitesList
    })
)(ManageFriends)

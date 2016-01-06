const React = require('react')
const { connect } = require('react-redux')
const FriendsReceiveInviteForm = require('./FriendsReceiveInviteForm.jsx')
const IssueInviteForm = require('./IssueInviteForm.jsx')
const IssuedInvitesTable = require('./IssuedInvitesTable.jsx')
const FriendsTable = require('./FriendsTable.jsx')

function ManageFriends ({ friends, issuedInvitesList }) {
  var issuedInvitesTable = issuedInvitesList.length === 0
    ? <p>No invites issued yet.</p>
    : <IssuedInvitesTable issuedInvitesList={issuedInvitesList}/>
  var friendsTable = friends.length === 0
    ? <p>No friends added yet.</p>
    : <FriendsTable friends={friends}/>

  return (
      <div>
        <h2>Manage friends</h2>

        <h3>Issue Invites</h3>
        <IssueInviteForm/>
        <h4>Pending</h4>
        {issuedInvitesTable}

        <h3>Receive Invites</h3>
        <FriendsReceiveInviteForm/>
        <h4>Pending</h4>

        <h3>Authenticated Friends</h3>
        {friendsTable}
      </div>
  )
}

module.exports = connect(
    (state) => ({
      friends: state.friends,
      issuedInvitesList: state.instances.issuedInvitesList
    })
)(ManageFriends)

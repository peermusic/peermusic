const React = require('react')
const { connect } = require('react-redux')
const ReceiveInviteForm = require('./ReceiveInviteForm.jsx')
const ReceivedInvitesTable = require('./ReceivedInvitesTable.jsx')
const IssueInviteForm = require('./IssueInviteForm.jsx')
const IssuedInvitesTable = require('./IssuedInvitesTable.jsx')
const FriendsTable = require('./FriendsTable.jsx')
const HorizontalNavigation = require('../HorizontalNavigation.jsx')

function ManageFriends ({ friends, issuedInvitesList, receivedInvitesList }) {
  const friendsView = (
      <div>
        {friends.length > 0 ? <FriendsTable friends={friends}/>
            : <div>
                <h3>No friends authenticated yet.</h3>
                <p>To authenticate friends, create a new invite on the "issue invites" page, send the resulting URL to a friend and let him paste the URL into the "recieve invites" page.</p>
              </div>}
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
    {name: 'Authenticated Friends (' + friends.length + ')', content: friendsView},
    {name: 'Issue Invites (' + issuedInvitesList.length + ')', content: issueView},
    {name: 'Receive Invites (' + receivedInvitesList.length + ')', content: receiveView}
  ]

  return (
      <div>
        <h2>Manage friends</h2>
        <HorizontalNavigation views={views} identifier='friends'/>
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
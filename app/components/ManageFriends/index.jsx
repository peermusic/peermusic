const React = require('react')
const { connect } = require('react-redux')
const FriendsForm = require('./FriendsForm.jsx')
const FriendsTable = require('./FriendsTable.jsx')

function ManageFriends ({ friends }) {
  var friendsTable = friends.length === 0 ? <h3>No friends added yet.</h3> : <FriendsTable friends={friends}/>

  return (
      <div>
        <h2>Manage friends</h2>
        <FriendsForm/>
        {friendsTable}
      </div>
  )
}

module.exports = connect(
    (state) => ({
      friends: state.friends
    })
)(ManageFriends)

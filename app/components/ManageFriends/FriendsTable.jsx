const React = require('react')
const { connect } = require('react-redux')
const classNames = require('classnames')
const { REMOVE_PEER } = require('../../actions')

function FriendsTable ({ friends, REMOVE_PEER }) {
  return (
      <table className='song-table'>
        <tbody>
        <tr>
          <th className='number'>#</th>
          <th>Description</th>
          <th>Friend ID</th>
          <th className='remove-button'/>
        </tr>
        {friends.map((friend, i) => {
          var descriptionClass = classNames({inactive: !friend.description})
          return (
              <tr key={i}>
                <td className='number'>{i + 1}</td>
                <td className={descriptionClass}>{friend.description || '—'}</td>
                <td className='break-cell'>{friend.peerId}</td>
                <td className='remove-button'><a onClick={() => REMOVE_PEER(friend.peerId, i)}><i className='fa fa-trash'/></a></td>
              </tr>
          )
        })}
        </tbody>
      </table>
  )
}

module.exports = connect(null, {REMOVE_PEER})(FriendsTable)
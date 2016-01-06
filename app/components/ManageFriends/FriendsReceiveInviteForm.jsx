const React = require('react')
const ReactDOM = require('react-dom')
const { connect } = require('react-redux')
const { ADD_FRIEND } = require('../../actions')

class FriendsForm extends React.Component {
  onSubmit (e) {
    e.preventDefault()

    var description = ReactDOM.findDOMNode(this.refs.description)
    var friendUrl = ReactDOM.findDOMNode(this.refs.friendUrl)

    this.props.ADD_FRIEND(description.value, friendUrl.value)
    this.props.RECEIVE_INVITE(friendUrl.value)

    description.value = ''
    friendUrl.value = ''

    return false
  }

  render () {
    return (
        <form className='pretty-form' onSubmit={(e) => this.onSubmit(e)}>
          <div>
            <label>
              Description
            </label>
            <input type='text' placeholder='Joe from Work' ref='description'/>
          </div>
          <div className='no-border'>
            <label>
              Friend URL
            </label>
            <textarea placeholder='peermusic://host:port/#pubKey(A):signPrivKey(AB)' ref='friendUrl'/>
          </div>

          <div className='no-border'>
            <input type='submit' value='Add new friend'/>
          </div>
        </form>
    )
  }
}

FriendsForm.propTypes = {
  ADD_FRIEND: React.PropTypes.func,
  RECEIVE_INVITE: React.PropTypes.func
}

module.exports = connect(null, {ADD_FRIEND})(FriendsForm)

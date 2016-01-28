const React = require('react')
const ReactDOM = require('react-dom')
const { connect } = require('react-redux')
const { RECEIVE_INVITE } = require('../../actions')
const qrreader = require('../QRReader.jsx')

class ReceiveInviteForm extends React.Component {
  readQR (e) {
    e.preventDefault()

    qrreader('web+peermusic://FRIEND').then((value) => {
      if (value) {
        ReactDOM.findDOMNode(this.refs.friendUrl).value = value
      }
    })
  }

  onSubmit (e) {
    e.preventDefault()

    var description = ReactDOM.findDOMNode(this.refs.description)
    var friendUrl = ReactDOM.findDOMNode(this.refs.friendUrl)

    if (friendUrl.value === '') {
      window.alert('A friend URL is needed')
      return
    }

    this.props.RECEIVE_INVITE(description.value, friendUrl.value)

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
            <div>
              <button onClick={(e) => this.readQR(e)}>Read QR code</button>
              <br/>
              <textarea placeholder='web+peermusic://FRIEND#host:port#pubKey#signPrivKey' ref='friendUrl' defaultValue={this.props.defaultValue}/>
            </div>
          </div>

          <div className='no-border'>
            <input type='submit' value='Add new friend'/>
          </div>
        </form>
    )
  }
}

ReceiveInviteForm.propTypes = {
  defaultValue: React.PropTypes.string,
  RECEIVE_INVITE: React.PropTypes.func
}

module.exports = connect((state) => {
  const defaultValue = /^.*\?default=(.*)$/.exec(state.routing.path)
  return {
    defaultValue: defaultValue ? decodeURIComponent(defaultValue[1]) : ''
  }
}, {RECEIVE_INVITE})(ReceiveInviteForm)

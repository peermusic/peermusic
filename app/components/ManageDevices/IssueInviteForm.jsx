const React = require('react')
const ReactDOM = require('react-dom')
const { connect } = require('react-redux')
const { ISSUE_INVITE } = require('../../actions')

class IssueInviteForm extends React.Component {
  onSubmit (e) {
    e.preventDefault()

    var description = ReactDOM.findDOMNode(this.refs.description)
    var hubUrl = ReactDOM.findDOMNode(this.refs.hubUrl)

    this.props.ISSUE_INVITE(description.value,
      hubUrl.value ? hubUrl.value : 'localhost:7000'
    )

    description.value = ''
    hubUrl.value = ''

    return false
  }

  render () {
    return (
      <form className='pretty-form' onSubmit={(e) => this.onSubmit(e)}>
        <div>
          <label>
            Description
          </label>
          <input type='text' placeholder='Alice from Work' ref='description'/>
        </div>
        <div className='no-border'>
          <label>
            HUB URL
          </label>
          <input type='text' placeholder='http://localhost:7000' ref='hubUrl'/>
        </div>
        <div className='no-border'>
          <label>
            SHARING LEVEL
          </label>
          <select defaultValue='FRIENDS' ref='sharingLevel'>
            <option value='LEECH'>leech</option>
            <option value='PRIVATE'>private</option>
            <option value='FRIENDS'>friends</option>
            <option value='PUBLIC'>public</option>
          </select>
        </div>

        <div className='no-border'>
          <input type='submit' value='Generate an Invite'/>
        </div>
      </form>
    )
  }
}

IssueInviteForm.propTypes = {
  ISSUE_INVITE: React.PropTypes.func
}

module.exports = connect(null, {ISSUE_INVITE})(IssueInviteForm)

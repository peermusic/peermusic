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
      hubUrl.value ? hubUrl.value : 'https://signalhub.perguth.de:65300/', true
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
            Hub url
          </label>
          <input type='text' placeholder='https://signalhub.perguth.de:65300/' ref='hubUrl'/>
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

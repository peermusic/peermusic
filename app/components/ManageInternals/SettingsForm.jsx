const React = require('react')
const { connect } = require('react-redux')
const { TOGGLE_NOTIFICATIONS } = require('../../actions')

class SettingsForm extends React.Component {
  render () {
    // We need to disable linting for this, because it whines around about value={true}
    /*eslint-disable */
    return (
      <form className='pretty-form'>
        <div>
          <label>
            Theme
          </label>
          <select>
            <option>dark</option>
          </select>
        </div>
        <div className='no-border'>
          <label>
            Desktop notifications
          </label>
          <select value={this.props.notifications} onChange={() => this.props.TOGGLE_NOTIFICATIONS()}>
            <option value={true}>enabled</option>
            <option value={false}>disabled</option>
          </select>
        </div>
      </form>
    )
  }
  /*eslint-enable */
}

SettingsForm.propTypes = {
  notifications: React.PropTypes.bool,
  TOGGLE_NOTIFICATIONS: React.PropTypes.func
}

module.exports = connect((state) => ({
  notifications: state.interfaceStatus.notifications
}), {TOGGLE_NOTIFICATIONS})(SettingsForm)

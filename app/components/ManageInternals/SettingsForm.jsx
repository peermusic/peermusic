const React = require('react')
const ReactDOM = require('react-dom')
const { connect } = require('react-redux')
const { TOGGLE_DESKTOP_NOTIFICATIONS } = require('../../actions')

class SettingsForm extends React.Component {
  render () {
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
          <select value={this.props.desktopNotifications} onChange={() => this.props.TOGGLE_DESKTOP_NOTIFICATIONS()}>
            <option value={true}>enabled</option>
            <option value={false}>disabled</option>
          </select>
        </div>
      </form>
    )
  }
}

SettingsForm.propTypes = {
  desktopNotifications: React.PropTypes.bool,
  TOGGLE_DESKTOP_NOTIFICATIONS: React.PropTypes.func
}

module.exports = connect((state) => ({
  desktopNotifications: state.interfaceStatus.desktopNotifications
}), {TOGGLE_DESKTOP_NOTIFICATIONS})(SettingsForm)

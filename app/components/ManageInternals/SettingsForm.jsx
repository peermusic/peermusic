const React = require('react')
const { connect } = require('react-redux')
const { TOGGLE_NOTIFICATIONS, TOGGLE_THEME } = require('../../actions')

class SettingsForm extends React.Component {
  render () {
    let themes = [
      {key: 'classic', name: 'Classic'},
      {key: 'beach', name: 'Beach'},
      {key: 'cookie-dough', name: 'Cookie Dough'},
      {key: 'peaches-and-cream', name: 'Peaches and Cream'},
      {key: 'apricots', name: 'Apricots'},
      {key: 'mint', name: 'Mint'},
      {key: 'pebbles', name: 'Pebbles'},
      {key: 'faded-flamingo', name: 'Faded Flamingo'},
      {key: 'monokai', name: 'Monokai'},
      {key: 'caterpillar', name: 'Caterpillar'},
      {key: 'stormy-night', name: 'Stormy Night'},
      {key: 'lilac', name: 'Lilac'},
      {key: 'muddy-denim', name: 'Muddy Denim'},
      {key: 'latte', name: 'Latte'},
      {key: 'overcast', name: 'Overcast'}
    ]

    // We need to disable linting for this, because it whines around about value={true}
    /*eslint-disable */
    return (
      <form className='pretty-form'>
        <div>
          <label>
            Theme
          </label>
          <select value={this.props.theme} onChange={(e) => this.props.TOGGLE_THEME(e.target.value)}>
            {themes.map(theme => {
              return <option key={theme.key} value={theme.key}>{theme.name}</option>
            })}
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
  theme: React.PropTypes.string,
  notifications: React.PropTypes.bool,
  TOGGLE_NOTIFICATIONS: React.PropTypes.func,
  TOGGLE_THEME: React.PropTypes.func
}

module.exports = connect((state) => ({
  theme: state.interfaceStatus.theme,
  notifications: state.interfaceStatus.notifications
}), {TOGGLE_NOTIFICATIONS, TOGGLE_THEME})(SettingsForm)

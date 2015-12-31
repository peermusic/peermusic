const React = require('react')
const ReactDOM = require('react-dom')
const { connect } = require('react-redux')
const { ADD_SCRAPING_SERVER } = require('../../actions')

class ScrapingServerForm extends React.Component {
  onSubmit (e) {
    e.preventDefault()

    var description = ReactDOM.findDOMNode(this.refs.description)
    var serverUrl = ReactDOM.findDOMNode(this.refs.serverUrl)

    this.props.ADD_SCRAPING_SERVER(description.value, serverUrl.value)

    description.value = ''
    serverUrl.value = ''

    return false
  }

  render () {
    return (
        <form className='pretty-form' onSubmit={(e) => this.onSubmit(e)}>
          <div>
            <label>
              Description
            </label>
            <input type='text' placeholder='My local server' ref='description'/>
          </div>
          <div className='no-border'>
            <label>
              Server URL
            </label>
            <textarea placeholder='peermusic://host:port/#user-id:secret-key' ref='serverUrl'/>
          </div>

          <div className='no-border'>
            <input type='submit' value='Add new scraping server'/>
          </div>
        </form>
    )
  }
}

module.exports = connect(null, {ADD_SCRAPING_SERVER})(ScrapingServerForm)

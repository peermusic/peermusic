const React = require('react')
const ReactDOM = require('react-dom')
const { connect } = require('react-redux')
const { ADD_SCRAPING_SERVER } = require('../../actions')

class ScrapingServerForm extends React.Component {
  onSubmit (e) {
    e.preventDefault()

    var url = ReactDOM.findDOMNode(this.refs.url)
    var description = ReactDOM.findDOMNode(this.refs.description)
    var authentication = ReactDOM.findDOMNode(this.refs.authentication)

    if (url.value === '' || !url.value.match(/(https?:\/\/)(([a-zA-ZäöüÄÖÜ\d.-]+)(\/.*)?)/)) {
      window.alert('Please enter a valid URL')
      return
    }

    this.props.ADD_SCRAPING_SERVER(url.value, description.value, authentication.value)

    url.value = ''
    description.value = ''
    authentication.value = ''

    return false
  }

  render () {
    return (
        <form className='pretty-form' onSubmit={(e) => this.onSubmit(e)}>
          <div>
            <label>
              Server URL
            </label>
            <input type='url' placeholder='http://localhost:8080' ref='url' required/>
          </div>
          <div>
            <label>
              Description
            </label>
            <input type='text' placeholder='My local server' ref='description'/>
          </div>
          <div className='no-border'>
            <label>
              Authentication Token
            </label>
            <textarea placeholder='6DQp1a3U3SlVYY1ZwdDA...4REZTY2VDRVg5dW5DdU1j=' ref='authentication'/>
          </div>

          <div className='no-border'>
            <input type='submit' value='Add new scraping server'/>
          </div>
        </form>
    )
  }
}

module.exports = connect(null, {ADD_SCRAPING_SERVER})(ScrapingServerForm)

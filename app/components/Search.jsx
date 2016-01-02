const React = require('react')
const ReactDOM = require('react-dom')
const { connect } = require('react-redux')
const { pushPath } = require('redux-simple-router')

class Search extends React.Component {
  onSubmit (e) {
    e.preventDefault()

    var search = ReactDOM.findDOMNode(this.refs.search)

    if (search.value.length > 0) {
      this.props.pushPath('/search?query=' + search.value)
    }

    search.value = ''

    return false
  }

  render () {
    return (
        <form className='search' onSubmit={(e) => this.onSubmit(e)}>
          <input type='text' placeholder={this.props.placeholder} ref='search'/>
        </form>
    )
  }
}

module.exports = connect(
    null,
    {pushPath}
)(Search)

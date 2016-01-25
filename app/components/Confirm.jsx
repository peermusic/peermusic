const React = require('react')
const ReactDOM = require('react-dom')

class Confirm extends React.Component {
  render () {
    return (
      <div className='page-wrapper'>
        <div className='popover content'>
          <div>
            <h3 className='white' dangerouslySetInnerHTML={this.props.message}></h3>
            <div>
              <button onClick={() => this.props.resolve(true)}>{this.props.yesButton}</button>
              {this.props.noButton && <button onClick={() => this.props.resolve(false)}>{this.props.noButton}</button>}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Confirm.propTypes = {
  message: React.PropTypes.object,
  yesButton: React.PropTypes.string,
  noButton: React.PropTypes.string,
  resolve: React.PropTypes.func
}

function confirm (message, yesButton, noButton) {
  return new Promise((resolve) => {
    message = typeof message === 'object' ? message : {__html: message}
    let wrapper = document.body.appendChild(document.createElement('div'))
    let resolver = (value) => {
      ReactDOM.unmountComponentAtNode(wrapper)
      setTimeout(() => wrapper.remove(), 0)
      resolve(value)
    }
    ReactDOM.render(<Confirm message={message} yesButton={yesButton} noButton={noButton} resolve={resolver}/>, wrapper)
  })
}

module.exports = confirm

const React = require('react')
const classNames = require('classnames')
const subfoldersToo = require('subfolders-too')
const { ADD_SONG } = require('../actions')
const { connect } = require('react-redux')

class DropPageWrapper extends React.Component {
  constructor () {
    super()
    this.timeout = -1
    this.timeout_check = false
    this.state = {
      isHovering: false
    }
  }

  dragging (event) {
    this.timeout_check = true
    if (!this.state.isHovering) {
      this.setState({isHovering: true})
    }

    event.preventDefault()
    return false
  }

  stopDragging (event) {
    this.timeout_check = false
    window.clearTimeout(this.timeout)
    this.timeout = window.setTimeout(() => {
      if (!this.timeout_check) {
        this.setState({isHovering: false})
      }
    }, 100)

    event.preventDefault()
    return false
  }

  drop (event) {
    this.setState({isHovering: false})

    // Get all files from the drop event and trigger an action for each of them
    subfoldersToo(event, files => {
      files.map(file => {
        this.props.ADD_SONG(file)
      })
    })

    event.preventDefault()
    return false
  }

  render () {
    var pageWrapperClasses = classNames('page-wrapper', 'route-' + this.props.routePath, {
      'mobile-navigation': this.props.mobileNavigation,
      'mobile-content': !this.props.mobileNavigation
    })
    var dropZoneClasses = classNames('dropzone', {active: this.state.isHovering})
    var importNotification
    var playlistHint

    if (this.props.importingSongs > 0) {
      importNotification = <div className='import-notification'>
        <span>Currently importing {this.props.importingSongs} songs...</span></div>
    }

    if (this.props.showPlaylistHint > 0) {
      playlistHint = <div className='import-notification'>
        <span>The song got added to your playing next queue.</span></div>
    }

    return (
        <div className={pageWrapperClasses}
             onDragStart={(e) => this.dragging(e)}
             onDragOver={(e) => this.dragging(e)}
             onDragLeave={(e) => this.stopDragging(e)}
             onDrop={(e) => this.drop(e)}>
          <div className={dropZoneClasses} ref='dropzone'></div>
          {importNotification}
          {playlistHint}
          {this.props.children}
        </div>
    )
  }
}

DropPageWrapper.propTypes = {
  ADD_SONG: React.PropTypes.func,
  children: React.PropTypes.node,
  mobileNavigation: React.PropTypes.bool,
  routePath: React.PropTypes.string,
  importingSongs: React.PropTypes.number,
  showPlaylistHint: React.PropTypes.bool
}

module.exports = connect(
    (state) => ({
      mobileNavigation: state.interfaceStatus.mobileNavigation,
      importingSongs: state.interfaceStatus.importingSongs,
      showPlaylistHint: state.interfaceStatus.showPlaylistHint,
      routePath: state.routing.path.replace(/\//g, '')
    }),
    {ADD_SONG}
)(DropPageWrapper)

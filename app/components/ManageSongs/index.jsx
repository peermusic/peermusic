const React = require('react')
const { connect } = require('react-redux')
const { ADD_SONG, CLEAR_DATA } = require('../../actions')
const ManageSongsTable = require('./ManageSongsTable.jsx')

class ManageSongs extends React.Component {

  componentDidMount () {
    this.refs.directoryImport.setAttribute('webkitdirectory', '')
    this.refs.directoryImport.setAttribute('directory', '')
  }

  importFiles (files) {
    // Trigger an action for each of the imported files
    for (var i = 0; i !== files.length; i++) {
      this.props.ADD_SONG(files[i])
    }
  }

  clearData () {
    if (!window.confirm('Are you sure you want to clear all application data?')) {
      return false
    }

    this.props.CLEAR_DATA()
  }

  render () {
    const { songs } = this.props

    return (
        <div>
          <h2>Manage songs</h2>
          <p>You can import files by just drag & dropping them onto the application or using the buttons below.</p>
          <div className='import-form'>
            <label className='fake-file-input margin-right'>
              Import files
              <input type='file' multiple onChange={(e) => this.importFiles(e.target.files)}/>
            </label>

            <label className='fake-file-input margin-right'>
              Import directory
              <input type='file' ref='directoryImport' onChange={(e) => this.importFiles(e.target.files)}/>
            </label>

            <input className='right transparent-button' type='button' value='Reset application'
                   onClick={() => this.clearData()}/>
          </div>

          <ManageSongsTable songs={songs}/>
        </div>
    )
  }
}

module.exports = connect(
    (state) => ({
      songs: state.songs
    }),
    {ADD_SONG, CLEAR_DATA}
)(ManageSongs)

const React = require('react')
const { connect } = require('react-redux')
const { ADD_SONG, CLEAR_DATA } = require('../../actions')
const SongTable = require('../Songs/SongTable.jsx')
const InitialImportMessage = require('../InitialImportMessage.jsx')

class OwnSongs extends React.Component {

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
    const songs = this.props.songs.filter(x => x.local)
    const options = {play: false, queue: false, favorite: false, remove: true, availability: false}
    const songDisplay = songs.length > 0 ? <SongTable songs={songs} options={options}/> : <InitialImportMessage manage/>

    return (
      <div>
        <div className='import-form'>
          <label className='fake-file-input margin-right'>
            Import files
            <input type='file' multiple onChange={(e) => this.importFiles(e.target.files)}/>
          </label>

          <label className='fake-file-input margin-right desktop-only'>
            Import directory
            <input type='file' ref='directoryImport' onChange={(e) => this.importFiles(e.target.files)}/>
          </label>

          <input className='right transparent-button' type='button' value='Reset application'
                 onClick={() => this.clearData()}/>
        </div>

        {songDisplay}
      </div>
    )
  }
}

OwnSongs.propTypes = {
  ADD_SONG: React.PropTypes.func,
  CLEAR_DATA: React.PropTypes.func,
  songs: React.PropTypes.array
}

module.exports = connect(
    (state) => ({
      songs: state.songs
    }),
    {ADD_SONG, CLEAR_DATA}
)(OwnSongs)

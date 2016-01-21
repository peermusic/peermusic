const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('../Songs/SongTable.jsx')
const MobilePageHeader = require('../MobilePageHeader.jsx')

class ManageDownloads extends React.Component {
  render () {
    const { songs } = this.props
    const options = {activeRow: false, play: false, queue: false, favorite: false, desaturateRemote: false, removeDownload: true}
    const songDisplay = songs.length > 0 ? <SongTable songs={songs} options={options}/> : <h3>You are currently not downloading anything.</h3>

    return (
        <div>
          <MobilePageHeader title='Manage downloads'/>
          <div className='page-heading'>
            <h2>Manage downloads</h2>
          </div>
          <div className='actual-page-content'>
            {songDisplay}
          </div>
        </div>
    )
  }
}

ManageDownloads.propTypes = {
  songs: React.PropTypes.array
}

function mapStateToProps (state) {
  var songs = [...state.songs.filter((song) => song.downloading)]
  return {songs: songs}
}

module.exports = connect(mapStateToProps)(ManageDownloads)

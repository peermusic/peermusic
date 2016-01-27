const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('../Songs/SongTable.jsx')
const { Link } = require('react-router')
const { PLAYBACK_SONG, DOWNLOAD_ALBUM } = require('../../actions')
const MobilePageHeader = require('../MobilePageHeader.jsx')

function AlbumDetail ({ album, artist, songs, totalSongs, currentCover, artistPage, PLAYBACK_SONG, DOWNLOAD_ALBUM }) {
  if (songs.length > 0) {
    var albumDuration = Math.round(songs.map(x => x.duration).reduce((a, b) => a + b) / 60)
    var year = songs.map(s => s.year).filter(s => s)[0]
  }

  const linkTargetAlbum = '/albums?album=' + encodeURIComponent(album)
  const linkTargetArtist = '/artists?artist=' + artist
  const wrapperClass = artistPage ? '' : 'actual-page-content'

  return (
      <div>
        {!artistPage &&
          <MobilePageHeader title={album}/>
        }
        {artistPage &&
          <div className='album-table artist-detail mobile-only'>
            <Link to={linkTargetAlbum} className='album'>
              <img className='cover-art' src={currentCover}/>
              <div className='text'>
                <span className='album'>{album}</span>
                <span className='artist'>
                  {year &&
                  <span>
                      {year}
                    <span className='padder'>&mdash;</span>
                    </span>
                  }
                  {songs.length} {songs.length > 1 ? 'songs' : 'song'}
                  <span className='padder'>&mdash;</span>
                  {albumDuration} minutes
                </span>
              </div>
            </Link>
          </div>
        }
        <div className='page-heading album-header'>
          <img className='cover-art' src={currentCover}/>
          <div>
            <h2>{artistPage ? <Link to={linkTargetAlbum}>{album}</Link> : album}</h2>
            <h3>
              {!artistPage && artist &&
                <span>
                  <Link to={linkTargetArtist} className='artist'>{artist}</Link>
                  <span className='padder'>&mdash;</span>
                </span>
              }
              {year &&
                <span>
                  {year}
                  <span className='padder'>&mdash;</span>
                </span>
              }
              {songs.length} {songs.length > 1 ? 'songs' : 'song'}
              <span className='padder'>&mdash;</span>
              {albumDuration} minutes
            </h3>
            {!artistPage &&
              <button className='play-all'
                      onClick={() => PLAYBACK_SONG(songs, 0)}>
                <i className='fa fa-play'/> Play all
              </button>
            }
            {!artistPage && songs.filter(x => !x.local).length > 0 &&
              <button className='download-all'
                      onClick={() => DOWNLOAD_ALBUM(songs)}>
                <i className='fa fa-arrow-down'/> Download all
              </button>
            }
          </div>
        </div>
        <div className={wrapperClass}>
          <SongTable songs={songs} totalSongs={totalSongs || songs} options={{track: true, artist: !artist, album: false}}/>
        </div>
      </div>
  )
}

function mapStateToProps (state, ownProps) {
  var songs = !ownProps.artistPage
    ? state.songs.filter(x => x.album === ownProps.album)
    : state.songs.filter(x => x.album === ownProps.album && x.artist === ownProps.artist)

  // Order the songs by track
  songs.sort((a, b) => (a.track > b.track) ? 1 : ((b.track > a.track) ? -1 : 0))

  // Only display the artist if the album is by one artist only
  let artists = songs.map(x => x.artist).filter((v, i, s) => s.indexOf(v) === i)

  // Grab the cover off the first track
  const currentCover = state.covers.filter(c => c.id === songs[0].coverId)[0]

  return {
    songs,
    artist: artists.length > 1 ? false : artists[0],
    currentCover: currentCover ? currentCover.url : ''
  }
}

module.exports = connect(mapStateToProps, {PLAYBACK_SONG, DOWNLOAD_ALBUM})(AlbumDetail)

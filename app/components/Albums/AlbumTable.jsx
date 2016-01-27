const React = require('react')
const { Link } = require('react-router')

function AlbumTable ({ albums }) {
  return (
      <div className='album-table'>
        {albums.map((album, i) => {
          var linkTargetAlbum = '/albums?album=' + encodeURIComponent(album.album)

          return (
              <div key={i} className='album'>
                <div className='desktop-only'>
                  <Link to={linkTargetAlbum}><img className='cover-art' src={album.coverUrl}/></Link>
                  <div className='text'>
                    <Link to={linkTargetAlbum} className='album'>{album.album}</Link>
                    <span className='songs'>{album.songs} {album.songs > 1 ? 'songs' : 'song'}</span>
                  </div>
                </div>
                <Link to={linkTargetAlbum} className='mobile-only'>
                    <img className='cover-art' src={album.coverUrl}/>
                    <div className='text'>
                      <span className='album'>{album.album}</span>
                      <span className='songs'>{album.songs} {album.songs > 1 ? 'songs' : 'song'}</span>
                    </div>
                </Link>
              </div>
          )
        })}
      </div>
  )
}

module.exports = AlbumTable

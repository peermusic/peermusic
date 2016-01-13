const React = require('react')
const { Link } = require('react-router')

function AlbumTable ({ albums }) {
  return (
      <div className='album-table'>
        {albums.map((album, i) => {
          var linkTargetAlbum = '/albums?album=' + album.album + '&artist=' + album.artist
          var linkTargetArtist = '/artists?artist=' + album.artist

          return (
              <div key={i} className='album'>
                <div className='desktop-only'>
                  <Link to={linkTargetAlbum}><img src={album.coverUrl}/></Link>
                  <div className='text'>
                    <Link to={linkTargetAlbum} className='album'>{album.album}</Link>
                    <Link to={linkTargetArtist} className='artist'>{album.artist}</Link>
                  </div>
                </div>
                <Link to={linkTargetAlbum} className='mobile-only'>
                    <img src={album.coverUrl}/>
                    <div className='text'>
                      <span className='album'>{album.album}</span>
                      <span className='artist'>{album.artist}</span>
                    </div>
                </Link>
              </div>
          )
        })}
      </div>
  )
}

module.exports = AlbumTable

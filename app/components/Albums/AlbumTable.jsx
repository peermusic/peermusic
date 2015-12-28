const React = require('react')
const { Link } = require('react-router')

function AlbumTable ({ albums }) {
  return (
      <div className='album-table'>
        {albums.map((album, i) => {
          var linkTargetAlbum = '/albums?album=' + album.album + '&artist=' + album.artist

          return (
              <div key={i} className='album'>
                <Link to={linkTargetAlbum}><img src={album.coverUrl}/></Link>
                <div className='text'>
                  <Link to={linkTargetAlbum} className='album'>{album.album}</Link>
                  <span className='artist'>{album.artist}</span>
                </div>
              </div>
          )
        })}
      </div>
  )
}

module.exports = AlbumTable

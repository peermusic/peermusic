const React = require('react')
const { Link } = require('react-router')

function ArtistTable ({ artists }) {
  return (
      <div className='album-table'>
        {artists.map((artist, i) => {
          var linkTargetAlbum = '/artists?artist=' + artist.artist

          return (
              <div key={i} className='album'>
                <Link to={linkTargetAlbum}><img src={artist.coverUrl}/></Link>
                <div className='text'>
                  <Link to={linkTargetAlbum} className='album'>{artist.artist}</Link>
                  <span className='artist'>{artist.songs} {artist.songs.length > 1 ? 'songs' : 'song'}</span>
                </div>
              </div>
          )
        })}
      </div>
  )
}

module.exports = ArtistTable

const React = require('react')
const { Link } = require('react-router')

function ArtistTable ({ artists }) {
  return (
      <div className='album-table'>
        {artists.map((artist, i) => {
          var linkTargetArtist = '/artists?artist=' + artist.artist

          return (
              <div key={i} className='album'>
                <div className='desktop-only'>
                  <Link to={linkTargetArtist}><img src={artist.coverUrl}/></Link>
                  <div className='text'>
                    <Link to={linkTargetArtist} className='album'>{artist.artist}</Link>
                    <span className='artist'>{artist.songs} {artist.songs > 1 ? 'songs' : 'song'}</span>
                  </div>
                </div>
                <Link to={linkTargetArtist} className='mobile-only'>
                    <img src={artist.coverUrl}/>
                    <div className='text'>
                      <span className='album'>{artist.artist}</span>
                      <span className='artist'>{artist.songs} {artist.songs > 1 ? 'songs' : 'song'}</span>
                    </div>
                </Link>
              </div>
          )
        })}
      </div>
  )
}

module.exports = ArtistTable

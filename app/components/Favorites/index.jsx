const React = require('react')
const { connect } = require('react-redux')
const SongTable = require('../Songs/SongTable.jsx')

function Favorites ({ songs }) {
  var favoritesDisplay = songs.length === 0
      ? <h3>You didn't add any favorites yet!<br/>Click the heart next to any song for them to appear here.</h3>
      : <SongTable songs={songs}/>

  return (
      <div>
        <h2>Favorites</h2>
        {favoritesDisplay}
      </div>
  )
}

module.exports = connect(
    (state) => ({
      songs: state.songs.filter(s => s.favorite)
    })
)(Favorites)

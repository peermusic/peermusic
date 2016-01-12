var rusha = new (require('rusha'))()
var metadataReader = require('music-metadata')
var fs = require('file-system')(['', 'audio/mp3', 'audio/wav', 'audio/ogg'])
var coversActions = require('./covers.js')

var actions = {

  // Add a file as a song. This hashes the file, adds it to the filesystem,
  // gets the metadata and the duration and dispatches the result metadata.
  // To add multiple files just dispatch this action multiple times.
  ADD_SONG: (file) => {
    return (dispatch, getState) => {
      // Extract the file ending
      var file_ending = 'mp3'

      if (file.name.match(/^.*(\.[A-Za-z0-9]{3})$/)) {
        file_ending = file.name.replace(/^.*(\.[A-Za-z0-9]{3})$/, '$1')
      }

      // Read the file as an data url
      var reader = new window.FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = function () {
        // Hash the file contents and set the filename based on that
        var hash = rusha.digestFromString(this.result)
        var hashName = hash + file_ending

        // Get the metadata off the file
        metadataReader(file, meta => {
          // Add the song to the file system
          fs.add({filename: hashName, file: file}, (err) => {
            if (err) throw new Error('Error adding file: ' + err)

            // Read the file as an url from the filesystem
            fs.get(hashName, (err, url) => {
              if (err) throw new Error('Error getting file: ' + err)

              // Create an audio element to check on the duration
              var audio = document.createElement('audio')
              audio.src = url
              audio.addEventListener('durationchange', () => {
                var duration = audio.duration

                // Dispatch an action to update the view and save
                // the song data in local storage
                var song = {
                  id: hash,
                  filename: url,
                  ...meta,
                  addedAt: (new Date()).toString(),
                  duration: duration,
                  favorited: false,
                  coverId: getCoverId(meta),
                  availability: 0,
                  hashName: hashName,
                  originalFilename: file.name
                }

                // Dispatch an action to get the cover from the scraping server
                coversActions.GET_COVER(song.album, song.artist, song.coverId)(dispatch, getState)

                dispatch({
                  type: 'ADD_SONG',
                  song: song
                })
              })
            })
          })
        })
      }
    }
  },

  // Remove a song
  REMOVE_SONG: (id) => {
    return (dispatch, getState) => {
      var state = getState()
      const filename = state.songs.filter(x => x.id === id)[0].hashName
      fs.delete(filename, (err) => {
        if (err) throw new Error('Error removing song: ' + err)
        dispatch({
          type: 'REMOVE_SONG',
          id
        })
      })
    }
  },

  // Toggle the favorite status of a song
  TOGGLE_SONG_FAVORITE: (id) => {
    return {
      type: 'TOGGLE_SONG_FAVORITE',
      id
    }
  },

  // Remove all songs
  CLEAR_DATA: () => {
    return (dispatch) => {
      fs.clear((err) => {
        if (err) throw new Error('Error clearing filesystem: ' + err)
        dispatch({
          type: 'CLEAR_DATA'
        })
      })
    }
  }

}

// Get the cover id from metadata
function getCoverId (meta) {
  const cleanup = s => (s || '').toLowerCase().replace(/[^a-zA-Z0-9]/g, '')
  return rusha.digestFromString(cleanup(meta.album) + cleanup(meta.artist))
}

module.exports = actions

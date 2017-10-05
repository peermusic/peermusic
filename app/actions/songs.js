var createTorrent = require('create-torrent')
var rusha = new (require('rusha'))()
var metadataReader = require('music-metadata')
var fs = require('file-system')(['', 'audio/mp3'])
var coversActions = require('./covers.js')

// fix rusha ".isBuffer is not a function" error
global.Buffer = require('buffer').Buffer

var queue = []
var working = false

function workQueue (dispatch, getState) {
  if (queue.length === 0) {
    if (getState().sync.sharingLevel === 'EVERYONE') {
      require('./torrent').SEED_TORRENTS()(dispatch, getState)
    }
    working = false
    return
  }

  working = true
  var file = queue.shift()
  actions._ADD_SONG(file)(dispatch, getState)
}

var actions = {
  // Add a file as a song. This hashes the file, adds it to the filesystem,
  // gets the metadata and the duration and dispatches the result metadata.
  // To add multiple files just dispatch this action multiple times.
  ADD_SONG: (file) => {
    return (dispatch, getState) => {
      // Update the display state to include the import progress
      dispatch({type: 'INCREMENT_IMPORTING_SONGS'})

      queue.push(file)

      if (!working) workQueue(dispatch, getState)
    }
  },

  _ADD_SONG: (file) => {
    return (dispatch, getState) => {
      // Extract the file ending
      var file_ending = file.name.match(/^.*\..*$/)
        ? file.name.replace(/^.*\.(.*)$/, '$1')
        : 'mp3'

      if (file_ending !== 'mp3') {
        dispatch({type: 'DECREMENT_IMPORTING_SONGS'})
        console.log('Skipping non-mp3 file', file.name)
        workQueue(dispatch, getState)
        return
      }

      // Read the file as an data url
      var reader = new window.FileReader()
      reader.readAsArrayBuffer(file)
      reader.onerror = function (err) {
        dispatch({type: 'DECREMENT_IMPORTING_SONGS'})
        workQueue(dispatch, getState)
        throw new Error('Error reading file: ' + err)
      }

      reader.onloadend = function () {
        var arrayBuffer = this.result

        // Hash the file contents and set the filename based on that
        var hash = rusha.digestFromArrayBuffer(arrayBuffer)
        var hashName = hash + file_ending

        createTorrent(file, {
          name: hashName // to always generate the same torrent regardless of naming
        }, (err, torrent) => {
          if (err) {
            dispatch({type: 'DECREMENT_IMPORTING_SONGS'})
            workQueue(dispatch, getState)
            throw new Error('Error creating torrent file: ' + err)
          }

          // Get the metadata off the file
          metadataReader(file, meta => {
            // Add the song to the file system
            fs.add({filename: hashName, file: file}, (err) => {
              if (err) {
                dispatch({type: 'DECREMENT_IMPORTING_SONGS'})
                workQueue(dispatch, getState)
                throw new Error('Error adding file: ' + err)
              }

              // Read the file as an url from the filesystem
              fs.get(hashName, (err, url) => {
                if (err) {
                  dispatch({type: 'DECREMENT_IMPORTING_SONGS'})
                  workQueue(dispatch, getState)
                  throw new Error('Error getting file: ' + err)
                }

                // Create an audio element to check on the duration
                var audio = document.createElement('audio')
                audio.src = url
                audio.addEventListener('durationchange', () => {
                  var duration = audio.duration
                  let favorites = getState().favorites.map(x => x.id)

                  // Dispatch an action to update the view and save
                  // the song data in local storage
                  var song = {
                    id: hash,
                    filename: url,
                    ...meta,
                    addedAt: (new Date()).toString(),
                    local: true,
                    duration: duration,
                    favorite: favorites.indexOf(hash) !== -1,
                    coverId: getCoverId(meta),
                    availability: 0,
                    hashName: hashName,
                    originalFilename: file.name,
                    torrent
                  }

                  // Dispatch an action to get the cover from the scraping server
                  coversActions.GET_COVER(song.album, song.artist, song.coverId)(dispatch, getState)

                  dispatch({type: 'DECREMENT_IMPORTING_SONGS'})
                  dispatch({
                    type: 'ADD_SONG',
                    song: song
                  })

                  window.setTimeout(function () {
                    workQueue(dispatch, getState)
                  }, 100)
                })
              })
            })
          })
        })
      }
    }
  },

  // Reset the counter for importing songs at application start
  RESET_IMPORTING_SONGS: () => ({
    type: 'RESET_IMPORTING_SONGS'
  }),

  // Remove a song
  REMOVE_SONG: (id) => {
    return (dispatch, getState) => {
      var state = getState()
      const filename = state.songs.filter(x => x.id === id)[0].hashName
      fs.delete(filename, (err) => {
        if (err) throw new Error('Error removing song: ' + err)

        // If we still hold providers for this, just set the song on "local",
        // else it was a song that only we had, so remove it completely
        if (state.sync.providers[id] && state.sync.providers[id].length > 0) {
          dispatch({type: 'TOGGLE_SONG_LOCAL', id})
        } else {
          dispatch({type: 'REMOVE_SONG', id})
        }
      })
    }
  },

  // Toggle the favorite status of a song
  TOGGLE_SONG_FAVORITE: (id) => {
    return (dispatch, getState) => {
      // Hold the song in the state as well, so we can persist it even after
      // the user deletes the song or a remote song becomes unavailable
      const song = getState().songs.find(x => x.id === id)
      if (song && !song.favorite) {
        dispatch({type: 'FAVORITE_SONG', song})
      } else {
        dispatch({type: 'REMOVE_FAVORITE', id})
      }

      // Toggle the favorite status for the songs object
      dispatch({type: 'TOGGLE_SONG_FAVORITE', id})
    }
  },

  // Remove all songs
  CLEAR_DATA: () => {
    // Clear the filesystem
    fs.clear((err) => {
      if (err) throw new Error('Error clearing filesystem: ' + err)

      // Remove the state from local storage
      window.localStorage.removeItem('peermusic-storage')

      // Refresh the page
      window.location.reload()
    })
  }

}

// Get the cover id from metadata
function getCoverId (meta) {
  const cleanup = s => (s || '').toLowerCase().replace(/[^a-zA-Z0-9]/g, '')
  return rusha.digestFromString(cleanup(meta.album) + cleanup(meta.artist))
}

module.exports = actions

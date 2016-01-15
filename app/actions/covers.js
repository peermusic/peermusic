/*globals Blob */
var xhr = require('xhr')
var fs = require('file-system')(['image/jpeg', 'image/jpg'])
var messaging = require('secure-client-server-messaging')

var inflightCoverRequests = []

var actions = {

  // Get the cover to an artist and an album
  GET_COVER: (album, artist, coverId, peer_callback = false) => {
    return (dispatch, getState) => {
      // Get the current state
      const state = getState()

      // Check if we have the cover already saved
      if (state.covers.filter(s => s.id === coverId)[0]) {
        return
      }

      // Check if the request is already in flight
      if (inflightCoverRequests.indexOf(coverId) !== -1) {
        return
      }

      inflightCoverRequests.push(coverId)

      if (!peer_callback) {
        require('./sync.js').REQUEST_COVER(coverId, {album, artist})
      }

      // Check if we have scraping servers connected
      if (state.scrapingServers.length === 0) {
        return
      }

      // Call the scraping server and in the end dispatch the action
      // that saves the url to the file and the id into states.covers
      var filename = coverId + '.jpeg'
      const scrapingServer = state.scrapingServers[0]

      // Encrypt the request to the server
      var encryptedRequest = messaging.encrypt({album, artist}, scrapingServer.key)
      encryptedRequest.id = scrapingServer.id

      xhr({
        url: scrapingServer.url + 'Cover',
        method: 'POST',
        body: JSON.stringify(encryptedRequest),
        headers: {'Content-Type': 'application/json'}
      }, function (error, response, body) {
        if (error || response.statusCode !== 200) {
          inflightCoverRequests.splice(inflightCoverRequests.indexOf(coverId), 1)
          console.error('Failed getting cover art from first scraping server')
          return
        }

        const payload = messaging.decrypt(JSON.parse(body), scrapingServer.key)

        if (peer_callback) {
          peer_callback(payload)
        }

        if (!payload) {
          inflightCoverRequests.splice(inflightCoverRequests.indexOf(coverId), 1)
          console.error('Failed decrypting response from scraping server')
          return
        }

        actions.SAVE_COVER(coverId, filename, payload)(dispatch, getState)
      })
    }
  },

  // Save a cover encoded in base64 to disk
  SAVE_COVER: (coverId, filename, payload) => {
    return (dispatch) => {
      inflightCoverRequests.splice(inflightCoverRequests.indexOf(coverId), 1)
      var blob = dataURLToBlob(payload)

      // Add the song to the file system
      fs.add({filename: filename, file: blob}, (err) => {
        if (err) throw new Error('Error adding file: ' + err)

        // Read the file as an url from the filesystem
        fs.get(filename, (err, url) => {
          if (err) throw new Error('Error getting file: ' + err)
          dispatch({
            type: 'GET_COVER',
            id: coverId,
            url,
            filename
          })
        })
      })
    }
  },

  // Request covers when the application loads for all songs that we don't have covers yet
  INITIALLY_LOAD_COVERS: () => {
    return (dispatch, getState) => {
      getState().songs.map(song =>
        actions.GET_COVER(song.album, song.artist, song.coverId)(dispatch, getState)
      )
    }
  }

}

// Creates and returns a blob from a base64 data URL
// Source: https://github.com/ebidel/filer.js/blob/master/src/filer.js#L137
function dataURLToBlob (dataURL) {
  var parts = dataURL.split(';base64,')
  var contentType = parts[0].split(':')[1]
  var raw = window.atob(parts[1])
  var rawLength = raw.length

  var uInt8Array = new Uint8Array(rawLength)

  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }

  return new Blob([uInt8Array], {type: contentType})
}

module.exports = actions

var xhr = require('xhr')
var fs = require('file-system')(['image/jpeg', 'image/jpg'])

var inflightCoverRequests = []

var actions = {

  // Get the cover to an artist and an album
  GET_COVER: (album, artist, coverId) => {
    return (dispatch, getState) => {
      // Get the current state
      const state = getState()

      // Check if we have scraping servers connected
      if (state.scrapingServers.length === 0) {
        return
      }

      // Check if we have the cover already saved
      if (state.covers.filter(s => s.id === coverId)[0]) {
        return
      }

      // Check if the request is already in flight
      if (inflightCoverRequests.indexOf(coverId) !== -1) {
        return
      }

      inflightCoverRequests.push(coverId)

      // Call the scraping server and in the end dispatch the action
      // that saves the url to the file and the id into states.covers
      var filename = coverId + '.jpeg'

      xhr({
        url: state.scrapingServers[0].url + '/Cover',
        method: 'POST',
        body: JSON.stringify({payload: {album, artist}}),
        headers: {'Content-Type': 'application/json'}
      }, function (error, response, body) {
        inflightCoverRequests.splice(inflightCoverRequests.indexOf(coverId), 1)

        if (error || response.statusCode !== 200) {
          console.error('Failed getting cover art from first scraping server')
          return
        }

        body = JSON.parse(body)
        var blob = dataURLToBlob(body.response)

        // Add the song to the file system
        fs.add({filename: filename, file: blob}, (err) => {
          if (err) throw 'Error adding file: ' + err

          // Read the file as an url from the filesystem
          fs.get(filename, (err, url) => {
            if (err) throw 'Error getting file: ' + err
            dispatch({
              type: 'GET_COVER',
              id: coverId,
              url
            })
          })
        })
      })
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

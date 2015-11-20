var fs = require('../index.js')(64 * 1024 * 1024)

// Get a file from the filesystem and display it's contents
function getFile (file) {
  fs.get(file, function (content) {
    window.open(content)
  })
}

// Add a file to the filesystem
function addFiles (files) {
  fs.add(files, showFiles)
}

// Delete a file from the filesystem
function deleteFile (file) {
  fs.delete(file, function () {
    showFiles()
  })
}

// Clear the filesystem
function clearFiles () {
  fs.clear(showFiles)
}

// Show all files of the filesystem
function showFiles () {
  fs.list(function (files) {
    var fragment = document.createDocumentFragment()

    for (var i in files) {
      var file = files[i]
      var li = document.createElement('li')
      li.innerHTML = ['<a href="#" onclick="getFile(\'' + file.name + '\')">', file.name, '</a> &mdash <a href="#" onclick="deleteFile(\'' + file.name + '\')">delete</a>'].join('')
      fragment.appendChild(li)
    }

    var list = document.querySelector('#list')
    list.innerHTML = ''
    list.appendChild(fragment)
  })
}

// Handle drag & drop by adding the dropped files
function windowDrop (event) {
  // get window.event if e argument missing (in IE)
  event = event || window.event

  // stops the browser from redirecting off to the image.
  if (event.preventDefault) {
    event.preventDefault()
  }

  var files = event.dataTransfer.files

  // Check if the item is a folder
  if (files[0].type === '') {
    console.error('Folder are not supported for drag \'n\' drop yet')
    return
  }

  addFiles(files)
}

// Cancel this event
function cancel (e) {
  if (e.preventDefault) {
    e.preventDefault()
  }

  return false
}

// Event listeners -------------------------------------------------------------

window.getFile = getFile
window.deleteFile = deleteFile

window.addEventListener('load', function () {
  showFiles()

  document.querySelector('#myfile').onchange = function (e) {
    addFiles(this.files)
  }

  document.querySelector('#deleteFSContent').onclick = clearFiles
})

window.addEventListener('dragover', cancel)
window.addEventListener('dragenter', cancel)
window.addEventListener('dragleave', cancel)
window.addEventListener('dragdrop', windowDrop)
window.addEventListener('drop', windowDrop)

module.exports = Storage

// Provide a in-memory storage that persists itself through local storage
function Storage () {
  if (!(this instanceof Storage)) {
    return new Storage()
  }

  this.cache = {}
}

// Get a value from the local storage
Storage.prototype.get = function (key, default_value) {
  if (!this.cache[key]) {
    this.cache[key] = JSON.parse(window.localStorage.getItem(key)) || default_value
  }
  return this.cache[key]
}

// Save a value into local storage
Storage.prototype.set = function (key, value) {
  this.cache[key] = value
  return window.localStorage.setItem(key, JSON.stringify(value))
}

// Remove a value from local storage
Storage.prototype.remove = function (key, value) {
  delete this.cache[key]
  window.localStorage.removeItem(key)
}

const React = require('react')

function Duration ({ seconds }) {
  var formatted = format(seconds)
  return <span>{formatted}</span>
}

function format (seconds) {
  seconds = Math.floor(seconds)
  var minutes = Math.floor(seconds / 60)
  seconds = seconds - minutes * 60
  seconds = seconds < 10 ? '0' + seconds : seconds
  return minutes + ':' + seconds
}

module.exports = Duration

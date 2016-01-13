const React = require('react')

function DateFormat ({ then }) {
  var formatted = format(then)
  return <span>{formatted}</span>
}

function format (date) {
  const object = new Date(date)
  var month = object.getMonth() + 1
  var day = object.getDate()
  month = month < 10 ? '0' + month : month
  day = day < 10 ? '0' + day : day

  return object.getFullYear() + '-' + month + '-' + day
}

module.exports = DateFormat

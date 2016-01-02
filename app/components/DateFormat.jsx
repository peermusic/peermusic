const React = require('react')

function DateFormat ({ then }) {
  var formatted = format(then)
  return <span>{formatted}</span>
}

function format (date) {
  const object = new Date(date)
  return object.getFullYear() + '-' + object.getMonth() + '-' + object.getDate()
}

module.exports = DateFormat

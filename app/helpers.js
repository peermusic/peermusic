module.exports = {
  values
}

function values (object) {
  var array = []
  Object.keys(object).forEach((key) => {
    array.push(object[key])
  })
  return array
}

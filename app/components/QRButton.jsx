const React = require('react')
const qrcode = require('qr-image')
const confirm = require('./Confirm.jsx')

let qrcodes = {}

function QRButton ({ data }) {
  return <button onClick={() => showQRCode(data)}>Show QR Code</button>
}

function showQRCode (data) {
  confirm(renderQR(data), 'Okay, got it')
}

function renderQR (data) {
  if (!qrcodes[data]) {
    qrcodes[data] = {__html: qrcode.imageSync(data, {type: 'svg'})}
  }

  return qrcodes[data]
}

module.exports = QRButton

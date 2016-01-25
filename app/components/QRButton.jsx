const React = require('react')
const qrcode = require('qrcode-npm')
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
    let qr = qrcode.qrcode(10, 'M')
    qr.addData(data)
    qr.make()
    qrcodes[data] = {__html: qr.createImgTag()}
  }

  return qrcodes[data]
}

module.exports = QRButton

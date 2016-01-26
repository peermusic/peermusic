const React = require('react')
const ReactDOM = require('react-dom')
const QrCode = require('qrcode-reader')

function QRReaderPopover ({ resolver }) {
  return (
    <div className='page-wrapper'>
      <div className='popover content'>
        <div>
          <video autoPlay/>
          <br/>
          <h3>Hold a QR code for peermusic in front of your camera</h3>
          <div>
            <button onClick={() => resolver(false)}>Nevermind</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function readQRCode () {
  return new Promise((resolve) => {
    var qr = new QrCode()
    var localStream

    // Stream user media into video element
    navigator.webkitGetUserMedia(
      {audio: false, video: true},
      stream => {
        localStream = stream
        document.querySelector('video').src = window.URL.createObjectURL(stream)
      },
      error => console.log('Error getting camera', error)
    )

    // Take a snapshot every 250 milliseconds and try to decode qr codes of it
    window.setInterval(function () {
      try {
        var video = document.querySelector('video')
        var canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        var context = canvas.getContext('2d')
        context.drawImage(video, 0, 0)
        var data = context.getImageData(0, 0, video.videoWidth, video.videoHeight)
        qr.decode(data)
      } catch (e) {
      }
    }, 250)

    // Render the elements
    let wrapper = document.body.appendChild(document.createElement('div'))

    // When the qr reader calls back, check if it is a valid link
    // and if yes, stop the video track, remove our elements and resolve the promise
    let resolver = (result) => {
      localStream.getVideoTracks()[0].stop()
      ReactDOM.unmountComponentAtNode(wrapper)
      setTimeout(() => wrapper.remove(), 0)
      resolve(result)
    }

    qr.callback = result => {
      if (result.indexOf('web+peermusic') !== 0) {
        return
      }

      resolver(result)
    }

    ReactDOM.render(<QRReaderPopover resolver={resolver}/>, wrapper)
  })
}

module.exports = readQRCode

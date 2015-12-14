var storage = new (require('./modules/storage'))()
var metadata = new (require('./modules/metadata'))(storage)
var scrapingServers = new (require('./modules/scraping-servers'))(storage)
var musicPlayer = new (require('./modules/music-player'))(metadata)

// Initialize the individual modules when the page loaded
window.addEventListener('load', function () {
  scrapingServers.initialize()
  musicPlayer.initialize()
})

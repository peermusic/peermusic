var storage = new (require('in-memory-storage'))()
var metadata = new (require('./modules/metadata'))(storage)
var scrapingServers = new (require('./modules/scraping-servers'))(storage)
var musicPlayer = new (require('./modules/music-player'))(metadata, scrapingServers)

// Initialize the individual modules when the page loaded
window.addEventListener('load', function () {
  scrapingServers.initialize()
  musicPlayer.initialize()
})

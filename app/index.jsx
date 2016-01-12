const React = require('react')
const ReactDOM = require('react-dom')
const { createStore, applyMiddleware, combineReducers } = require('redux')
const { Provider } = require('react-redux')
const { Router, Route, IndexRedirect } = require('react-router')
const createHistory = require('history/lib/createHashHistory')
const { syncReduxAndRouter } = require('redux-simple-router')
const thunk = require('redux-thunk')
// const logger = require('redux-logger')()
const reduxStorage = require('redux-storage')
const storageEngine = require('redux-storage/engines/localStorage').default('peermusic-storage')
const { PLAYER_SYNCHRONIZE, INSTANCES_CONNECT } = require('./actions')

// Create our reducer composition via the reducers registered in reducers/index.js
const reducer = reduxStorage.reducer(combineReducers(require('./reducers')))

// Create our storage middleware with blacklisted actions that don't trigger storage events
// TODO write a debounce decorator with a max wait time
const storage = reduxStorage.createMiddleware(storageEngine, ['@@router/INIT_PATH'])

// Everything is prepared, combine the middleware and the reducer into a store
const store = applyMiddleware(storage, thunk)(createStore)(reducer)

// Load the state we saved before when the application loads
// and sync that state into the player engine
const load = reduxStorage.createLoader(storageEngine)
load(store).then(() => {
  PLAYER_SYNCHRONIZE()(store.dispatch, store.getState)
  INSTANCES_CONNECT()(store.dispatch, store.getState)
})

// Setup redux-router with history and sync the state to the url
const history = createHistory({queryKey: false})
syncReduxAndRouter(history, store)

// Require our application components
const App = require('./components/App.jsx')
const Songs = require('./components/Songs/index.jsx')
const Albums = require('./components/Albums/index.jsx')
const Artists = require('./components/Artists/index.jsx')
const Favorites = require('./components/Favorites/index.jsx')
const PlayingNext = require('./components/PlayingNext/index.jsx')
const History = require('./components/History/index.jsx')
const ManageFriends = require('./components/ManageFriends/index.jsx')
const ManageSongs = require('./components/ManageSongs/index.jsx')
const ManageServers = require('./components/ManageServers/index.jsx')
const ManageDownloads = require('./components/ManageDownloads/index.jsx')
const Search = require('./components/Search/index.jsx')
const CurrentlyPlaying = require('./components/CurrentlyPlaying/index.jsx')

// Render our application
ReactDOM.render(
  <Provider store={store}>
      <Router history={history}>
        <Route path='/' component={App}>
          <IndexRedirect to='songs'/>
          <Route path='currently-playing' component={CurrentlyPlaying}/>
          <Route path='songs' component={Songs}/>
          <Route path='albums' component={Albums}/>
          <Route path='artists' component={Artists}/>
          <Route path='favorites' component={Favorites}/>
          <Route path='playing-next' component={PlayingNext}/>
          <Route path='history' component={History}/>
          <Route path='manage-friends' component={ManageFriends}/>
          <Route path='manage-songs' component={ManageSongs}/>
          <Route path='manage-servers' component={ManageServers}/>
          <Route path='manage-downloads' component={ManageDownloads}/>
          <Route path='search' component={Search}/>
        </Route>
      </Router>
    </Provider>,
  document.getElementById('render')
)

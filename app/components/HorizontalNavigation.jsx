const React = require('react')
const { connect } = require('react-redux')
const { Link } = require('react-router')

function HorizontalNavigation ({ views, currentPath, content }) {
  return (
      <div className='horizontal-navigation-wrapper'>
        <div className='horizontal-navigation'>
          {views.map(view => {
            const className = view.path === currentPath ? 'active' : ''
            return <Link key={view.path} to={view.path} className={className}>{view.name}</Link>
          })}
        </div>
        <div className='actual-page-content'>
          {content}
        </div>
      </div>
  )
}

module.exports = connect(
    (state, ownProps) => {
      const currentPath = state.routing.path.replace(/^(.*)\?.*$/, '$1')
      return {
        currentPath,
        content: ownProps.views.filter(x => x.path === currentPath)[0].content
      }
    }
)(HorizontalNavigation)

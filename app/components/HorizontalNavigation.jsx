const React = require('react')
const { connect } = require('react-redux')
const { TOGGLE_HORIZONTAL_NAVIGATION } = require('../actions')

function HorizontalNavigation ({ views, identifier, activeIndex, content, TOGGLE_HORIZONTAL_NAVIGATION }) {
  return (
      <div className='horizontal-navigation-wrapper'>
        <div className='horizontal-navigation'>
          {views.map((view, i) => {
            const className = i === activeIndex ? 'active' : ''
            return <a key={i} className={className}
                      onClick={() => TOGGLE_HORIZONTAL_NAVIGATION(identifier, i)}>{view.name}</a>
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
      const activeIndex = state.interfaceStatus.horizontalNavigations[ownProps.identifier] || 0
      return {
        activeIndex,
        content: activeIndex === undefined ? '' : ownProps.views[activeIndex].content
      }
    },
    {TOGGLE_HORIZONTAL_NAVIGATION}
)(HorizontalNavigation)

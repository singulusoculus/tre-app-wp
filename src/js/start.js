import { setCurrentStep } from './step'
import { renderPreviousSession, showRankSection, showListNav, hideListNav } from './views'
import { initRanking } from './rank'
import { setCategory } from './category'

setCurrentStep('Start')

// Check for Previous Session and display option if available
renderPreviousSession()

const initFanFavorite = () => {
  initRanking(fanFavorite, 2)
  showRankSection()
}

const handleCategoryChange = () => {
  const category = parseInt(document.querySelector('#list-category-select').value)
  setCategory(category)

  if (category !== 0) {
    showListNav()
    const tip = M.Tooltip.getInstance(document.querySelector('#list-tab-link'))
    tip.open()
  } else {
    hideListNav()
  }
}

// Temp Fan Favorite
const fanFavorite = [{
  name: 'The Phantom Menace',
  image: '',
  source: 'fanFav'
},
{
  name: 'Attack of the Clones',
  image: '',
  source: 'fanFav'
},
{
  name: 'Revenge of the Sith',
  image: '',
  source: 'fanFav'
},
{
  name: 'A New Hope',
  image: '',
  source: 'fanFav'
},
{
  name: 'The Empire Strikes Back',
  image: '',
  source: 'fanFav'
},
{
  name: 'Return of the Jedi',
  image: '',
  source: 'fanFav'
}]

export { initFanFavorite, handleCategoryChange }

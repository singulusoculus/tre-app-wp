import { initRanking } from './rank'
import { setCategory } from './category'

const initFanFavorite = () => {
  initRanking(fanFavorite, 2)
}

const handleCategoryChange = () => {
  const category = parseInt(document.querySelector('#list-category-select').value)
  setCategory(category)
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

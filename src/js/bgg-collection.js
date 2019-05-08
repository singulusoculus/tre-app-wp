import { getBGGData } from './requests-bgg'
import { renderBGGCollection } from './views'
import { addListItems, sortListData } from './list'
import { getBGGFilters } from './filters'

let bggCollectionData = []

const getBGGCollectionData = () => bggCollectionData

const setBGGCollectionData = (data) => {
  bggCollectionData = data
}

const saveBGGCollection = () => {
  const bggUsername = document.querySelector('#bgg-username').value

  const obj = {
    bggUsername,
    bggCollectionData
  }
  localStorage.setItem('bggCollection', JSON.stringify(obj))
}

const handleBGGCollection = () => {
  bggCollectionData = getBGGData()

  showBGGCollectionSection()

  renderBGGCollection()
}

const showBGGCollectionSection = () => {
  document.querySelector('.bgg-list').classList.remove('hide')
  document.querySelector('.bgg-username-submit').classList.add('hide')
  const bggUsernameSubmittedEl = document.querySelector('.bgg-username-submitted')
  const headingEl = document.querySelector('.bgg-username-header')
  const bggUsername = document.querySelector('#bgg-username').value
  headingEl.textContent = `BGG Collection: ${bggUsername}`

  bggUsernameSubmittedEl.classList.remove('hide')
}

const handleCollectionChangeClick = () => {
  document.querySelector('.bgg-list').classList.add('hide')
  document.querySelector('.bgg-username-submit').classList.remove('hide')
  document.querySelector('.bgg-username-submitted').classList.add('hide')
}

const addBGGItemToList = (id) => {
  const itemID = bggCollectionData.findIndex((item) => item.id === id)
  const item = bggCollectionData[itemID]
  item.addedToList = true

  addListItems([item])
  saveBGGCollection()
}

const filterBGGCollection = () => {
  const filters = getBGGFilters()

  let filteredList = []

  // gets only true filters
  const listTypeFilters = Object.keys(filters).filter((key) => filters[key] === true)

  // filter the collection data for the filters marked as true
  listTypeFilters.forEach((filter) => {
    const list = bggCollectionData.filter((item) => item[filter])
    list.forEach((item) => {
      filteredList.push(item)
    })
  })

  // Filter duplicates out
  filteredList = filteredList.filter((list, index, self) => self.findIndex(l => l.id === list.id) === index)

  // Filter for Personal Rating
  filteredList = filteredList.filter((item) => item.rating >= filters.rating)

  // Filter out already added games
  filteredList = filteredList.filter((item) => item.addedToList === false)

  // Sort alphabetical
  filteredList = sortListData(filteredList, 'alphabetical')

  return filteredList
}

const handleAddSelectedBGG = () => {
  const filteredList = filterBGGCollection()

  filteredList.forEach((item) => {
    item.addedToList = true
  })

  addListItems(filteredList)
  renderBGGCollection()
}

export { handleBGGCollection, getBGGCollectionData, addBGGItemToList, filterBGGCollection, handleAddSelectedBGG, handleCollectionChangeClick, saveBGGCollection, setBGGCollectionData, showBGGCollectionSection }

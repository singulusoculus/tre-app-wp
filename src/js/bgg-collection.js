import { getBGGData } from './requests-bgg'
import { renderBGGCollection } from './views'
import { addListItems, sortListData } from './list'
import { getBGGFilters } from './filters'

let bggCollectionData = []

const getBGGCollectionData = () => bggCollectionData

const handleBGGCollection = () => {
  bggCollectionData = getBGGData()

  renderBGGCollection()
}

const addBGGItemToList = (id) => {
  const itemID = bggCollectionData.findIndex((item) => item.id === id)
  const item = bggCollectionData[itemID]
  item.addedToList = true

  addListItems([item])
}

const filterBGGCollection = () => {
  const data = getBGGCollectionData()
  const filters = getBGGFilters()

  let filteredList = []

  // gets only true filters
  const listTypeFilters = Object.keys(filters).filter((key) => filters[key] === true)

  // filter the collection data for the filters marked as true
  listTypeFilters.forEach((filter) => {
    const list = data.filter((item) => item[filter])
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

export { handleBGGCollection, getBGGCollectionData, addBGGItemToList, filterBGGCollection, handleAddSelectedBGG }

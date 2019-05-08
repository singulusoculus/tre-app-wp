import uuidv4 from 'uuid'
import { renderListData, showListSection, enableStepTab, disableStepTab, enableNextButton, disableListSave, enableListSave, custConfirm, renderBGGCollection } from './views'
import { saveData } from './functions'
import { setCategory } from './category'
import { getCurrentStep, setCurrentStep } from './step'
import { getBGGCollectionData, setBGGCollectionData, showBGGCollectionSection } from './bgg-collection'
import { updateBGGFilters } from './filters'

let listData = []

const getListData = () => listData

const initPrevList = (category, data) => {
  listData = data
  setCategory(category)
  setCurrentStep('List')

  // Set the catetgory
  document.querySelector('#list-category-select').value = category
  M.FormSelect.init(document.querySelector('#list-category-select'))

  saveData(listData)
  renderListData()

  // Load previous BGG data if exists
  const bggData = JSON.parse(localStorage.getItem('bggCollection'))
  if (bggData.bggCollectionData.length > 0) {
    setBGGCollectionData(bggData.bggCollectionData)
    document.querySelector('#bgg-username').value = bggData.bggUsername
    showBGGCollectionSection()
    updateBGGFilters()
    renderBGGCollection()
  }

  showListSection()
}

// Loads a list from rank or result back into List
const loadList = (list) => {
  listData = list
  setCurrentStep('List')
  if (listData.length > 0) {
    saveData(listData)
    renderListData()
  }
}

const createListObject = (data) => {
  const obj = {
    id: data.id || uuidv4(),
    name: data.name,
    image: data.image || '',
    source: data.source,
    rank: data.rank || 0,
    yearPublished: data.yearPublished || '',
    bggId: data.bggId || '',
    showCount: 0,
    voteCount: 0,
    voteShowPct: 0
  }
  return obj
}

const createList = (itemArray, source) => {
  let list = []
  itemArray.forEach((name) => {
    const data = { name, source }
    const obj = createListObject(data)
    list.push(obj)
  })
  return list
}

const addListItems = (list) => {
  list.forEach((item) => {
    // strip out double quotes
    item.name = item.name.replace(/["]+/g, '')
    listData.push(item)
  })

  if (listData.length > 0) {
    setCurrentStep('List')
    enableStepTab('rank')
    enableNextButton()
    enableListSave()
    filterDuplicates()
    saveData(listData)
    renderListData()
  }
}

const filterDuplicates = () => {
  listData = listData.filter((list, index, self) => self.findIndex(l => l.name === list.name) === index)
}

const removeListItem = (id) => {
  const itemID = listData.findIndex((item) => item.id === id)

  // Show removed item back in Collection data
  if (listData[itemID].source === 'bgg') {
    const bggData = getBGGCollectionData()
    const bggItem = bggData.findIndex((item) => item.id === id)
    bggData[bggItem].addedToList = false
    renderBGGCollection()
  }

  if (itemID > -1) {
    listData.splice(itemID, 1)
    saveData(listData)
  }
  if (listData.length === 0) {
    disableStepTab('rank')
    disableListSave()
  }
}

const handleClickClear = () => {
  const source = getCurrentStep()

  if (source === 'List' && listData.length > 0) {
    const message = 'Are you sure you want to clear your list?'
    custConfirm(message, clearListData, source)
  }
}

const clearListData = () => {
  const step = getCurrentStep()

  if (step === 'List' && listData.length > 0) {
    listData = []
    disableStepTab('rank')
    disableListSave()

    saveData(listData)

    renderListData()

    const bggData = getBGGCollectionData()
    bggData.forEach((item) => {
      item.addedToList = false
    })

    renderBGGCollection()
  } else {
    listData = []
  }
}

// sort method - if a comes first return -1, if b comes first return 1
// remove byProjected, add needsImage, inputOrder
const sortListData = (list, sortBy) => {
  if (sortBy === 'byProjected') {
    return list.sort((a, b) => {
      if (a.voteShowPct > b.voteShowPct) {
        return -1
      } else if (a.voteShowPct < b.voteShowPct) {
        return 1
      } else {
        return 0
      }
    })
  } else if (sortBy === 'alphabetical') {
    // for alpha sorts it is flipped - earlier letter in the alphabet is higher
    return list.sort((a, b) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1
      } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1
      } else {
        return 0
      }
    })
  } else if (sortBy === 'byPrevRank') {
    return list.sort((a, b) => {
      if (a.rank > b.rank) {
        return 1
      } else if (a.rank < b.rank) {
        return -1
      } else {
        return 0
      }
    })
  } else {
    return list
  }
}

export {
  addListItems,
  removeListItem,
  initPrevList,
  getListData,
  sortListData,
  clearListData,
  loadList,
  createList,
  createListObject,
  handleClickClear
}

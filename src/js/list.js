import uuidv4 from 'uuid'
import { renderListData, onShowListSection, hideStepTab, showStepTab, selectTab } from './views'
import { saveData } from './functions'
import { setCategory } from './category'
import { getCurrentStep, setCurrentStep } from './step'

let listData = []

const getListData = () => listData

const initPrevList = (category, data) => {
  listData = data
  setCategory(category)
  setCurrentStep('List')

  saveData(listData)

  renderListData()

  showStepTab('list')
  selectTab('list')
}

const createListObject = (name, source, image = '', id, rank = 0, yearPublished = '', bggId = '') => {
  const obj = {
    id: id || uuidv4(),
    name,
    image,
    source,
    rank,
    yearPublished,
    bggId,
    showCount: 0,
    voteCount: 0,
    voteShowPct: 0
  }
  return obj
}

// Loads a list from rank or result back into List
const loadList = (list) => {
  listData = list
  onShowListSection()
  if (listData.length > 0) {
    saveData(listData)
    renderListData()
  }
  setCurrentStep('List')
}

const createList = (itemArray, source) => {
  let list = []
  itemArray.forEach((item) => {
    const obj = createListObject(item, source)

    list.push(obj)
  })
  return list
}

const addListItems = (list) => {
  list.forEach((item) => {
    listData.push(item)
  })

  if (listData.length > 0) {
    setCurrentStep('List')
    showStepTab('rank')

    saveData(listData)
    renderListData()
  }
}

const removeListItem = (id) => {
  const itemID = listData.findIndex((item) => item.id === id)

  if (itemID > -1) {
    listData.splice(itemID, 1)
    saveData(listData)
  }

  if (listData.length === 0) {
    hideStepTab('rank')
  }
}

const clearListData = () => {
  const step = getCurrentStep()

  if (step === 'List') {
    const r = confirm('Are you sure you want to clear your list?')
    if (r === true) {
      listData = []
      hideStepTab('rank')

      saveData(listData)

      renderListData()
    }
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

export { addListItems, removeListItem, initPrevList, getListData, sortListData, clearListData, loadList, createList, createListObject }

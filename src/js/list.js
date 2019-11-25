import uuidv4 from 'uuid'
import { showListSection, enableStepTab, disableStepTab, enableNextButton, disableListSave, enableListSave, renderCollectionEl } from './views'
import { saveData } from './functions'
import { setCategory } from './category'
import { getCurrentStep, setCurrentStep } from './step'
import { getBGGCollectionData } from './bgg-collection'
import { getBGGSearchData } from './bgg-search'
import { custConfirm } from './common'

let listData = []

const getListData = () => listData

const setListData = (data) => {
  listData = createList(data)
}

const initPrevList = (category, data) => {
  listData = createList(data)
  setCategory(category)
  setCurrentStep('list')

  saveData(listData)
  renderCollectionEl('list')

  // initPrevBGGCollection()

  showListSection()
}

// Loads a list from rank or result back into List
const loadList = (list) => {
  listData = list
  setCurrentStep('list')
  if (listData.length > 0) {
    saveData(listData)
    renderCollectionEl('list')
  }
}

const createListObject = (data) => {
  const obj = {
    id: data.id || uuidv4(),
    name: data.name,
    imageOriginal: data.imageOriginal || '',
    image: data.image || '',
    source: data.source,
    sourceType: data.sourceType || '',
    rank: data.rank || 0,
    bggId: data.bggId || '',
    yearPublished: data.yearPublished || ''
  }
  return obj
}

// data takes in array of objects
const createList = (data) => {
  let list = []
  data.forEach((item) => {
    const obj = createListObject(item)
    list.push(obj)
  })
  return list
}

const handleAddTextItems = (textList) => {
  const textareaEl = document.querySelector('#textarea-input')
  textareaEl.value = ''

  M.textareaAutoResize(textareaEl)
  M.updateTextFields()

  const data = []

  // create array of objects to send to createList
  textList.forEach((name) => {
    data.push({
      name,
      source: 'text',
      sourceType: 'textarea'
    })
  })

  // create array of objects
  let list = createList(data)

  // add objects into listData
  addListItems(list)

  document.querySelector('#textarea-add-btn').classList.add('disabled')
}

const addListItems = (list) => {
  const prevLength = listData.length

  list.forEach((item) => {
    // strip out double quotes
    item.name = item.name.replace(/["]+/g, '')
    listData.push(item)
  })

  if (listData.length > 0) {
    setCurrentStep('list')
    enableStepTab('rank')
    enableNextButton()
    enableListSave()
    filterDuplicates()

    const currLength = listData.length
    const addedItems = currLength - prevLength

    if (addedItems > 0) {
      M.toast({ html: `Added ${addedItems} items to your list`, displayLength: 1500 })
    }

    const instance = M.Collapsible.getInstance(document.querySelector('.list-collapsible'))
    instance.open(0)

    saveData(listData)
    renderCollectionEl('list')
  }
}

const filterDuplicates = () => {
  listData = listData.filter((list, index, self) => self.findIndex(l => l.name === list.name && l.bggId === list.bggId) === index)
}

const removeListItem = (item) => {
  const itemID = listData.findIndex((i) => i.id === item.id)

  // Show removed item back in Collection data
  const bggData = getBGGCollectionData()
  const searchData = getBGGSearchData()
  if (item.sourceType === 'collection' && bggData.length > 0) {
    const bggId = item.bggId
    const bggItem = bggData.findIndex((item) => item.bggId === bggId)
    bggData[bggItem].addedToList = false
    renderCollectionEl('bgg-collection')
  } else if (item.sourceType === 'search' && searchData.length > 0) {
    const bggId = item.bggId
    const bggItem = searchData.findIndex((item) => item.bggId === bggId)
    searchData[bggItem].addedToList = false
    renderCollectionEl('bgg-search')
  }

  listData.splice(itemID, 1)
  saveData(listData)

  if (listData.length === 0) {
    disableStepTab('rank')
    disableListSave()
  }
}

const handleClickClear = () => {
  const source = getCurrentStep()

  if (source === 'list' && listData.length > 0) {
    const message = 'Are you sure you want to clear your list?'
    custConfirm(message, clearListData, source)
  }
}

const clearListData = () => {
  const step = getCurrentStep()

  if (step === 'list' && listData.length > 0) {
    listData = []
    disableStepTab('rank')
    disableListSave()

    saveData(listData)

    renderCollectionEl('list')

    const bggData = getBGGCollectionData()
    bggData.forEach((item) => {
      item.addedToList = false
    })

    renderCollectionEl('bgg-collection')

    const searchData = getBGGSearchData()
    searchData.forEach((item) => {
      item.addedToList = false
    })
    renderCollectionEl('bgg-search')
  } else {
    listData = []
  }
}

const estimateTotalComparisons = (list) => {
  let n = 0
  let mid
  let sortList = []
  sortList[n] = []
  let estimatedSize = 0

  list.forEach((item, index) => {
    sortList[n][index] = index
  })

  n++

  for (let i = 0; i < sortList.length; i++) {
    // Initialize sortList
    if (sortList[i].length >= 2) {
      mid = Math.ceil(sortList[i].length / 2)
      sortList[n] = []
      sortList[n] = sortList[i].slice(0, mid)
      estimatedSize += (sortList[n].length * 0.55)
      n++
      sortList[n] = []
      sortList[n] = sortList[i].slice(mid, sortList[i].length)
      estimatedSize += (sortList[n].length * 0.55)
      n++
    }
  }

  return Math.round(estimatedSize)
}

const sortListData = (list, sortBy) => {
  if (sortBy === 'alphabetical') {
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
  } else if (sortBy === 'bgg-rank') {
    return list.sort((a, b) => {
      if (a.bggRank > b.bggRank) {
        return 1
      } else if (a.bggRank < b.bggRank) {
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
  handleClickClear,
  handleAddTextItems,
  estimateTotalComparisons,
  setListData
}

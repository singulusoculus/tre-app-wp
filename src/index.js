import { renderPreviousSession, onShowStartSection, onShowListSection, onShowRankSection, renderListData, showStepTab, selectTab, onShowResultSection } from './js/views'
import { addListItems, getListData, clearListData, loadList, createList } from './js/list'
import { setFilters } from './js/filters'
import { initRanking, handlePick, handleUndo, deleteItem, addItem, getRankData, calcRankedList } from './js/rank'
import { getResultData } from './js/result'
import { getBGGData } from './js/requests-bgg'
import { getCategory, setCategory } from './js/category'
import { getCurrentStep, setCurrentStep } from './js/step'
import { initFanFavorite, handleCategoryChange } from './js/start'

import './main.scss'

M.AutoInit()

// Step Tab Control *************************************************
// Start Tab
document.querySelector('#start-tab').addEventListener('click', (e) => {
  const step = getCurrentStep()
  const category = document.querySelector('#list-category-select').value
  if (step !== 'Start' || category !== '0') {
    const r = confirm('This will clear any progress and start the process from the beginning. Want to continue?')
    if (r === true) {
      // Reset the Category Select and reinitialize
      document.querySelector('#list-category-select').value = 0
      M.FormSelect.init(document.querySelector('#list-category-select'))
      setCategory(0)
      setCurrentStep('Start')
      renderPreviousSession()

      showStepTab('start')
      selectTab('start')

      onShowStartSection()
    } else {
      e.stopPropagation()
    }
  }
})

// List Tab
document.querySelector('#list-tab').addEventListener('click', () => {
  const step = getCurrentStep()

  if (step === 'Start') {
    clearListData()
    setCurrentStep('List')

    renderListData()
    onShowListSection()
  } else if (step === 'List') {
    onShowListSection()
  } else if (step === 'Rank') {
    const r = confirm('This will terminate the ranking process and allow you to edit the list. Want to continue?')
    if (r === true) {
      const data = getRankData()
      let list

      // filter out potential deleted items
      if (data.deletedItems) {
        list = data.masterList.filter((e) => data.deletedItems.indexOf(data.masterList.indexOf(e)) < 0, data.deletedItems)
      } else {
        list = data.masterList
      }
      loadList(list)
    }
  } else if (step === 'Result') {
    const r = confirm('This will clear your results and allow you to edit the list. Want to continue?')
    if (r === true) {
      const data = getResultData()
      loadList(data)
    }
  }
})

// Rank Tab
document.querySelector('#rank-tab').addEventListener('click', () => {
  const step = getCurrentStep()

  if (step === 'List') {
    const listData = getListData()
    const r = confirm('Are you ready to start ranking this list?')
    if (r === true) {
      const category = getCategory()
      listData.sort((a, b) => 0.5 - Math.random())
      initRanking(listData, category)
      onShowRankSection()
    }
  } else if (step === 'Rank') {
    const r = confirm('Do you really want to restart ranking this list?')
    if (r === true) {
      const data = getRankData()
      const listData = data.masterList
      listData.sort((a, b) => 0.5 - Math.random())
      const category = getCategory()
      initRanking(listData, category)
      onShowRankSection()
    }
  } else if (step === 'Result') {
    const r = confirm('Do you want to start ranking this list again?')
    if (r === true) {
      const listData = getResultData()
      const category = getCategory()
      initRanking(listData, category)
      onShowRankSection()
    }
  }
})

// Result Tab
document.querySelector('#result-tab').addEventListener('click', () => {
  const step = getCurrentStep()
  if (step === 'Rank') {
    calcRankedList()
    onShowResultSection()
  }
})

// Section Control ***********************************************************************************
// Start Section ***********

// Fan Favorite
// document.querySelector('#fan-fav-button').addEventListener('click', () => {
//   initFanFavorite()
// })

// Select a category
document.querySelector('#list-category-select').addEventListener('change', () => {
  handleCategoryChange()
})

// User Lists

// List Section ***********
// Add List Items
document.querySelector('#textarea-add-btn').addEventListener('click', () => {
  // Filter and create list data
  let textList = document.querySelector('#textarea-input').value.split('\n').filter((x) => (x !== (undefined || '')))

  document.querySelector('#textarea-input').value = ''

  let list = createList(textList, 'text')

  addListItems(list)
  document.querySelector('#textarea-input').style.height = '45px'
})

document.querySelector('#bgg-add').addEventListener('click', () => {
  const bggList = getBGGData()
  addListItems(bggList)
})

// Filters
document.querySelector('#search-text').addEventListener('input', (e) => {
  setFilters({
    searchText: e.target.value
  })
  renderListData()
})

document.querySelector('#sort-by').addEventListener('change', (e) => {
  setFilters({
    sortBy: e.target.value
  })
  renderListData()
})

document.querySelector('#clear-list').addEventListener('click', () => {
  clearListData()
})

// Rank Section **************
// Handle item1 pick
document.querySelector('#item-1-card').addEventListener('click', () => {
  handlePick(-1)
})

// Handle item 2 pick
document.querySelector('#item-2-card').addEventListener('click', () => {
  handlePick(1)
})

// // Handle undo
document.querySelector('#undo-btn').addEventListener('click', () => {
  handleUndo()
})

// // Handle item delete
// document.querySelectorAll('.delete-button').forEach((el) => {
//   el.addEventListener('click', (e) => {
//     if (e.target.id === 'delete-1') {
//       deleteItem(-1)
//     } else if (e.target.id === 'delete-2') {
//       deleteItem(1)
//     }
//   })
// })

// // Handle Add item - during ranking
// document.querySelector('#add-button').addEventListener('click', (e) => {
//   console.log('add item')
//   const name = document.querySelector('#add-input').value
//   addItem(name, 'text')
//   document.querySelector('#add-input').value = ''
// })

// Result Section ******************************

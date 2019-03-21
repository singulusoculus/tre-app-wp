import { renderPreviousSession, showListSection, showRankSection, renderListData, showStartSection } from './js/views'
import { addListItems, getListData, clearListData, loadList, createList } from './js/list'
import { setFilters } from './js/filters'
import { initRanking, handlePick, handleUndo, deleteItem, addItem, getRankData, calcRankedList } from './js/rank'
import { getResultData } from './js/result'
import { getBGGData } from './js/requests-bgg'
import { getCategory, setCategory } from './js/category'
import { getCurrentStep, setCurrentStep } from './js/step'
import { initFanFavorite, handleCategoryChange } from './js/start'

import './styles/main.scss'

// Nav Control *************************************************
// Start Nav
document.querySelector('#step-nav__start').addEventListener('click', () => {
  setCategory(parseInt(document.querySelector('#list-category').value))
  setCurrentStep('Start')
  renderPreviousSession()
  showStartSection()
})

// List Nav
document.querySelector('#step-nav__list').addEventListener('click', () => {
  const step = getCurrentStep()

  if (step === 'Start') {
    clearListData()
    setCurrentStep('List')
    renderListData()
    showListSection()
  } else if (step === 'List') {
    showListSection()
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

// Rank Nav
document.querySelector('#step-nav__rank').addEventListener('click', () => {
  const step = getCurrentStep()

  if (step === 'List') {
    const listData = getListData()
    if (listData.length === 0) {
      alert('Add some items to your list')
    } else {
      const r = confirm('Are you ready to start ranking this list?')
      if (r === true) {
        const category = getCategory()
        listData.sort((a, b) => 0.5 - Math.random())
        initRanking(listData, category)
        showRankSection()
      }
    }
  } else if (step === 'Result') {
    const r = confirm('Do you want to start ranking this list again?')
    if (r === true) {
      const data = getResultData()
      const category = getCategory()
      initRanking(data, category)
      showRankSection()
    }
  }
})

// Result Nav
document.querySelector('#step-nav__result').addEventListener('click', () => {
  const step = getCurrentStep()
  if (step === 'Rank') {
    calcRankedList()
  }
})

// Section Control ***********************************************************************************
// Start Section ***********

// Fan Favorite
document.querySelector('#fan-fav-button').addEventListener('click', () => {
  initFanFavorite()
})

// Select a category
document.querySelector('#list-category').addEventListener('change', () => {
  handleCategoryChange()
})

// User Lists

// List Section ***********
// Add List Items
document.querySelector('#add-text-input-button').addEventListener('click', () => {
  // Filter and create list data
  let textList = document.querySelector('#textarea-input').value.split('\n').filter((x) => (x !== (undefined || '')))

  document.querySelector('#textarea-input').value = ''

  let list = createList(textList, 'text')

  addListItems(list)
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
document.querySelector('#item-1').addEventListener('click', () => {
  handlePick(-1)
})

// Handle item 2 pick
document.querySelector('#item-2').addEventListener('click', () => {
  handlePick(1)
})

// Handle undo
document.querySelector('#undo-button').addEventListener('click', () => {
  handleUndo()
})

// Handle item delete
document.querySelectorAll('.delete-button').forEach((el) => {
  el.addEventListener('click', (e) => {
    if (e.target.id === 'delete-1') {
      deleteItem(-1)
    } else if (e.target.id === 'delete-2') {
      deleteItem(1)
    }
  })
})

// Handle Add item - during ranking
document.querySelector('#add-button').addEventListener('click', (e) => {
  console.log('add item')
  const name = document.querySelector('#add-input').value
  addItem(name, 'text')
  document.querySelector('#add-input').value = ''
})

// Result Section ******************************

import { renderPreviousSession, showListSection, renderListData, setupSaveLogin, handleClickStart, handleClickList, handleClickRank, renderBGGCollection } from './views'
import { addListItems, handleClickClear, clearListData, createList } from './list'
import { setFilters, setBGGFilters } from './filters'
import { handlePick, handleUndo, handleDeleteItem } from './rank'
import { setCurrentStep } from './step'
import { handleCategoryChange } from './start'
import { handleBGGCollectionRequest, handleAddSelectedBGG, handleCollectionChangeClick } from './bgg-collection'

import '../styles/main.scss'

jQuery(document).ready(() => {
  M.AutoInit()

  const elems = document.querySelector('#alert-modal')
  const options = { dismissible: false }
  M.Modal.init(elems, options)

  document.querySelector('#start-wrapper').classList.add('active')
  setCurrentStep('Start')
  renderPreviousSession()
  setupSaveLogin()

  // //////////////////////////////////////////////////////////////////////
  // // STEP TAB CONTROLS
  // //////////////////////////////////////////////////////////////////////

  // ***************** Start Tab *****************
  document.querySelector('#start-tab').addEventListener('click', (e) => {
    handleClickStart()
    e.stopPropagation()
  })

  // ***************** List Tab *****************
  document.querySelector('#list-tab').addEventListener('click', (e) => {
    handleClickList()
    e.stopPropagation()
  })

  // ***************** Rank Tab *****************
  document.querySelector('#rank-tab').addEventListener('click', (e) => {
    handleClickRank()
    e.stopPropagation()
  })

  // //////////////////////////////////////////////////////////////////////
  // // NEXT BUTTON
  // //////////////////////////////////////////////////////////////////////

  document.querySelector('.next-rank').addEventListener('click', (e) => {
    handleClickRank()
  })

  // //////////////////////////////////////////////////////////////////////
  // // SECTION CONTROLS
  // //////////////////////////////////////////////////////////////////////

  // ***************** Start Section *****************

  // Fan Favorite
  // document.querySelector('#fan-fav-button').addEventListener('click', () => {
  //   initFanFavorite()
  // })

  // Select a category
  document.querySelector('#list-category-select').addEventListener('change', () => {
    handleCategoryChange()
    clearListData()
    setCurrentStep('List')
    renderListData()
    showListSection()
  })

  // User Lists

  // ***************** List Section *****************
  // Add items to textarea
  document.querySelector('#textarea-input').addEventListener('input', () => {
    document.querySelector('#textarea-add-btn').classList.remove('disabled')
  })

  // Add List Items
  document.querySelector('#textarea-add-btn').addEventListener('click', () => {
    // Filter and create list data
    let textList = document.querySelector('#textarea-input').value.split('\n').filter((x) => (x !== (undefined || '')))

    document.querySelector('#textarea-input').value = ''

    // create array of objects
    let list = createList(textList, 'text')

    // add objects into listData
    addListItems(list)
    document.querySelector('#textarea-input').style.height = '45px'
    document.querySelector('.input-field>label:not(.label-icon)').classList.remove('active')
    document.querySelector('#textarea-add-btn').classList.add('disabled')
  })

  document.querySelector('#bgg-submit').addEventListener('click', () => {
    handleBGGCollectionRequest()
  })

  document.querySelector('.change-bgg-username').addEventListener('click', () => {
    handleCollectionChangeClick()
  })

  document.querySelector('.update-bgg-collection').addEventListener('click', () => {
    handleBGGCollectionRequest()
  })

  // BGG Filters
  document.querySelectorAll('.bgg-cb').forEach((el) => {
    el.addEventListener('change', (e) => {
      const element = e.target.className
      setBGGFilters({
        [element]: e.target.checked
      })
      renderBGGCollection()
    })
  })

  document.querySelector('#personal-rating').addEventListener('change', (e) => {
    setBGGFilters({
      rating: parseInt(e.target.value)
    })
    renderBGGCollection()
  })

  document.querySelector('#bgg-add-selected').addEventListener('click', (e) => {
    handleAddSelectedBGG()
  })

  // List Filters
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
    handleClickClear()
  })

  document.querySelector('.list-header').addEventListener('click', () => {
    const listHeader = document.querySelector('.list-header')
    listHeader.classList.remove('pulse-bc')
    listHeader.classList.add('clicked')
  })

  // ***************** Rank Section *****************
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

  // Handle item delete
  document.querySelectorAll('.rank-card-content__delete').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      if (e.target.id === 'rank-delete-1') {
        handleDeleteItem(-1)
      } else if (e.target.id === 'rank-delete-2') {
        handleDeleteItem(1)
      }
    })
  })

  // // Handle Add item - during ranking
  // document.querySelector('#add-button').addEventListener('click', (e) => {
  //   console.log('add item')
  //   const name = document.querySelector('#add-input').value
  //   addItem(name, 'text')
  //   document.querySelector('#add-input').value = ''
  // })

  // ***************** Result Section *****************

  document.querySelector('.support-us__dismiss').addEventListener('click', () => {
    document.querySelector('.support-us').classList.add('hide')
  })
})

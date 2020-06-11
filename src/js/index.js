import '../styles/main.scss'
import { renderCollectionEl } from './views'
import { handleClickClear, handleAddTextItems } from './list'
import { setListFilters, setBGGFilters, setBGGSearchFilters } from './filters'
import { handlePick, handleUndo, handleDeleteItem, handleRestart } from './rank'
import { handleCategoryChange } from './start'
import { handleBGGCollectionRequest, handleAddSelectedBGG, handleCollectionChangeClick } from './bgg-collection'
import { initRankingEngine, handleClickSave, handleClickUpdate, handleClickStart, handleClickList, handleClickRank, setReloadInfo, handleClickSaveList, handleClickSaveRank, handleClickSaveResult, handleClickAccount, handleClickRatedCb } from './functions'
import { copyURLText, handleShareSwitchChange } from './list-sharing'
import { handleQuickHelpClick } from './quick-help'
import { handleBGGSearch } from './bgg-search'
// import LogRocket from 'logrocket'
// LogRocket.init('r3us4o/ranking-engine-prod')

// Check for mobile browser and fix category select to work better for mobile browsers
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
if (isMobile) {
  document.querySelector('#list-category-select').classList.add('browser-default')
}

jQuery(document).ready(() => {
  initRankingEngine()

  // //////////////////////////////////////////////////////////////////////
  // // QUICK HELP
  // //////////////////////////////////////////////////////////////////////
  document.querySelector('.help__button').addEventListener('click', (e) => {
    e.preventDefault()
    handleQuickHelpClick()
  })

  // //////////////////////////////////////////////////////////////////////
  // // STEP TAB CONTROLS
  // //////////////////////////////////////////////////////////////////////

  // ***************** Start Tab *****************
  document.querySelector('#start-tab').addEventListener('click', (e) => {
    handleClickStart(e)
    e.stopPropagation()
  })

  // ***************** List Tab *****************
  document.querySelector('#list-tab').addEventListener('click', (e) => {
    handleClickList(e)
    e.stopPropagation()
  })

  // ***************** Rank Tab *****************
  document.querySelector('#rank-tab').addEventListener('click', (e) => {
    handleClickRank(e)
    e.stopPropagation()
  })

  // //////////////////////////////////////////////////////////////////////
  // // NEXT BUTTON
  // //////////////////////////////////////////////////////////////////////

  document.querySelector('.next-rank').addEventListener('click', (e) => {
    handleClickRank()
  })

  // //////////////////////////////////////////////////////////////////////
  // // RESTART OPTIONS
  // //////////////////////////////////////////////////////////////////////
  document.querySelector('#restart-complete').addEventListener('click', (e) => {
    document.querySelector('.rerank-options__num').classList.remove('visible')
    document.querySelector('.rerank-options__radio').classList.remove('num-vis')
  })

  document.querySelector('#restart-partial').addEventListener('click', (e) => {
    document.querySelector('.rerank-options__num').classList.add('visible')
    document.querySelector('.rerank-options__radio').classList.add('num-vis')
  })

  document.querySelector('#restart-ok-btn').addEventListener('click', (e) => {
    handleRestart(e)
  })

  // //////////////////////////////////////////////////////////////////////
  // // SECTION CONTROLS
  // //////////////////////////////////////////////////////////////////////

  // ***************** Start Section *****************

  // Select a category
  document.querySelector('#list-category-select').addEventListener('change', () => {
    handleCategoryChange()
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
    handleAddTextItems(textList)
  })

  document.querySelector('#bgg-submit').addEventListener('click', () => {
    handleBGGCollectionRequest()
  })

  document.querySelector('.change-bgg-username').addEventListener('click', () => {
    handleCollectionChangeClick()
  })

  document.querySelector('#bgg-search-submit').addEventListener('click', () => {
    const searchText = document.querySelector('#bgg-search').value
    const typeEls = document.getElementsByName('bgg-search-type')
    let type
    typeEls.forEach((i) => {
      if (i.checked) {
        type = i.id
      }
    })

    handleBGGSearch(searchText, type)
  })

  document.querySelector('#bgg-search-sort-select').addEventListener('change', (e) => {
    setBGGSearchFilters({
      sortBy: e.target.value
    })
    renderCollectionEl('bgg-search')
  })

  // BGG Filters
  Array.from(document.querySelectorAll('.bgg-cb')).forEach((el) => {
    el.addEventListener('change', (e) => {
      const element = e.target.className
      setBGGFilters({
        [element]: e.target.checked
      })
      renderCollectionEl('bgg-collection')
    })
  })

  // Personal Min/Max Slider
  const slider = document.querySelector('#min-max-rating-slider')
  slider.noUiSlider.on('change', () => {
    const values = slider.noUiSlider.get()
    const min = parseFloat(values[0])
    const max = parseFloat(values[1])

    setBGGFilters({
      minRating: min,
      maxRating: max
    })

    renderCollectionEl('bgg-collection')
  })

  document.querySelector('.bgg-cb .rated').addEventListener('click', () => {
    handleClickRatedCb()
  })

  document.querySelector('#bgg-add-selected').addEventListener('click', (e) => {
    handleAddSelectedBGG()
  })

  // List Filters
  document.querySelector('#search-text').addEventListener('input', (e) => {
    setListFilters({
      searchText: e.target.value
    })
    renderCollectionEl('list')
  })

  document.querySelector('#clear-list').addEventListener('click', () => {
    handleClickClear()
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
  Array.from(document.querySelectorAll('.rank-card-content__delete')).forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      if (e.target.id === 'rank-delete-1') {
        handleDeleteItem(-1)
      } else if (e.target.id === 'rank-delete-2') {
        handleDeleteItem(1)
      }
    })
  })

  // ***************** Result Section *****************

  // ***************** Modals *****************
  document.querySelector('#nav-re__account').addEventListener('click', (e) => {
    handleClickAccount()
  })

  document.querySelector('#login-form-button').addEventListener('click', (e) => {
    const fromVal = e.target.attributes.from.value
    setReloadInfo(`login-${fromVal}`)
  })

  document.querySelector('#save-list-btn').addEventListener('click', (e) => {
    // This button is available on List, Rank, and Result sections
    handleClickSave(e)
  })

  document.querySelector('#update-list-btn').addEventListener('click', (e) => {
    // This is only available on the List section
    handleClickUpdate(e)
  })

  document.querySelector('#save-list').addEventListener('click', (e) => {
    handleClickSaveList()
  })

  document.querySelector('#save-ranking').addEventListener('click', (e) => {
    handleClickSaveRank()
  })

  document.querySelector('#save-results').addEventListener('click', (e) => {
    handleClickSaveResult()
  })

  Array.from(document.querySelectorAll('.save-btn')).forEach((el) => {
    el.addEventListener('click', () => {
      document.querySelector('#login-form-button').setAttribute('from', '')
      document.querySelector('#login-form-button').setAttribute('from', 'save')
    })
  })

  document.querySelector('#share-switch').addEventListener('change', () => {
    handleShareSwitchChange()
  })

  document.querySelector('#share-list__copy').addEventListener('click', () => {
    copyURLText()
  })

// End of document.ready
})

window.onpopstate = (e) => {
  history.replaceState(null, null, ' ')
  e.stopPropagation()
}

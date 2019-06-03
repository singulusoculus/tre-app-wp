import '../styles/main.scss'
import { renderListData, renderBGGCollection } from './views'
import { handleClickClear, handleAddTextItems } from './list'
import { setFilters, setBGGFilters } from './filters'
import { handlePick, handleUndo, handleDeleteItem, handleRestart } from './rank'
import { handleCategoryChange } from './start'
import { handleBGGCollectionRequest, handleAddSelectedBGG, handleCollectionChangeClick } from './bgg-collection'
import { initRankingEngine, handleClickSave, handleClickUpdate, handleClickStart, handleClickList, handleClickRank } from './functions'
import { getDBListInfo } from './database'
import { getCurrentStep } from './step'
import { handleProgressTransferClick, handleUserResultTransferClick, handleRankingResultsTransferClick } from './transfer'

jQuery(document).ready(() => {
  initRankingEngine()

  // //////////////////////////////////////////////////////////////////////
  // // Transfer Processes
  // //////////////////////////////////////////////////////////////////////

  document.querySelector('#progress-transfer').addEventListener('click', () => {
    handleProgressTransferClick()
  })

  document.querySelector('#user-result-transfer').addEventListener('click', () => {
    handleUserResultTransferClick()
  })

  document.querySelector('#result-transfer').addEventListener('click', () => {
    handleRankingResultsTransferClick()
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

  // ***************** Result Section *****************

  document.querySelector('.support-us__dismiss').addEventListener('click', () => {
    document.querySelector('.support-us').classList.add('hide')
  })

  document.querySelector('#login-form-button').addEventListener('click', () => {
    const data = getCurrentStep()
    sessionStorage.setItem('loginReload', data)
  })

  // ***************** Modals *****************
  document.querySelector('#save-list-btn').addEventListener('click', (e) => {
    // This button is available on List, Rank, and Result sections
    handleClickSave(e)
  })

  document.querySelector('#update-list-btn').addEventListener('click', (e) => {
    // This is only available on the List section
    handleClickUpdate(e)
  })

  document.querySelector('#save-list').addEventListener('click', () => {
    const listInfo = getDBListInfo()
    if (listInfo.template.id > 0) {
      document.querySelector('#update-list-btn').classList.remove('hide')
      document.querySelector('#save-list-btn').textContent = 'Save New'
      document.querySelector('#save-description').value = listInfo.template.desc
    } else {
      document.querySelector('#update-list-btn').classList.add('hide')
      document.querySelector('#save-list-btn').textContent = 'Save'
      document.querySelector('#save-description').value = ''
    }
  })

  document.querySelector('#save-ranking').addEventListener('click', () => {
    const progressID = getDBListInfo().progress.id
    const listInfo = getDBListInfo()

    document.querySelector('#update-list-btn').classList.add('hide')

    if (progressID > 0) {
      document.querySelector('#save-list-btn').textContent = 'Update'
      document.querySelector('#save-description').value = listInfo.progress.desc
    } else {
      document.querySelector('#save-list-btn').textContent = 'Save'
      document.querySelector('#save-description').value = ''
    }
  })

// End of document.ready
})

window.onpopstate = (e) => {
  history.replaceState(null, null, ' ')
  e.stopPropagation()
}

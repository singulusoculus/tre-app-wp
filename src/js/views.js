import { initPrevList, getListData, removeListItem, loadList } from './list'
import { filterListData, filterBGGCollection, filterBGGSearch } from './filters'
import { initPrevRanking, getRankData, initRanking } from './rank'
import { initPrevResult, renderResult, getResultData } from './result'
import { setCategory, getCategory, getCategoryInfo } from './category'
import { setCurrentStep } from './step'
import { addBGGItemToList, getBGGCollectionData } from './bgg-collection'
import { setDBListInfo, setDBListInfoType, dbGetUserLists, dbLoadUserList, dbDeleteUserList, getDBListInfo } from './database'
import { updateLocalStorageSaveDataItem, getUserID } from './functions'
import { openShareModal, setMyListsInfo, setParentList } from './list-sharing'
import { getBGGSearchData } from './bgg-search'

// //////////////////////////////////////////////////////////////////////
// // PREVIOUS SESSION NOTIFICATION
// //////////////////////////////////////////////////////////////////////

const renderPreviousSessionToast = () => {
  const prevData = JSON.parse(localStorage.getItem('saveData'))

  if (prevData !== null) {
    const step = prevData.step
    const data = prevData.data
    const parentList = prevData.parentList

    if (Object.keys(data).length > 0 && step !== 'Start') {
      const toastHTML = `<span>You have a previous ${step} session available. Want to resume?</span><div class="prev-toast-btns"><button class="btn-flat toast-action resume-prev-btn">Resume</button><button class="btn-flat toast-action discard-prev-btn">Discard</button></div>`
      M.toast({ html: toastHTML, displayLength: 'stay', classes: 'actionable-toast', inDuration: 600 })

      const resumeBtnEL = document.querySelector('.resume-prev-btn')
      const discardBtnEl = document.querySelector('.discard-prev-btn')

      resumeBtnEL.addEventListener('click', () => {
        const prevData = JSON.parse(localStorage.getItem('saveData'))
        const step = prevData.step
        const data = prevData.data
        const category = prevData.category
        const dbListInfo = prevData.dbListInfo

        M.Toast.dismissAll()

        setDBListInfo(dbListInfo)
        if (step === 'List') {
          initPrevList(category, data)
        } else if (step === 'Rank') {
          setParentList(parentList)
          initPrevRanking(category, data)
        } else if (step === 'Result') {
          initPrevResult(category, data)
        }
      })

      discardBtnEl.addEventListener('click', () => {
        // clear localStorage on Discard
        localStorage.removeItem('saveData')
        localStorage.removeItem('rankDataHistory')

        M.Toast.dismissAll()
      })
    }
  }
}

// //////////////////////////////////////////////////////////////////////
// // RENDER LIST COLLECTIONS
// //////////////////////////////////////////////////////////////////////

const renderCollectionEl = (type) => {
  let data
  let filteredItems

  // data, filtering, and header
  if (type === 'list') {
    data = getListData()
    filteredItems = filterListData(data)
    const count = data.length
    const listInfoEl = document.querySelector('#list-info')
    listInfoEl.textContent = `Your List: ${count} items`
  } else if (type === 'bgg-collection') {
    data = getBGGCollectionData()
    filteredItems = filterBGGCollection(data)
    const listInfoEl = document.querySelector('.bgg-collection-info')
    const totalCount = data.length
    const addedList = data.filter((item) => item.addedToList !== false)
    const addedCount = addedList.length
    const filteredCount = filteredItems.length
    listInfoEl.textContent = `Filtered: ${filteredCount} | Added: ${addedCount} | Total: ${totalCount} `
    document.querySelector('#bgg-add-selected').innerHTML = `<i class="material-icons right">add</i>Add ${filteredCount} Games`
  } else if (type === 'bgg-search') {
    data = getBGGSearchData()
    filteredItems = filterBGGSearch(data)
    const searchResultsHeaderEl = document.querySelector('.bgg-search-results-header__title')
    const searchLength = filteredItems.length
    searchResultsHeaderEl.textContent = `Search Results: ${searchLength}`
  }

  // render items
  const collectionItemsEl = document.querySelector(`.${type}__items`)
  collectionItemsEl.innerHTML = ''

  if (filteredItems.length > 0) {
    filteredItems.forEach((item) => {
      const itemEl = generateCollectionDOM(item, type)
      collectionItemsEl.appendChild(itemEl)
    })
    collectionItemsEl.classList.add('collection')
  }

  if (type !== 'list') {
    const wrapperEl = document.querySelector(`.${type}__wrapper`)
    wrapperEl.classList.remove('hide')
  }
}

const generateCollectionDOM = (item, type) => {
  const itemEl = document.createElement('li')
  itemEl.classList.add('collection-item', 'list-item')
  const imgDiv = document.createElement('div')
  imgDiv.classList.add('list-item__image-container')
  const imgEl = document.createElement('img')
  imgEl.classList.add('list-item__image')
  if (item.image !== '') {
    imgEl.src = item.image
    imgDiv.appendChild(imgEl)
  }
  itemEl.appendChild(imgDiv)

  const itemNameEl = document.createElement('span')
  itemNameEl.classList.add('list-item__title')
  itemNameEl.textContent = item.name

  const iconEl = document.createElement('a')
  iconEl.classList.add('list-item__icon')
  iconEl.href = '#!'

  // Add icons and click events
  if (type === 'list') {
    iconEl.innerHTML = '<i class="material-icons">delete</i>'
    iconEl.addEventListener('click', (e) => {
      removeListItem(item)
      renderCollectionEl('list')
    })
  } else if (type === 'bgg-collection') {
    iconEl.innerHTML = '<i class="material-icons">add</i>'
    iconEl.addEventListener('click', (e) => {
      addBGGItemToList(item, type)
      renderCollectionEl('bgg-collection')
      renderCollectionEl('list')
    })
    // I may be able to combine the two bgg items into one
  } else if (type === 'bgg-search') {
    iconEl.innerHTML = '<i class="material-icons">add</i>'
    iconEl.addEventListener('click', (e) => {
      addBGGItemToList(item, type)
      renderCollectionEl('list')
    })
  }

  itemEl.appendChild(itemNameEl)
  itemEl.appendChild(iconEl)

  return itemEl
}

// //////////////////////////////////////////////////////////////////////
// // STEP TAB VISIBILITY
// //////////////////////////////////////////////////////////////////////

// Step Tab visibility
const enableStepTab = (...steps) => {
  steps.forEach((step) => {
    document.querySelector(`#${step}-tab`).classList.remove('disabled')
    createTooltip(step)
  })
}

const disableStepTab = (...steps) => {
  steps.forEach((step) => {
    document.querySelector(`#${step}-tab`).classList.add('disabled')
    destroyTooltip(step)
  })

  if (steps.includes('rank')) {
    const nextButton = document.querySelector(`.next-rank`)
    nextButton.classList.remove('next--visible')
  }
}

// //////////////////////////////////////////////////////////////////////
// // STEP TAB CONTROLS
// //////////////////////////////////////////////////////////////////////

// Materialize's select function simulates a click on the tab, potentially firing any events attached to it
// This gets around that by simply showing the tab without the click event
const showTab = (tab) => {
  // Tabs
  const activeTab = document.querySelectorAll('.tab > .active')
  activeTab[0].classList.remove('active')

  const newActiveTab = document.querySelector(`#${tab}-tab-link`)
  newActiveTab.classList.add('active')

  // Section
  const activeSection = document.querySelectorAll('.step-container.active')
  activeSection[0].classList.remove('active')
  activeSection[0].setAttribute('style', 'display: none')

  const newActiveSection = document.querySelector(`#${tab}-container`)
  newActiveSection.classList.add('active')
  newActiveSection.removeAttribute('style', 'display: none')

  const tabs = document.querySelector('#step-tabs')
  M.Tabs.init(tabs)
  updateTabIndicator()
  sectionTransition(tab)
}

const updateTabIndicator = () => {
  const tabs = M.Tabs.getInstance(document.querySelector('#step-tabs'))
  tabs.updateTabIndicator()
}

const sectionTransition = (step) => {
  // Remove active class from all step-wrapper divs
  const activeEls = document.getElementsByClassName('step-wrapper active')
  while (activeEls[0]) {
    activeEls[0].classList.remove('active')
  }

  // Add active class to current step
  setTimeout(() => {
    document.querySelector(`#${step}-wrapper`).classList.add('active')
  }, 200)
}

// //////////////////////////////////////////////////////////////////////
// // BUTTON CONTROLS
// //////////////////////////////////////////////////////////////////////

const enableNextButton = () => {
  const nextButton = document.querySelector(`.next-rank`)
  nextButton.classList.add('next--visible')
}

const enableListSave = () => {
  const saveButton = document.querySelector('#save-list')
  saveButton.classList.remove('disabled')
}

const disableListSave = () => {
  const saveButton = document.querySelector('#save-list')
  saveButton.classList.add('disabled')
}

// //////////////////////////////////////////////////////////////////////
// // TOOLTIPS
// //////////////////////////////////////////////////////////////////////

const createTooltip = (step) => {
  const linkEl = document.querySelector(`#${step}-tab-link`)
  switch (step) {
    case 'list':
      linkEl.classList.add('tooltipped')
      linkEl.setAttribute('data-tooltip', 'Edit your list')
      break
    case 'rank':
      linkEl.classList.add('tooltipped')
      linkEl.setAttribute('data-tooltip', 'Start or Restart ranking')
      break
  }

  const els = document.querySelectorAll('.tooltipped')
  M.Tooltip.init(els)
}

const destroyTooltip = (step) => {
  if (step) {
    const stepLink = document.querySelector(`#${step}-tab-link`)
    if (stepLink.classList.contains('tooltipped') && stepLink.M_Tooltip !== undefined) {
      const tip = M.Tooltip.getInstance(stepLink)
      tip.destroy()
    }
  }
}

// //////////////////////////////////////////////////////////////////////
// // SHOW SECTIONS
// //////////////////////////////////////////////////////////////////////

const showStartSection = (source) => {
  document.querySelector('#list-category-select').value = 0
  M.FormSelect.init(document.querySelector('#list-category-select'))
  setCategory(0)
  setCurrentStep('Start')
  renderPreviousSessionToast()
  disableStepTab('list', 'rank', 'result')
  showTab('start')
  document.querySelector('.bgg-section').classList.add('hide')
  document.querySelector('.bgg-search').classList.add('hide')
  setupSaveLogin()

  // Clears result database link
  setParentList(0)
  setDBListInfoType('result', { id: 0 })
  setDBListInfoType('userResult', { id: 0, desc: '' })
}

const showListSection = (source) => {
  // If coming from Rank or Result, load that list
  if (source === 'Rank') {
    const data = getRankData()
    let list
    // filter out potential deleted items
    if (data.deletedItems) {
      list = data.masterList.filter((e) => data.deletedItems.indexOf(data.masterList.indexOf(e)) < 0, data.deletedItems)
    } else {
      list = data.masterList
    }
    setParentList(0)
    loadList(list)
  } else if (source === 'Result') {
    const data = getResultData()
    setParentList(0)
    loadList(data)
  }

  // Clears result database link
  setDBListInfoType('result', { id: 0 })
  setDBListInfoType('userResult', { id: 0, desc: '' })

  enableStepTab('list')
  disableStepTab('rank', 'result')

  const categoryName = getCategoryInfo().niceName
  document.querySelector('.current-list-category').innerHTML = `Category: ${categoryName}`

  renderTemplateDesc()

  // Show BGG sections if category is Board Games, hide if not
  const addOptionsEl = M.Collapsible.getInstance(document.querySelector('.add-options-sections'))
  if (categoryName === 'Board Games') {
    addOptionsEl.open(0)
    document.querySelector('.bgg-section').classList.remove('hide')
    document.querySelector('.bgg-search').classList.remove('hide')
  } else {
    document.querySelector('.bgg-section').classList.add('hide')
    document.querySelector('.bgg-search').classList.add('hide')
    addOptionsEl.open(2)
  }

  const list = getListData()
  if (list.length > 0) {
    enableStepTab('rank')
    enableNextButton()
    enableListSave()
  } else {
    disableListSave()
  }

  showTab('list')
}

const showRankSection = (source) => {
  if (source !== undefined) {
    // Clears database link when starting a new ranking
    setDBListInfoType('progress', { id: 0, desc: '' })
  }

  if (source === 'List') {
    const listData = getListData()
    const category = getCategory()
    listData.sort((a, b) => 0.5 - Math.random())
    initRanking(listData, category)
  } else if (source === 'Rank') {
    const data = getRankData()
    const listData = data.masterList
    listData.sort((a, b) => 0.5 - Math.random())
    const category = getCategory()
    initRanking(listData, category)
  } else if (source === 'Result') {
    const listData = getResultData()
    const category = getCategory()
    initRanking(listData, category)
  }

  setDBListInfoType('userResult', { id: 0, desc: '' })

  enableStepTab('list', 'rank')
  disableStepTab('result')

  if (source !== 'Rank') {
    showTab('rank')
  }
  document.querySelector('.next-rank').classList.remove('next--visible')
}

const showResultSection = (source) => {
  enableStepTab('result', 'rank', 'list')
  renderResult()

  showTab('result')
  document.querySelector('.next-rank').classList.remove('next--visible')
}

// //////////////////////////////////////////////////////////////////////
// // MODALS / CUSTOM CONFIRMS
// //////////////////////////////////////////////////////////////////////

const custConfirm = (message, resultCallback, source) => {
  const alertText = document.querySelector('.alert-text')
  alertText.innerText = message

  const instance = M.Modal.getInstance(document.querySelector('#alert-modal'))
  instance.open()

  const eventFunc = () => {
    resultCallback(source)
    clearAlertEventListeners()
  }

  const clearAlertEventListeners = () => {
    document.querySelector('#alert-ok-btn').removeEventListener('click', eventFunc)
  }

  document.querySelector('#alert-ok-btn').addEventListener('click', eventFunc)

  document.querySelector('#alert-cancel-btn').addEventListener('click', () => {
    clearAlertEventListeners()
    instance.close()
  })
}

const custMessage = (message) => {
  document.querySelector('.message-text').textContent = message

  const instance = M.Modal.getInstance(document.querySelector('#message-modal'))
  instance.open()
}

// //////////////////////////////////////////////////////////////////////
// // SETUP SAVE BUTTONS
// //////////////////////////////////////////////////////////////////////

const setupSaveLogin = async () => {
  const myListsEl = document.querySelector('.my-lists')
  myListsEl.textContent = ''
  const userID = await getUserID()

  if (userID === 0) {
    // Create My Lists Login
    const loginMessageEl = document.createElement('div')
    loginMessageEl.classList.add('center-align')

    const textEl = document.createElement('p')
    textEl.setAttribute('style', 'margin-bottom: 1rem')
    textEl.textContent = `You must be logged in to view your lists`

    const btnEl = document.createElement('a')
    const iEl = document.createElement('i')
    btnEl.classList.add('waves-effect', 'waves-light', 'btn', 'modal-trigger')
    btnEl.setAttribute('id', 'my-lists-login-btn')
    btnEl.setAttribute('href', '#login-modal')
    btnEl.textContent = 'Login'
    btnEl.addEventListener('click', () => {
      document.querySelector('#login-form-button').setAttribute('from', '')
      document.querySelector('#login-form-button').setAttribute('from', 'my-lists')
    })
    iEl.classList.add('material-icons', 'right')
    iEl.textContent = 'account_circle'

    btnEl.appendChild(iEl)
    loginMessageEl.appendChild(textEl)
    loginMessageEl.appendChild(btnEl)
    myListsEl.appendChild(loginMessageEl)

    // Set Save button targets to Login Modal
    const saveButtons = document.querySelectorAll('.save-btn')
    saveButtons.forEach((el) => {
      el.setAttribute('href', '#login-modal')
    })

    // Clear user saved list ids if they aren't logged in
    setDBListInfoType('template', { id: 0, desc: '' })
    setDBListInfoType('progress', { id: 0, desc: '' })
    setDBListInfoType('userResult', { id: 0, desc: '' })

    const update = getDBListInfo()
    const prevData = JSON.parse(localStorage.getItem('saveData'))
    if (prevData) {
      updateLocalStorageSaveDataItem('dbListInfo', update)
    }
  } else {
    renderMyLists()
    setupSaveButtons()
  }
}

const setupSaveButtons = () => {
  // Set Save button targets to Save Modal
  const saveButtons = document.querySelectorAll('.save-btn')
  saveButtons.forEach((el) => {
    el.setAttribute('href', '#save-modal')
  })
}

// //////////////////////////////////////////////////////////////////////
// // MY LISTS
// //////////////////////////////////////////////////////////////////////

const showMyLists = () => {
  const instance = M.Modal.getInstance(document.querySelector('#account-modal'))
  instance.open()
}

const renderMyLists = async () => {
  const myListsEl = document.querySelector('.my-lists')
  jQuery('.ball-loading.my-lists').fadeIn()
  // get My Lists data and populate My Lists section
  const data = await dbGetUserLists()

  jQuery('.ball-loading.my-lists').fadeOut()

  myListsEl.textContent = ''

  const templateLists = data[0]
  const progressLists = data[1]
  const resultLists = data[2]

  let myListsInfo = {
    templates: data[3],
    progress: data[4],
    results: data[5]
  }

  setMyListsInfo(myListsInfo)

  // Create Logout button
  const btnEl = document.createElement('a')
  const iEl = document.createElement('i')
  btnEl.classList.add('waves-effect', 'waves-light', 'btn', 'center-align')
  btnEl.setAttribute('id', 'my-lists-logout-btn')
  btnEl.setAttribute('href', `./wp-login.php?action=logout`)
  btnEl.textContent = 'Log Off'
  iEl.classList.add('material-icons', 'right')
  iEl.textContent = 'account_circle'

  btnEl.appendChild(iEl)
  myListsEl.appendChild(btnEl)

  // Templates
  if (templateLists.length > 0) {
    const templateHeaders = ['Created', 'Last Save', 'Items', 'Desc', '', '']
    const templateTable = createMyListsTableElement('templates', templateHeaders, templateLists, myListsInfo)
    myListsEl.appendChild(templateTable)
  }

  // Progress
  if (progressLists.length > 0) {
    const progressHeaders = ['Saved', 'Items', '% Comp', 'Desc', '']
    const progressTable = createMyListsTableElement('progress', progressHeaders, progressLists, myListsInfo)
    myListsEl.appendChild(progressTable)
  }

  // Results
  if (resultLists.length > 0) {
    const resultsHeaders = ['Completed', 'Items', 'Desc', '']
    const resultsTable = createMyListsTableElement('results', resultsHeaders, resultLists, myListsInfo)
    myListsEl.appendChild(resultsTable)
  }

  const allListsLength = templateLists.length + progressLists.length + resultLists.length

  if (allListsLength === 0) {
    const noListsEl = document.createElement('p')
    noListsEl.textContent = 'You have not saved any lists yet.'
    noListsEl.setAttribute('style', 'margin-bottom: 1rem')
    myListsEl.prepend(noListsEl)
  }
}

const createMyListsTableElement = (type, headers, rows, myListsInfo) => {
  // Main table div
  const divEl = document.createElement('div')
  divEl.classList.add(`my-lists__${type}`)
  const h4El = document.createElement('h4')
  h4El.classList.add('center-align')
  const upperType = type.toUpperCase()
  h4El.textContent = `${upperType}`
  const tableEl = document.createElement('table')
  tableEl.classList.add('highlight')

  // Headers
  const theadEl = document.createElement('thead')
  const trEl = document.createElement('tr')

  headers.forEach((header) => {
    const thEl = document.createElement('th')
    thEl.textContent = header
    trEl.appendChild(thEl)
  })

  theadEl.appendChild(trEl)
  tableEl.appendChild(theadEl)

  const tbodyEl = document.createElement('tbody')

  // Rows
  rows.forEach((row, index) => {
    const trEl = document.createElement('tr')
    const items = Object.values(row)
    const itemID = myListsInfo[type][index].id
    // const uuid = myListsInfo[type][index].uuid
    const shared = myListsInfo[type][index].shared === 1 || false
    const ranked = myListsInfo[type][index].ranked === 1 || false
    trEl.classList.add(`${type}-${index}`, `${type}-list`, 'modal-close')
    items.slice(1).forEach((item) => {
      const tdEl = document.createElement('td')
      tdEl.textContent = item
      trEl.appendChild(tdEl)
    })

    if (!ranked) {
      trEl.addEventListener('click', () => {
      // Go get the clicked list from the database and init the right step
        dbLoadUserList(type, itemID)
        M.Toast.dismissAll()
      })
    } else {
      trEl.classList.add('tooltipped')
      trEl.setAttribute('data-tooltip', 'This template is locked for editing since it has been shared and ranked')
      M.Tooltip.init(trEl)
      // open the share modal
      trEl.addEventListener('click', (e) => {
        openShareModal(myListsInfo[type][index])
        e.stopPropagation()
      })
    }

    // Share
    if (type === 'templates') {
      const tdShareEl = document.createElement('td')
      const aShareEl = document.createElement('a')
      aShareEl.classList.add('secondary-content', 'modal-trigger', 'unshared-template')
      if (shared) {
        // aShareEl.classList.add('shared-template')
        aShareEl.classList.remove('unshared-template')
      }
      aShareEl.setAttribute('href', '#share-modal')
      const iShareEl = document.createElement('i')
      iShareEl.classList.add('material-icons')
      iShareEl.textContent = 'share'

      aShareEl.addEventListener('click', (e) => {
        openShareModal(myListsInfo[type][index])
        e.stopPropagation()
      })

      aShareEl.appendChild(iShareEl)
      tdShareEl.appendChild(aShareEl)
      trEl.appendChild(tdShareEl)
    }

    // Delete
    const tdDeleteEl = document.createElement('td')
    const aEl = document.createElement('a')
    aEl.classList.add('secondary-content')
    const iEl = document.createElement('i')
    iEl.classList.add('material-icons')
    iEl.textContent = 'delete'

    aEl.addEventListener('click', (e) => {
      // Delete the list
      dbDeleteUserList(type, itemID)
      e.stopPropagation()
    })

    aEl.appendChild(iEl)
    tdDeleteEl.appendChild(aEl)
    trEl.appendChild(tdDeleteEl)

    tbodyEl.appendChild(trEl)
  })

  tableEl.appendChild(tbodyEl)

  divEl.appendChild(h4El)
  divEl.appendChild(tableEl)

  return divEl
}

// //////////////////////////////////////////////////////////////////////
// // RENDER DESCRIPTIONS
// //////////////////////////////////////////////////////////////////////

const renderTemplateDesc = () => {
  const dbListInfo = getDBListInfo()

  if (dbListInfo.template.desc) {
    document.querySelector('.current-template-desc').textContent = `Template: ${dbListInfo.template.desc}`
  } else {
    document.querySelector('.current-template-desc').textContent = ''
  }
}

export {
  renderPreviousSessionToast,
  showListSection,
  showRankSection,
  showResultSection,
  showStartSection,
  enableStepTab,
  disableStepTab,
  enableNextButton,
  enableListSave,
  disableListSave,
  setupSaveLogin,
  custConfirm,
  showTab,
  renderMyLists,
  setupSaveButtons,
  showMyLists,
  custMessage,
  renderTemplateDesc,
  renderCollectionEl
}

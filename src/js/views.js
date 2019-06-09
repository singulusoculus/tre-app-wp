import { initPrevList, getListData, removeListItem, loadList, sortListData } from './list'
import { getFilters } from './filters'
import { initPrevRanking, getRankData, initRanking } from './rank'
import { initPrevResult, renderResult, getResultData } from './result'
import { setCategory, getCategory } from './category'
import { setCurrentStep, getCurrentStep } from './step'
import { addBGGItemToList, filterBGGCollection, getBGGCollectionData, saveBGGCollection } from './bgg-collection'
import { setDBListInfo, setDBListInfoType, dbGetUserLists, dbLoadUserList, dbDeleteUserList, clearDBListInfo, getDBListInfo } from './database'
import { updateLocalStorageSaveDataItem, setReloadInfo } from './functions'

// //////////////////////////////////////////////////////////////////////
// // PREVIOUS SESSION
// //////////////////////////////////////////////////////////////////////

const renderPreviousSession = () => {
  const prevData = JSON.parse(localStorage.getItem('saveData'))

  const containerEl = document.querySelector('.resume-session-container')
  containerEl.textContent = ''

  if (prevData !== null) {
    const step = prevData.step
    const data = prevData.data

    if (Object.keys(data).length > 0 && step !== 'Start') {
      const containerEl = document.querySelector('.resume-session-container')

      const rowEl = document.createElement('div')
      rowEl.classList.add('row')

      const colEl = document.createElement('div')
      colEl.classList.add('col', 's12', 'm8', 'offset-m2', 'l6', 'offset-l3')

      const cardEl = document.createElement('div')
      cardEl.classList.add('card', 'blue-grey', 'darken-1')

      const contentEl = document.createElement('div')
      contentEl.classList.add('card-content', 'white-text')

      const textEl = document.createElement('p')
      textEl.classList.add('center-align')
      textEl.textContent = `You have a previous ${step} session available. Want to resume?`

      const actionEl = document.createElement('div')
      actionEl.classList.add('card-action', 'center-align')

      const linkEl = document.createElement('a')
      linkEl.textContent = 'Resume'
      linkEl.href = '#'

      const dismissEl = document.createElement('a')
      dismissEl.href = '#'
      dismissEl.textContent = 'Discard'

      linkEl.addEventListener('click', () => {
        const prevData = JSON.parse(localStorage.getItem('saveData'))
        const step = prevData.step
        const data = prevData.data
        const category = prevData.category
        const dbListInfo = prevData.dbListInfo

        setDBListInfo(dbListInfo)
        if (step === 'List') {
          initPrevList(category, data)
        } else if (step === 'Rank') {
          initPrevRanking(category, data)
        } else if (step === 'Result') {
          initPrevResult(category, data)
        }
      })

      dismissEl.addEventListener('click', () => {
        const element = document.querySelector('.resume-session-container')
        element.classList.add('hide')
        element.setAttribute('style', 'border-bottom: none')

        // clear localStorage on Discard
        localStorage.removeItem('saveData')
        localStorage.removeItem('rankDataHistory')
      })

      actionEl.appendChild(linkEl)
      actionEl.appendChild(dismissEl)

      contentEl.appendChild(textEl)

      cardEl.appendChild(contentEl)
      cardEl.appendChild(actionEl)

      colEl.appendChild(cardEl)

      rowEl.appendChild(colEl)

      containerEl.appendChild(rowEl)
      containerEl.setAttribute('style', 'border-bottom: 1px solid rgba(160,160,160,0.2)')
      containerEl.classList.remove('hide')
    }
  }
}

// //////////////////////////////////////////////////////////////////////
// // RENDER LIST DATA
// //////////////////////////////////////////////////////////////////////

const renderListData = () => {
  const data = getListData()
  const filters = getFilters()
  const count = data.length

  const listInfoEl = document.querySelector('#list-info')
  listInfoEl.textContent = `Your List: ${count} items`

  // Pulse the list section if items are added and it hasn't been clicked yet
  const listHeader = document.querySelector('.list-header')
  const clicked = document.querySelector('.list-header').classList.contains('clicked')

  if (count > 0 && !clicked) {
    listHeader.classList.add('pulse-bc')
  } else {
    listHeader.classList.remove('pulse-bc')
  }

  const listEl = document.querySelector('#list-items')

  // filter based on text input
  let filteredList = data.filter((item) => item.name.toLowerCase().includes(filters.searchText.toLowerCase()))
  // sort the list
  filteredList = sortListData(filteredList, 'alphabetical')

  listEl.innerHTML = ''

  if (filteredList.length > 0) {
    filteredList.forEach((item) => {
      const itemEl = generateListDataDOM(item)
      listEl.appendChild(itemEl)
    })
    listEl.classList.add('collection')
  }
}

// Generate DOM for each item in createList
const generateListDataDOM = (item) => {
  const itemEl = document.createElement('li')
  itemEl.classList.add('collection-item')

  const itemNameEl = document.createElement('span')
  itemNameEl.textContent = item.name

  const iconEl = document.createElement('a')
  iconEl.classList.add('secondary-content')
  iconEl.href = '#!'
  iconEl.innerHTML = '<i class="material-icons">delete</i>'
  iconEl.addEventListener('click', (e) => {
    removeListItem(item.id)
    renderListData()
  })

  itemEl.appendChild(itemNameEl)
  itemEl.appendChild(iconEl)

  return itemEl
}

// //////////////////////////////////////////////////////////////////////
// // RENDER BGG DATA
// //////////////////////////////////////////////////////////////////////

const renderBGGCollection = () => {
  const listInfoEl = document.querySelector('.bgg-collection-info')
  const listEl = document.querySelector('.bgg-collection')
  const bggData = getBGGCollectionData()
  const totalCount = bggData.length

  const addedList = bggData.filter((item) => item.addedToList !== false)
  const addedCount = addedList.length

  const filteredList = filterBGGCollection()

  const filteredCount = filteredList.length
  listInfoEl.textContent = `Total: ${totalCount} | Added: ${addedCount} | Filtered: ${filteredCount} `

  document.querySelector('#bgg-add-selected').innerHTML = `<i class="material-icons right">add</i>Add ${filteredCount} Games`

  listEl.innerHTML = ''

  filteredList.forEach((item) => {
    const itemEl = generateBGGCollectionDOM(item)
    listEl.appendChild(itemEl)
  })
  listEl.classList.add('collection')
  saveBGGCollection()
}

const generateBGGCollectionDOM = (item) => {
  const itemEl = document.createElement('li')
  itemEl.classList.add('collection-item')

  const itemNameEl = document.createElement('span')
  itemNameEl.textContent = item.name

  const iconEl = document.createElement('a')
  iconEl.classList.add('secondary-content')
  iconEl.href = '#!'
  iconEl.innerHTML = '<i class="material-icons">add</i>'
  iconEl.addEventListener('click', (e) => {
    addBGGItemToList(item.id)
    renderBGGCollection()
    renderListData()
  })

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
// // BUTTON CONTROLS / UI ELEMENTS
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

// Help Text
const showHelpText = (step) => {
  const textEls = document.querySelectorAll('.help__text-item')
  textEls.forEach((el) => {
    el.classList.add('hide')
  })

  const activeTextEl = document.querySelector(`.help__text--${step}`)
  activeTextEl.classList.remove('hide')
}

const updateTabIndicator = () => {
  const tabs = M.Tabs.getInstance(document.querySelector('#step-tabs'))
  tabs.updateTabIndicator()
}

// Tooltip Control
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

const fadeInSpinner = () => {
  jQuery('.loading').fadeIn()
}

const fadeOutSpinner = () => {
  jQuery('.loading').fadeOut()
}

// //////////////////////////////////////////////////////////////////////
// // SECTION CONTROLS
// //////////////////////////////////////////////////////////////////////

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
// // SHOW SECTIONS
// //////////////////////////////////////////////////////////////////////

const showStartSection = (source) => {
  document.querySelector('#list-category-select').value = 0
  M.FormSelect.init(document.querySelector('#list-category-select'))
  setCategory(0)
  setCurrentStep('Start')
  renderPreviousSession()
  disableStepTab('list', 'rank', 'result')
  showTab('start')
  document.querySelector('.bgg-section').classList.add('hide')
  showHelpText('start')
  setupSaveLogin()

  // Clears result database link
  setDBListInfoType('result', { id: 0 })
  setDBListInfoType('userResult', { id: 0, desc: '' })
}

const showListSection = (source) => {
  if (source === 'Rank') {
    const data = getRankData()
    let list
    // filter out potential deleted items
    if (data.deletedItems) {
      list = data.masterList.filter((e) => data.deletedItems.indexOf(data.masterList.indexOf(e)) < 0, data.deletedItems)
    } else {
      list = data.masterList
    }
    loadList(list)
  } else if (source === 'Result') {
    const data = getResultData()
    loadList(data)
  }

  // Clears result database link
  setDBListInfoType('result', { id: 0 })
  setDBListInfoType('userResult', { id: 0, desc: '' })

  enableStepTab('list')
  disableStepTab('rank', 'result')

  const category = getCategory()
  const categorySelectEl = document.querySelector('#list-category-select')
  categorySelectEl.value = category
  M.FormSelect.init(categorySelectEl)
  const categoryName = categorySelectEl.selectedOptions[0].innerHTML
  document.querySelector('.current-list-category').innerHTML = `Category: ${categoryName}`
  // Show BGG section if category is Board Games
  if (categoryName === 'Board Games') {
    document.querySelector('.bgg-section').classList.remove('hide')
  }

  const list = getListData()
  if (list.length > 0) {
    enableStepTab('rank')
    enableNextButton()
    enableListSave()
  }

  showTab('list')
  showHelpText('list')
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
    showHelpText('rank')
  }
  document.querySelector('.next-rank').classList.remove('next--visible')
}

const showResultSection = (source) => {
  enableStepTab('result', 'rank', 'list')
  renderResult()

  showTab('result')
  showHelpText('result')
}

// //////////////////////////////////////////////////////////////////////
// // STEP TAB CONTROLS
// //////////////////////////////////////////////////////////////////////

const selectTab = (tab) => {
  const tabs = M.Tabs.getInstance(document.querySelector('#step-tabs'))
  tabs.select(`${tab}-container`)
}

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

  const newActiveSection = document.querySelector(`.${tab}-container`)
  newActiveSection.classList.add('active')
  newActiveSection.removeAttribute('style', 'display: none')

  const tabs = document.querySelector('#step-tabs')
  M.Tabs.init(tabs)
  updateTabIndicator()
  sectionTransition(tab)
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

const setupSaveLogin = async () => {
  const myListsEl = document.querySelector('.my-lists')
  myListsEl.textContent = ''
  const accountMenuEl = document.querySelector('#account-dropdown')
  accountMenuEl.textContent = ''
  const sideNavEl = document.querySelector('#sidenav__account')
  sideNavEl.textContent = ''

  if (getUserID() === 0) {
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

    // Set up Account Menu
    const liLogInEl = document.createElement('li')
    const aLogInEl = document.createElement('a')
    aLogInEl.classList.add('modal-trigger', 'account-login')
    aLogInEl.setAttribute('href', '#login-modal')
    aLogInEl.textContent = 'Log In'
    liLogInEl.appendChild(aLogInEl)
    accountMenuEl.appendChild(liLogInEl.cloneNode(true))

    // SideNav
    sideNavEl.appendChild(liLogInEl.cloneNode(true))

    clearDBListInfo()
    const update = getDBListInfo()
    const prevData = JSON.parse(localStorage.getItem('saveData'))
    if (prevData) {
      updateLocalStorageSaveDataItem('dbListInfo', update)
    }
  } else {
    renderMyLists()
    setupSaveButtons()

    // Set up Account Menu
    const liLogInEl = document.createElement('li')
    const aLogOutEl = document.createElement('a')
    aLogOutEl.setAttribute('href', 'http://localhost:8080/wordpress/wp-login.php?action=logout')
    aLogOutEl.textContent = 'Log Out'
    aLogOutEl.classList.add('account-log-out')
    liLogInEl.appendChild(aLogOutEl)

    const liMyListsEl = document.createElement('li')
    const aMyListsEl = document.createElement('a')
    aMyListsEl.setAttribute('href', '#!')
    aMyListsEl.classList.add('account-my-lists')
    aMyListsEl.textContent = 'My Lists'
    liMyListsEl.appendChild(aMyListsEl)

    accountMenuEl.appendChild(liLogInEl.cloneNode(true))
    accountMenuEl.appendChild(liMyListsEl.cloneNode(true))

    // SideNav
    sideNavEl.appendChild(liLogInEl.cloneNode(true))
    sideNavEl.appendChild(liMyListsEl.cloneNode(true))

    const accountMyLists = document.querySelectorAll('.account-my-lists')
    accountMyLists.forEach((el) => {
      el.addEventListener('click', () => {
        showMyLists()
      })
    })

    const accountLogOut = document.querySelectorAll('.account-log-out')
    accountLogOut.forEach((el) => {
      el.addEventListener('click', () => {
        setReloadInfo('logout')
      })
    })
  }
}

const showMyLists = () => {
  const step = getCurrentStep()

  if (step !== 'Start') {
    showStartSection()
  }

  M.Collapsible.getInstance(document.querySelector('#start-sections')).open(1)
}

const renderMyLists = async () => {
  const myListsEl = document.querySelector('.my-lists')
  // get My Lists data and populate My Lists section
  const data = await dbGetUserLists()

  myListsEl.textContent = ''

  const templateLists = data[0]
  const progressLists = data[1]
  const resultLists = data[2]

  // Create Logout button
  const btnEl = document.createElement('a')
  const iEl = document.createElement('i')
  btnEl.classList.add('waves-effect', 'waves-light', 'btn', 'center-align')
  btnEl.setAttribute('id', 'my-lists-logout-btn')
  btnEl.setAttribute('href', 'http://localhost:8080/wordpress/wp-login.php?action=logout')
  // btnEl.setAttribute('href', 'http://rankingengine.pubmeeple.com/wp-login.php?action=logout')
  btnEl.textContent = 'Log Off'
  iEl.classList.add('material-icons', 'right')
  iEl.textContent = 'account_circle'

  btnEl.appendChild(iEl)
  myListsEl.appendChild(btnEl)

  // Templates
  if (templateLists.length > 0) {
    const templateHeaders = ['Created', 'Last Save', 'Items', 'Desc', '']
    const templateTable = createTableElement('templates', templateHeaders, templateLists)
    myListsEl.appendChild(templateTable)
  }

  // Progress
  if (progressLists.length > 0) {
    const progressHeaders = ['Saved', 'Items', '% Comp', 'Desc', '']
    const progressTable = createTableElement('progress', progressHeaders, progressLists)
    myListsEl.appendChild(progressTable)
  }

  // Results
  if (resultLists.length > 0) {
    const resultsHeaders = ['Completed', 'Items', 'Desc', '']
    const resultsTable = createTableElement('results', resultsHeaders, resultLists)
    myListsEl.appendChild(resultsTable)
  }

  const allListsLength = templateLists.length + progressLists.length + resultLists.length

  if (allListsLength === 0) {
    myListsEl.textContent = 'You have not saved any lists yet.'
  }
}

const setupSaveButtons = () => {
  // Set Save button targets to Save Modal
  const saveButtons = document.querySelectorAll('.save-btn')
  saveButtons.forEach((el) => {
    el.setAttribute('href', '#save-modal')
  })
}

const createTableElement = (type, headers, rows) => {
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
  rows.forEach((row) => {
    const trEl = document.createElement('tr')
    const items = Object.values(row)
    const itemID = items[0]
    trEl.classList.add(`${type}-${itemID}`)
    items.slice(1).forEach((item) => {
      const tdEl = document.createElement('td')
      tdEl.textContent = item
      trEl.appendChild(tdEl)
    })
    trEl.addEventListener('click', () => {
      // Go get the clicked list from the database and init the right step
      dbLoadUserList(type, itemID)
    })
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

export {
  renderPreviousSession,
  showListSection,
  showRankSection,
  showResultSection,
  renderListData,
  showStartSection,
  selectTab,
  sectionTransition,
  enableStepTab,
  disableStepTab,
  enableNextButton,
  enableListSave,
  disableListSave,
  setupSaveLogin,
  custConfirm,
  renderBGGCollection,
  showTab,
  renderMyLists,
  setupSaveButtons,
  fadeInSpinner,
  fadeOutSpinner,
  showMyLists
}

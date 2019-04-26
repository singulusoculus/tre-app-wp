import { initPrevList, getListData, sortListData, removeListItem, loadList } from './list'
import { getFilters } from './filters'
import { initPrevRanking, getRankData, initRanking } from './rank'
import { initPrevResult, renderResult, getResultData } from './result'
import { setCategory, getCategory } from './category'
import { setCurrentStep, getCurrentStep } from './step'

const renderPreviousSession = () => {
  const prevData = JSON.parse(localStorage.getItem('saveData'))

  const containerEl = document.querySelector('.resume-session-container')
  containerEl.textContent = ''

  if (prevData !== null) {
    const step = prevData.step
    const data = prevData.data
    const category = prevData.category

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

const renderListData = () => {
  const data = getListData()
  const filters = getFilters()
  const count = data.length

  const listInfoEl = document.querySelector('#list-info')
  listInfoEl.textContent = `${count} items on this list`

  const listEl = document.querySelector('#list-items')

  // filter based on text input
  let filteredList = data.filter((item) => item.name.toLowerCase().includes(filters.searchText.toLowerCase()))
  // sort the list
  filteredList = sortListData(filteredList, filters.sortBy)

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

// Help Text
const showHelpText = (step) => {
  const textEls = document.querySelectorAll('.help__text-item')
  textEls.forEach((el) => {
    el.classList.add('hide')
  })

  const activeTextEl = document.querySelector(`.help__text--${step}`)
  activeTextEl.classList.remove('hide')
}

// Custom Confirm modal
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

  document.querySelector('#alert-cancel-btn').addEventListener('click', (e) => {
    e.stopPropagation()
    instance.close()
  })
}

// Handle Tab Clicks
const handleClickStart = () => {
  const source = getCurrentStep()
  const category = document.querySelector('#list-category-select').value
  if (source !== 'Start' || category !== '0') {
    const message = 'This will clear any progress and start the process from the beginning. Want to continue?'
    custConfirm(message, showStartSection, source)
  }
}

const handleClickList = () => {
  const source = getCurrentStep()
  if (source === 'Rank') {
    const message = 'This will terminate the ranking process and allow you to edit the list. Want to continue?'
    custConfirm(message, showListSection, source)
  } else if (source === 'Result') {
    const message = 'This will clear your results and allow you to edit the list. Want to continue?'
    custConfirm(message, showListSection, source)
  }
}

const handleClickRank = () => {
  const source = getCurrentStep()
  if (source === 'List') {
    const listData = getListData()
    if (listData.length > 0) {
      const message = 'Are you ready to start ranking this list?'
      custConfirm(message, showRankSection, source)
    }
  } else if (source === 'Rank') {
    const message = 'Do you really want to restart ranking this list?'
    custConfirm(message, showRankSection, source)
  } else if (source === 'Result') {
    const message = 'Do you want to start ranking this list again?'
    custConfirm(message, showRankSection, source)
  }
}

// Show Sections
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

  enableStepTab('list')
  disableStepTab('rank', 'result')

  const categoryName = document.querySelector('#list-category-select').selectedOptions[0].innerHTML
  document.querySelector('.current-list-category').innerHTML = `Category: ${categoryName}`
  // Show BGG section is category is Board Games
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

// Step Tab Control
const selectTab = (tab) => {
  const tabs = M.Tabs.getInstance(document.querySelector('#step-tabs'))
  tabs.select(`${tab}-container`)

  history.replaceState(null, null, ' ')
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

  history.replaceState(null, null, ' ')
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

let userID = 0

const setupSaveLogin = () => {
  const myListsEl = document.querySelector('.my-lists')

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
  } else {
    // get My Lists data and populate My Lists section
    myListsEl.textContent = 'Lists retrieved'

    // Set Save button targets to Save Modal
    const saveButtons = document.querySelectorAll('.save-btn')
    saveButtons.forEach((el) => {
      el.setAttribute('href', '#save-modal')
    })
  }
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
  handleClickStart,
  handleClickList,
  handleClickRank
}

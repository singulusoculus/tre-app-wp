import { initPrevList, getListData, sortListData, removeListItem } from './list'
import { getFilters } from './filters'
import { initPrevRanking } from './rank'
import { initPrevResult } from './result'

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
  listInfoEl.textContent = `You have ${count} items on this list`

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

// Section Visibility
const showStartSection = (source) => {
  disableStepTab('list', 'rank', 'result')
  sectionTransition('start')

  if (source !== 'tab') {
    selectTab('start')
  }

  document.querySelector('.bgg-section').classList.add('hide')
}

const showListSection = (source) => {
  enableStepTab('list')
  disableStepTab('rank', 'result')
  sectionTransition('list')

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
  }

  if (source !== 'tab') {
    selectTab('list')
  }
}

const showRankSection = (source) => {
  enableStepTab('list', 'rank')
  disableStepTab('result')
  sectionTransition('rank')

  document.querySelector('.next-rank').classList.remove('next--visible')

  if (source !== 'tab') {
    selectTab('rank')
  }
}

const showResultSection = (source) => {
  enableStepTab('result', 'rank', 'list')
  sectionTransition('result')

  if (source !== 'tab') {
    selectTab('result')
  }
}

// Step Tab Control
const selectTab = (tab) => {
  const tabs = M.Tabs.getInstance(document.querySelector('#step-tabs'))
  tabs.select(`${tab}-container`)

  history.replaceState(null, null, ' ')
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
  const stepLink = document.querySelector(`#${step}-tab-link`)
  if (stepLink.classList.contains('tooltipped')) {
    const tip = M.Tooltip.getInstance(stepLink)
    tip.destroy()
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
  enableNextButton
}

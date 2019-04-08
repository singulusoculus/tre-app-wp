import { initPrevList, getListData, sortListData, removeListItem } from './list'
import { getFilters } from './filters'
import { initPrevRanking } from './rank'
import { initPrevResult } from './result'
import { getCategory } from './category'

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
      textEl.textContent = `You have a previous ${step} session available. Want to continue?`

      const actionEl = document.createElement('div')
      actionEl.classList.add('card-action', 'center-align')

      const linkEl = document.createElement('a')
      linkEl.textContent = 'Continue'
      linkEl.href = '#'

      const dismissEl = document.createElement('a')
      dismissEl.href = '#'
      dismissEl.textContent = 'Dismiss'

      linkEl.addEventListener('click', () => {
        if (step === 'List') {
          initPrevList(category, data)
          // showListSection()
        } else if (step === 'Rank') {
          initPrevRanking(category, data)
          // showRankSection()
        } else if (step === 'Result') {
          initPrevResult(category, data)
          onShowResultSection()
        }
      })

      dismissEl.addEventListener('click', () => {
        const element = document.querySelector('.resume-session-container')
        element.classList.add('hide')
        element.setAttribute('style', 'border-bottom: none')

        // this could eventually clear the session data from LocalStorage
      })

      actionEl.appendChild(linkEl)
      actionEl.appendChild(dismissEl)

      // contentEl.appendChild(titleEl)
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
const showStepTab = (step) => {
  document.querySelector(`#${step}-tab`).classList.add('step-tab--available')
  updateTabIndicator()
  openTooltip(`${step}`)

  const nextButton = document.querySelector('.next')
  const once = { once: true }

  nextButton.classList.add('next--visible')

  if (step === 'list') {
    nextButton.addEventListener('click', (e) => {
      selectTab('list')
      updateTabIndicator()
    }, once)
  } else if (step === 'rank') {
    nextButton.addEventListener('click', (e) => {
      selectTab('rank')
      updateTabIndicator()
    }, once)
  } else if (step === 'result') {
    nextButton.addEventListener('click', (e) => {
      selectTab('result')
      updateTabIndicator()
    }, once)
  }

  if (step === 'rank') {
    closeTooltip('list')
  }
}

const hideStepTab = (step) => {
  closeTooltip(`${step}`)
  document.querySelector(`#${step}-tab`).classList.remove('step-tab--available')
  updateTabIndicator()

  const nextButton = document.querySelector('.next')
  nextButton.classList.remove('next--visible')
}

// Section Visibility
const onShowStartSection = () => {
  hideStepTab('list')
  hideStepTab('rank')
  hideStepTab('result')

  const category = getCategory()
  if (category !== 0) {
    showStepTab('list')
  }
}

const onShowListSection = () => {
  hideStepTab('rank')
  hideStepTab('result')

  closeTooltip('list')

  const list = getListData()
  if (list.length > 0) {
    showStepTab('rank')
  }
}

const onShowRankSection = () => {
  hideStepTab('result')
  closeTooltip('rank')
}

const onShowResultSection = () => {
  closeTooltip('result')

  document.querySelector('.next').classList.remove('next--visible')
}

// Step Tab Control
const updateTabIndicator = () => {
  const tabs = M.Tabs.getInstance(document.querySelector('#step-tabs'))
  tabs.updateTabIndicator()
}

const selectTab = (tab) => {
  const tabs = M.Tabs.getInstance(document.querySelector('#step-tabs'))
  tabs.select(`${tab}-container`)
}

// Tooltip Control
const openTooltip = (step) => {
  const tip = M.Tooltip.getInstance(document.querySelector(`#${step}-tab-link`))
  tip.open()
}

const closeTooltip = (step) => {
  const tip = M.Tooltip.getInstance(document.querySelector(`#${step}-tab-link`))
  tip.close()
}

const toggleListItems = () => {
  const listItemsEl = document.querySelector('#list-items-wrapper')

  if (listItemsEl.classList.contains('hide')) {
    listItemsEl.classList.remove('hide')
  } else {
    listItemsEl.classList.add('hide')
  }
}

export {
  renderPreviousSession,
  onShowListSection,
  onShowRankSection,
  onShowResultSection,
  renderListData,
  onShowStartSection,
  updateTabIndicator,
  selectTab,
  openTooltip,
  showStepTab,
  hideStepTab,
  closeTooltip,
  toggleListItems
}

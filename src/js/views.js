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

    if (data.length > 0 && step !== 'Start') {
      const containerEl = document.querySelector('.resume-session-container')
      const textEl = document.createElement('p')
      const buttonEl = document.createElement('button')

      textEl.textContent = `You have a ${step} session available. Want to continue?`
      buttonEl.textContent = 'Continue'

      buttonEl.addEventListener('click', () => {
        if (step === 'List') {
          initPrevList(category, data)
          showListSection()
        } else if (step === 'Rank') {
          initPrevRanking(category, data)
          showRankSection()
        } else if (step === 'Result') {
          initPrevResult(category, data)
          showResultSection()
        }
      })

      containerEl.appendChild(textEl)
      containerEl.appendChild(buttonEl)
    }
  }
}

const renderListData = () => {
  const data = getListData()
  const filters = getFilters()

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
  }
}

// Generate DOM for each item in createList
const generateListDataDOM = (item) => {
  const itemEl = document.createElement('div')
  const textEl = document.createElement('p')
  const buttonEl = document.createElement('button')

  textEl.textContent = item.name
  buttonEl.textContent = 'X'
  buttonEl.classList.add('create-list-delete')
  buttonEl.addEventListener('click', (e) => {
    removeListItem(item.id)
    renderListData()
  })

  textEl.appendChild(buttonEl)
  itemEl.appendChild(textEl)

  return itemEl
}

// Nav visibility
const showListNav = () => {
  document.querySelector('#step-nav__list').classList.add('step-nav--available')
}

const showRankNav = () => {
  document.querySelector('#step-nav__list').classList.add('step-nav--available')
  document.querySelector('#step-nav__rank').classList.add('step-nav--available')
}

const showResultNav = () => {
  document.querySelector('#step-nav__list').classList.add('step-nav--available')
  document.querySelector('#step-nav__rank').classList.add('step-nav--available')
  document.querySelector('#step-nav__result').classList.add('step-nav--available')
}

const hideRankNav = () => {
  document.querySelector('#step-nav__rank').classList.remove('step-nav--available')
}

const hideListNav = () => {
  document.querySelector('#step-nav__list').classList.remove('step-nav--available')
}

const hideResultNav = () => {
  document.querySelector('#step-nav__result').classList.remove('step-nav--available')
}

// Section Visibility
const showStartSection = () => {
  document.querySelector('#list-container').classList.add('inactive')
  document.querySelector('#list-container').classList.remove('active')
  document.querySelector('#rank-container').classList.add('inactive')
  document.querySelector('#rank-container').classList.remove('active')
  document.querySelector('#result-container').classList.add('inactive')
  document.querySelector('#result-container').classList.remove('active')
  document.querySelector('#start-container').classList.add('active')
  document.querySelector('#start-container').classList.remove('inactive')
  document.querySelector('#step-nav__start').classList.add('step-nav--current')
  document.querySelector('#step-nav__list').classList.remove('step-nav--current')
  document.querySelector('#step-nav__rank').classList.remove('step-nav--current')
  document.querySelector('#step-nav__result').classList.remove('step-nav--current')
  hideListNav()
  hideRankNav()
  hideResultNav()

  const category = getCategory()
  if (category !== 0) {
    showListNav()
  }
}

const showListSection = () => {
  document.querySelector('#list-container').classList.add('acitve')
  document.querySelector('#list-container').classList.remove('inactive')
  document.querySelector('#rank-container').classList.add('inactive')
  document.querySelector('#rank-container').classList.remove('active')
  document.querySelector('#result-container').classList.add('inactive')
  document.querySelector('#result-container').classList.remove('active')
  document.querySelector('#start-container').classList.add('inactive')
  document.querySelector('#start-container').classList.remove('active')
  document.querySelector('#step-nav__start').classList.remove('step-nav--current')
  document.querySelector('#step-nav__list').classList.add('step-nav--current')
  document.querySelector('#step-nav__rank').classList.remove('step-nav--current')
  document.querySelector('#step-nav__result').classList.remove('step-nav--current')

  hideRankNav()
  hideResultNav()

  const list = getListData()
  if (list.length > 0) {
    showRankNav()
  }
}

const showRankSection = () => {
  document.querySelector('#list-container').classList.add('inactive')
  document.querySelector('#list-container').classList.remove('active')
  document.querySelector('#rank-container').classList.add('active')
  document.querySelector('#rank-container').classList.remove('inactive')
  document.querySelector('#result-container').classList.add('inactive')
  document.querySelector('#result-container').classList.remove('active')
  document.querySelector('#start-container').classList.add('inactive')
  document.querySelector('#start-container').classList.remove('active')
  document.querySelector('#step-nav__start').classList.remove('step-nav--current')
  document.querySelector('#step-nav__list').classList.remove('step-nav--current')
  document.querySelector('#step-nav__rank').classList.add('step-nav--current')
  document.querySelector('#step-nav__result').classList.remove('step-nav--current')

  hideResultNav()
  showRankNav()
}

const showResultSection = () => {
  document.querySelector('#list-container').classList.add('inactive')
  document.querySelector('#list-container').classList.remove('active')
  document.querySelector('#rank-container').classList.add('inactive')
  document.querySelector('#rank-container').classList.remove('active')
  document.querySelector('#result-container').classList.add('active')
  document.querySelector('#result-container').classList.remove('inactive')
  document.querySelector('#start-container').classList.add('inactive')
  document.querySelector('#start-container').classList.remove('active')
  document.querySelector('#step-nav__start').classList.remove('step-nav--current')
  document.querySelector('#step-nav__list').classList.remove('step-nav--current')
  document.querySelector('#step-nav__rank').classList.remove('step-nav--current')
  document.querySelector('#step-nav__result').classList.add('step-nav--current')

  showResultNav()
}

export {
  renderPreviousSession,
  showListSection,
  showRankSection,
  showResultSection,
  renderListData,
  showStartSection,
  showListNav,
  hideListNav,
  showRankNav,
  hideRankNav,
  showResultNav
}

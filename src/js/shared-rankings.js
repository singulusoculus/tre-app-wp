import { dbGetTemplateListData, dbGetSharedResults, dbGetTimesRanked, dbSetShareResultsFlag } from './shared-rankings-db'
import { renderTableRows, initDataTable } from './functions'
import { fadeInSpinner, fadeOutSpinner } from './spinner'

let templateListData = {}

const setTemplateListData = (data) => {
  templateListData = data[0]

  templateListData.results_public = parseInt(templateListData.results_public)
  templateListData.shared = parseInt(templateListData.shared)
  templateListData.template_id = parseInt(templateListData.template_id)
  templateListData.wpuid = parseInt(templateListData.wpuid)
}

jQuery(document).ready(() => {
  // get uuid param
  const urlParam = checkForURLParam()

  if (urlParam) {
    initSharedRankingURLParam(urlParam.id)
  }
})

const checkForURLParam = () => {
  const url = new URL(window.location.href)
  if (url.search === '') {
    return false
  } else {
    return {
      url,
      search: url.search,
      type: url.search.substring(1, 2),
      id: url.search.substring(3)
    }
  }
}

const initSharedRankingURLParam = async (urlParam) => {
  fadeInSpinner()
  const data = await dbGetTemplateListData(urlParam)
  setTemplateListData(data)
  const wpuid = templateListData.wpuid
  const resultsPublic = templateListData.results_public === 1 ? true : false

  // if the shared_results_public flag is false then get the current user id
  const currentUser = getUserID()
  if (currentUser === wpuid) {
    renderOptions()
    document.querySelector('#results-public-switch').addEventListener('change', () => {
      handleResultsShareSwitchChange()
    })
  }

  if (!resultsPublic && currentUser === wpuid) {
    renderResults()
  } else if (!resultsPublic && currentUser !== wpuid) {
    alert(`You do not have access to view these results`)
  } else if (resultsPublic) {
    renderResults()
  }
}

const renderResults = async () => {
  // get results
  const results = await dbGetSharedResults(templateListData.template_id)
  // get times ranked
  const timesRankedArray = await dbGetTimesRanked(templateListData.template_id)
  const timesRanked = timesRankedArray[0].total_lists
  // render times ranked
  document.querySelector('#count-lists').textContent = timesRanked

  let newResults = []
  results.forEach((item, index) => {
    newResults.push({ rank: index + 1, ...item })
  })
  // render results
  renderTableRows(newResults, 'rankings-at')
  initDataTable('rankings-at')
  document.querySelector('#page-header').textContent = `Results for: ${templateListData.template_desc}`
}

const handleResultsShareSwitchChange = () => {
  const value = document.querySelector('#results-public-switch').checked ? 1 : 0
  // Send value to database --need the list id
  const listId = templateListData.template_id
  dbSetShareResultsFlag(listId, value)
  templateListData.results_public = value
}

const renderOptions = () => {
  const wrapperEl = document.querySelector('.options-section')
  // heading
  const headingEl = document.createElement('h4')
  headingEl.classList.add('section-title', 'center-align')
  headingEl.textContent = 'Options:'

  wrapperEl.appendChild(headingEl)

  // public switch
  const switchWrapperEl = document.createElement('div')
  switchWrapperEl.classList.add('switch', 'center-align')

  const pEl = document.createElement('p')
  pEl.classList.add('bgg-filter-heading')
  pEl.textContent = 'Make Results Public'
  switchWrapperEl.appendChild(pEl)

  const labelEl = document.createElement('label')
  const inputEl = document.createElement('input')
  inputEl.setAttribute('id', 'results-public-switch')
  inputEl.setAttribute('type', 'checkbox')
  const resultsPublic = templateListData.results_public === 1 || false
  inputEl.checked = resultsPublic

  const spanEl = document.createElement('span')
  spanEl.classList.add('lever')

  const inputHTML = inputEl.outerHTML
  const spanHTML = spanEl.outerHTML

  labelEl.innerHTML = `Off ${inputHTML} ${spanHTML} On`

  switchWrapperEl.appendChild(labelEl)
  wrapperEl.appendChild(switchWrapperEl)

  const dividerEl = document.createElement('div')
  dividerEl.classList.add('divider-sm')

  wrapperEl.appendChild(dividerEl)

}

jQuery(document).ajaxStop(() => {
  M.AutoInit()
  fadeOutSpinner()
})

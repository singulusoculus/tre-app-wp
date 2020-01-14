import { fadeInSpinner, fadeOutSpinner } from './spinner'
import { numWithCommas, initDataTable, renderTable } from './tables'

const initRankings = () => {
  fadeInSpinner()

  // Get Totals Info
  // getTotals
  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getTotals'
  }, (data, status) => {
    const dataParsed = JSON.parse(data)
    renderRankingsTotals(dataParsed)
  })

  // Get Years
  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getYears'
  }, (data, status) => {
    const dataParsed = JSON.parse(data)
    const years = []
    dataParsed.forEach((e) => {
      years.push(e.period)
    })
    console.log(years)
    const selectEl = document.querySelector('#year-select')
    selectEl.innerHTML = ''
    years.forEach((year) => {
      // create element in select
      const optionEl = document.createElement('option')
      optionEl.value = year
      optionEl.textContent = year
      selectEl.appendChild(optionEl)
    })
    M.FormSelect.init(document.querySelector('#year-select'))
    const selectInstance = M.FormSelect.getInstance(document.querySelector('#year-select'))
    const selectWrapper = selectInstance.wrapper
    selectWrapper.classList.add('complete')
  })

  // Get Top Games Lists
  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getTopGamesAll'
  }, (data, status) => {
    const parsedData = JSON.parse(data)

    renderTable('rankings-at', ['Rank', 'Game', 'Score'], parsedData)
    initDataTable('rankings-at')
  })

  // getTopGamesYear
  const year = new Date().getFullYear()
  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getTopGamesYear',
    year
  }, (data, status) => {
    const parsedData = JSON.parse(data)
    renderTable('rankings-y', ['Rank', 'Game', 'Score'], parsedData)
    initDataTable('rankings-y')
  })

  // getTopGamesD30
  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getTopGamesD30'
  }, (data, status) => {
    const parsedData = JSON.parse(data)
    renderTable('rankings-d30', ['Rank', 'Game', 'Score'], parsedData)
    initDataTable('rankings-d30')
  })
}

jQuery(document).ready(() => {
  initRankings()

  // handleYearSelectChange
  document.querySelector('#year-select').addEventListener('change', () => {
    handleYearSelectChange()
  })
})

jQuery(document).ajaxStop(() => {
  M.AutoInit()
  const indicators = document.querySelectorAll('.indicator')
  indicators.forEach((el) => {
    el.classList.add('green', 'darken-3')
  })

  const selectElements = document.querySelectorAll('.select-wrapper')
  selectElements.forEach((e) => {
    e.classList.add('complete')
  })

  fadeOutSpinner()
})

const renderRankingsTotals = (data) => {
  const atLists = numWithCommas(data[0].TotalLists)
  const atItems = numWithCommas(data[1].TotalItems)

  const cyLists = numWithCommas(data[2].TotalLists)
  const cyItems = numWithCommas(data[3].TotalItems)

  const d30Lists = numWithCommas(data[4].TotalLists)
  const d30Items = numWithCommas(data[5].TotalItems)

  document.querySelector('#at-count-lists').textContent = atLists
  document.querySelector('#at-count-items').textContent = atItems

  document.querySelector('#cy-count-lists').textContent = cyLists
  document.querySelector('#cy-count-items').textContent = cyItems

  document.querySelector('#d30-count-lists').textContent = d30Lists
  document.querySelector('#d30-count-items').textContent = d30Items
}

const handleYearSelectChange = () => {
  const year = document.querySelector('#year-select').value
  const yearTableWrapper = document.querySelector('#rankings-y-table-wrapper')
  yearTableWrapper.innerHTML = ''
  const yearListCount = document.querySelector('#cy-count-lists')
  const yearItemsCount = document.querySelector('#cy-count-items')
  yearListCount.textContent = '...'
  yearItemsCount.textContent = '...'
  fadeInSpinner()

  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getYearTotals',
    year
  }, (data, status) => {
    const dataParsed = JSON.parse(data)
    const lists = numWithCommas(dataParsed[0].TotalLists)
    const items = numWithCommas(dataParsed[1].TotalItems)

    document.querySelector('#cy-count-lists').textContent = lists
    document.querySelector('#cy-count-items').textContent = items
  })

  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getTopGamesYear',
    year
  }, (data, status) => {
    const parsedData = JSON.parse(data)

    const selectInstance = M.FormSelect.getInstance(document.querySelector('#year-select'))
    const selectWrapper = selectInstance.wrapper
    selectWrapper.classList.add('complete')

    renderTable('rankings-y', ['Rank', 'Game', 'Score'], parsedData)
    initDataTable('rankings-y')
    fadeOutSpinner()
  })
}

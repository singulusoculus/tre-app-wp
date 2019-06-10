import { fadeInSpinner, fadeOutSpinner } from './views'
import { numWithCommas, renderTableRows, initDataTable } from './functions'

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

  // Get Top Games Lists
  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getTopGamesAll'
  }, (data, status) => {
    const parsedData = JSON.parse(data)
    renderTableRows(parsedData, 'rankings-at')
    initDataTable('rankings-at')
  })

  // getTopGamesYear
  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getTopGamesYear'
  }, (data, status) => {
    const parsedData = JSON.parse(data)
    renderTableRows(parsedData, 'rankings-y')
    initDataTable('rankings-y')
  })

  // getTopGamesD30
  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getTopGamesD30'
  }, (data, status) => {
    const parsedData = JSON.parse(data)
    renderTableRows(parsedData, 'rankings-d30')
    initDataTable('rankings-d30')
  })
}

jQuery(document).ready(() => {
  initRankings()
})

jQuery(document).ajaxStop(() => {
  M.AutoInit()

  const indicators = document.querySelectorAll('.indicator')
  indicators.forEach((el) => {
    el.classList.add('green', 'darken-3')
  })

  fadeOutSpinner()
})

const renderRankingsTotals = (data) => {
  const totalLists = numWithCommas(data[0].TotalLists)
  const totalItems = numWithCommas(data[1].TotalItems)

  document.querySelector('#count-lists').textContent = totalLists
  document.querySelector('#count-items').textContent = totalItems
}


import { fadeInSpinner, fadeOutSpinner } from './views'
import { numWithCommas, renderTableRows, initDataTable } from './functions'

const initDashboard = () => {
  fadeInSpinner()

  // Get Totals Info
  // getTotals
  jQuery.post(getFilePath('/re-func/re-dashboard-functions.php'), {
    func: 'getTotals'
  }, (data, status) => {
    const dataParsed = JSON.parse(data)
    renderTotals(dataParsed)
  })

  // Get Top Games Lists
  jQuery.post(getFilePath('/re-func/re-dashboard-functions.php'), {
    func: 'getTopGamesAll'
  }, (data, status) => {
    const parsedData = JSON.parse(data)
    console.log(parsedData)
    renderTableRows(parsedData, 'rankings-at')
    initDataTable('rankings-at')
  })

  // getTopGamesYear
  jQuery.post(getFilePath('/re-func/re-dashboard-functions.php'), {
    func: 'getTopGamesYear'
  }, (data, status) => {
    const parsedData = JSON.parse(data)
    renderTableRows(parsedData, 'rankings-y')
    initDataTable('rankings-y')
  })

  // getTopGamesD30
  jQuery.post(getFilePath('/re-func/re-dashboard-functions.php'), {
    func: 'getTopGamesD30'
  }, (data, status) => {
    const parsedData = JSON.parse(data)
    renderTableRows(parsedData, 'rankings-d30')
    initDataTable('rankings-d30')
  })

  // getAllGamesApproved
  jQuery.post(getFilePath('/re-func/re-dashboard-functions.php'), {
    func: 'getAllGamesApproved'
  }, (data, status) => {
    const parsedData = JSON.parse(data)
    renderTableRows(parsedData, 'all-games')
    initDataTable('all-games')
  })
}

jQuery(document).ready(() => {
  initDashboard()

  // ////////////////////////////////////////////////////////////////////
  // Transfer Processes
  // ////////////////////////////////////////////////////////////////////

  document.querySelector('#progress-transfer').addEventListener('click', () => {
    handleProgressTransferClick()
  })

  document.querySelector('#user-result-transfer').addEventListener('click', () => {
    handleUserResultTransferClick()
  })

  document.querySelector('#result-transfer').addEventListener('click', () => {
    handleRankingResultsTransferClick()
  })

  document.querySelector('#combine-games-submit').addEventListener('click', () => {
    let oldItemID = document.querySelector('#old-game-id').value
    let newItemID = document.querySelector('#new-game-id').value

    fadeInSpinner()
    console.log('start combine')

    jQuery.post(getFilePath('/re-func/re-dashboard-functions.php'), {
      func: 'combineGames',
      olditemid: oldItemID,
      newitemid: newItemID
    }, (data, status) => {
      console.log('combine finish')
      jQuery('#all-games__table').DataTable().destroy()

      document.querySelector('#all-games__rows').innerHTML = ''

      console.log('start query')

      jQuery.post(getFilePath('/re-func/re-dashboard-functions.php'), {
        func: 'getAllGamesApproved'
      }, (data, status) => {
        console.log('finish query')
        const parsedData = JSON.parse(data)
        renderTableRows(parsedData, 'all-games')

        oldItemID = ''
        newItemID = ''
        fadeOutSpinner()
      })
    })
  })
})

jQuery(document).ajaxStop(() => {
  M.AutoInit()

  const indicators = document.querySelectorAll('.indicator')
  indicators.forEach((el) => {
    el.classList.add('green', 'darken-3')
  })

  fadeOutSpinner()
})

const renderTotals = (data) => {
  const totalUsers = numWithCommas(data[0].TotalUsers)
  const totalUsersD = numWithCommas(data[1].TotalUsers)
  const totalLists = numWithCommas(data[2].TotalLists)
  const totalListsD = numWithCommas(data[3].TotalLists)
  const totalItems = numWithCommas(data[4].TotalItems)
  const totalItemsD = numWithCommas(data[5].TotalItems)

  document.querySelector('#count-users').textContent = totalUsers
  document.querySelector('#count-users-prev').textContent = totalUsersD
  document.querySelector('#count-lists').textContent = totalLists
  document.querySelector('#count-lists-prev').textContent = totalListsD
  document.querySelector('#count-items').textContent = totalItems
  document.querySelector('#count-items-prev').textContent = totalItemsD
}

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

  // Get Periods for AT and Month history
  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getPeriods'
  }, (data, status) => {
    const dataParsed = JSON.parse(data)
    console.log(dataParsed)

    // All Time
    const atSelectEl = document.querySelector('#at-period-select')
    dataParsed.forEach((e) => {
      const optionEl = document.createElement('option')
      optionEl.value = e.period
      optionEl.textContent = e.nice_period
      atSelectEl.appendChild(optionEl)
    })
    M.FormSelect.init(document.querySelector('#at-period-select'))
    const atSelectInstance = M.FormSelect.getInstance(document.querySelector('#at-period-select'))
    const atSelectWrapper = atSelectInstance.wrapper
    atSelectWrapper.classList.add('complete')

    // Month
    const monthSelectEl = document.querySelector('#month-period-select')
    dataParsed.forEach((e) => {
      const optionEl = document.createElement('option')
      optionEl.value = e.period
      optionEl.textContent = e.nice_period
      monthSelectEl.appendChild(optionEl)
    })
    M.FormSelect.init(document.querySelector('#month-period-select'))
    const monthSelectInstance = M.FormSelect.getInstance(document.querySelector('#month-period-select'))
    const monthSelectWrapper = monthSelectInstance.wrapper
    monthSelectWrapper.classList.add('complete')
  })

  const currentYear = new Date().getFullYear()
  let currentMonth = new Date().getMonth() + 1
  if (currentMonth < 10) {
    currentMonth = `0${currentMonth}`
  }
  const currentPeriod = `${currentYear}${currentMonth}`
  console.log(currentPeriod)

  // Get Top Games Lists
  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getTopGamesAll',
    period: currentPeriod
  }, (data, status) => {
    const parsedData = JSON.parse(data)

    renderTable('rankings-at', ['Rank', 'Game', 'Score', 'Times Ranked'], parsedData)
    initDataTable('rankings-at')
  })

  // getTopGamesYear
  const year = new Date().getFullYear()
  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getTopGamesYear',
    year
  }, (data, status) => {
    const parsedData = JSON.parse(data)
    renderTable('rankings-y', ['Rank', 'Game', 'Score', 'Times Ranked'], parsedData)
    initDataTable('rankings-y')
  })

  // getTopGamesD30
  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getTopGamesD30',
    period: currentPeriod
  }, (data, status) => {
    const parsedData = JSON.parse(data)
    renderTable('rankings-d30', ['Rank', 'Game', 'Score', 'Times Ranked'], parsedData)
    initDataTable('rankings-d30')
  })
}

jQuery(document).ready(() => {
  initRankings()

  // handleYearSelectChange
  document.querySelector('#year-select').addEventListener('change', () => {
    handleYearSelectChange()
  })

  document.querySelector('#at-period-select').addEventListener('change', () => {
    handleAtSelectChange()
  })

  document.querySelector('#month-period-select').addEventListener('change', () => {
    handleMonthSelectChange()
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

  jQuery('#rankings-wrapper').fadeIn()
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

    renderTable('rankings-y', ['Rank', 'Game', 'Score', 'Times Ranked'], parsedData)
    initDataTable('rankings-y')

    const yearTab = document.querySelector('#tab-title-year')
    yearTab.textContent = `Year - ${year}`

    fadeOutSpinner()
  })
}

const handleAtSelectChange = () => {
  const period = document.querySelector('#at-period-select').value
  const atTableWrapper = document.querySelector('#rankings-at-table-wrapper')
  atTableWrapper.innerHTML = ''
  const atListCount = document.querySelector('#at-count-lists')
  const atItemsCount = document.querySelector('#at-count-items')
  atListCount.textContent = '...'
  atItemsCount.textContent = '...'
  fadeInSpinner()

  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getAtTotals',
    period
  }, (data, status) => {
    const dataParsed = JSON.parse(data)
    const lists = numWithCommas(dataParsed[0].TotalLists)
    const items = numWithCommas(dataParsed[1].TotalItems)

    document.querySelector('#at-count-lists').textContent = lists
    document.querySelector('#at-count-items').textContent = items
  })

  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getTopGamesAll',
    period
  }, (data, status) => {
    const parsedData = JSON.parse(data)

    const selectInstance = M.FormSelect.getInstance(document.querySelector('#at-period-select'))
    const selectWrapper = selectInstance.wrapper
    selectWrapper.classList.add('complete')

    renderTable('rankings-at', ['Rank', 'Game', 'Score', 'Times Ranked'], parsedData)
    initDataTable('rankings-at')

    fadeOutSpinner()
  })
}

const handleMonthSelectChange = () => {
  const period = document.querySelector('#month-period-select').value
  const atTableWrapper = document.querySelector('#rankings-d30-table-wrapper')
  atTableWrapper.innerHTML = ''
  const atListCount = document.querySelector('#d30-count-lists')
  const atItemsCount = document.querySelector('#d30-count-items')
  atListCount.textContent = '...'
  atItemsCount.textContent = '...'
  fadeInSpinner()

  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getMonthTotals',
    period
  }, (data, status) => {
    const dataParsed = JSON.parse(data)
    const lists = numWithCommas(dataParsed[0].TotalLists)
    const items = numWithCommas(dataParsed[1].TotalItems)

    document.querySelector('#d30-count-lists').textContent = lists
    document.querySelector('#d30-count-items').textContent = items
  })

  jQuery.post(getFilePath('/re-func/re-rankings-functions.php'), {
    func: 'getTopGamesD30',
    period
  }, (data, status) => {
    const parsedData = JSON.parse(data)

    const selectInstance = M.FormSelect.getInstance(document.querySelector('#month-period-select'))
    const selectWrapper = selectInstance.wrapper
    selectWrapper.classList.add('complete')

    renderTable('rankings-d30', ['Rank', 'Game', 'Score', 'Times Ranked'], parsedData)
    initDataTable('rankings-d30')

    fadeOutSpinner()
  })
}

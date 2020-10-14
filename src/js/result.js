import { showResultSection } from './views'
import { saveData } from './functions'
import { setCategory } from './category'
import { setCurrentStep } from './step'
import { getDBListInfo } from './database'
import { checkforImages, renderTopNine } from './top-nine'
import { renderTable } from './tables'
import { getRankData } from './rank'

let resultData = []

const initPrevResult = (category, data) => {
  resultData = data
  setCategory(category)
  setCurrentStep('result')
  saveData(resultData)
  showResultSection()
}

const getResultData = () => resultData

const setResultData = (data) => {
  resultData = data
}

const renderResult = () => {
  const rankedItems = []

  resultData.forEach((item) => {
    rankedItems.push({ rank: item.rank, name: item.name })
  })

  renderTable('results', ['Rank', 'Item'], rankedItems)

  // Initialize data table buttons - after results are populated
  jQuery('#results__table').DataTable({
    'destroy': true,
    'paging': false,
    dom: '<"floatright"B>rt',
    buttons: [
      'copyHtml5',
      'excelHtml5',
      'csvHtml5'
    ]
  })

  // Change Styling of DataTable Buttons
  const dtButtons = document.querySelectorAll('.dt-button')
  dtButtons.forEach((btn) => {
    btn.classList.add('waves-effect', 'waves-light', 'btn')
  })

  // Fix Rank column width
  document.querySelector('#results__header > tr > :first-child').setAttribute('style', 'width: 18%')

  // Setup Save Button
  const userResultID = getDBListInfo().userResult.id
  const saveButtonEl = document.querySelector('#save-results')
  if (userResultID === 0) {
    saveButtonEl.classList.remove('disabled')
  } else {
    saveButtonEl.classList.add('disabled')
  }

  // Add title to table
  const resultDesc = getDBListInfo().userResult.desc
  const tableEl = document.querySelector('#results__table_wrapper')
  const spanEl = document.createElement('span')
  spanEl.classList.add('section-title', 'result-desc')
  spanEl.textContent = resultDesc !== '' ? `${resultDesc}` : 'Your Results:'
  tableEl.prepend(spanEl)

  // Support Us Toast
  const toastHTML = `<span class="center-align support-us">Hey, nice list!</span><span class="center-align">If you found this tool useful please consider putting something in our tip jar.</span><div class="prev-toast-btns"><a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=pubmeeple@gmail.com&item_name=Friends+of+the+Pub&item_number=For+RE&currency_code=USD" target="_blank"><button class="btn-flat toast-action support-paypal">Paypal</button></a><button class="btn-flat toast-action support-dismiss">Dismiss</button></div>`
  M.toast({ html: toastHTML, displayLength: 'stay', classes: 'actionable-toast', inDuration: 600 })

  // BGG Support
  const rankData = getRankData()
  if (rankData.listSource === 'bgg' || rankData.listSource === 'mixed') {
    const toastBggHTML = `<span class="center-align support-bgg">Ranking your games looked good!</span><span class="center-align">The images you saw were provided by BGG. Please consider supporting our friends at BGG!</span><div class="prev-toast-btns"><a href="https://boardgamegeek.com/support" target="_blank"><button class="btn-flat toast-action support-paypal">Support</button></a><button class="btn-flat toast-action support-bgg-dismiss">Dismiss</button></div>`
    M.toast({ html: toastBggHTML, displayLength: 'stay', classes: 'actionable-toast', inDuration: 1000 })
  }

  const supportDismissEls = document.querySelectorAll('.support-dismiss')
  supportDismissEls.forEach((el) => {
    el.addEventListener('click', () => {
      const toastEl = document.querySelector('.support-us').parentElement
      const toastInstance = M.Toast.getInstance(toastEl)
      toastInstance.dismiss()
    })
  })

  const supportBggDismissEls = document.querySelectorAll('.support-bgg-dismiss')
  supportBggDismissEls.forEach((el) => {
    el.addEventListener('click', () => {
      const toastEl = document.querySelector('.support-bgg').parentElement
      const toastInstance = M.Toast.getInstance(toastEl)
      toastInstance.dismiss()
    })
  })

  // Remove top nine button if it exists
  const currentTopNineButtonEl = document.querySelector('.top-nine-btn')
  if (currentTopNineButtonEl) {
    currentTopNineButtonEl.remove()
  }

  // Check for top nine images
  const images = checkforImages(resultData)
  // Top Nine Button
  if (images) {
    const topNineButtonEl = document.createElement('a')
    topNineButtonEl.classList.add('waves-effect', 'waves-light', 'btn', 'top-nine-btn')
    topNineButtonEl.textContent = 'Top Nine'
    topNineButtonEl.addEventListener('click', () => {
      const topNineModal = M.Modal.getInstance(document.querySelector('#top-nine-modal'))
      topNineModal.open()
      try {
        jQuery('.top-nine-image').fadeOut(1, renderTopNine(images))
      } catch (e) {
        jQuery('.ball-loading.top-nine').fadeOut()
        const imageWrapper = document.querySelector('.image-wrapper')
        const pEl = document.createElement('p')
        pEl.textContent = 'Sorry, we were unable to generate your top nine image. You can try again by closing this dialog and clicking the Top Nine button again'
        imageWrapper.appendChild(pEl)
        console.log(e)
        throw new Error('Unable to render top nine Image')
      }
    })

    const topNineIconEl = document.createElement('i')
    topNineIconEl.classList.add('material-icons', 'right')
    topNineIconEl.textContent = 'grid_on'

    topNineButtonEl.appendChild(topNineIconEl)
    const rankingOptionsEl = document.querySelector('.result-options')
    rankingOptionsEl.prepend(topNineButtonEl)
  }
}

export { initPrevResult, renderResult, getResultData, setResultData }

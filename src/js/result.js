import { showResultSection, setupSaveLogin } from './views'
import { saveData, renderTable } from './functions'
import { setCategory } from './category'
import { setCurrentStep } from './step'
import { getDBListInfo } from './database'
import { checkforImages, renderTopNine } from './top-nine'

let resultData

const initPrevResult = (category, data) => {
  resultData = data
  setCategory(category)
  setCurrentStep('Result')
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

  const userResultID = getDBListInfo().userResult.id

  // Put save button in line with other buttons
  const saveButtonEl = document.createElement('a')
  saveButtonEl.classList.add('waves-effect', 'waves-light', 'btn', 'modal-trigger', 'save-btn')
  if (userResultID === 0) {
    saveButtonEl.classList.remove('disabled')
  } else {
    saveButtonEl.classList.add('disabled')
  }
  saveButtonEl.addEventListener('click', () => {
    document.querySelector('#login-form-button').setAttribute('from', '')
    document.querySelector('#login-form-button').setAttribute('from', 'save')
  })
  saveButtonEl.setAttribute('id', 'save-results')
  saveButtonEl.setAttribute('href', '#login-modal')
  saveButtonEl.textContent = 'Save'
  const saveIconEl = document.createElement('i')
  saveIconEl.classList.add('material-icons', 'right')
  saveIconEl.textContent = 'save'
  saveButtonEl.appendChild(saveIconEl)
  const dtButtonsEl = document.querySelector('.dt-buttons')
  dtButtonsEl.appendChild(saveButtonEl)

  saveButtonEl.addEventListener('click', () => {
    document.querySelector('#save-list-btn').textContent = 'Save'
    document.querySelector('#save-description').value = ''
  })

  // Add title to table
  const resultDesc = getDBListInfo().userResult.desc
  const tableEl = document.querySelector('#results__table_wrapper')
  const spanEl = document.createElement('span')
  spanEl.classList.add('section-title', 'result-desc')
  spanEl.textContent = resultDesc !== '' ? `${resultDesc}` : 'Your Results:'
  tableEl.prepend(spanEl)

  setupSaveLogin()

  // Support Us Toast
  const toastHTML = `<span class="center-align">Hey, nice list!</span><span class="center-align">If you found this tool useful please consider putting something in our tip jar.</span><div class="prev-toast-btns"><a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=pubmeeple@gmail.com&item_name=Friends+of+the+Pub&item_number=For+RE&currency_code=USD" target="_blank"><button class="btn-flat toast-action support-paypal">Paypal</button></a><button class="btn-flat toast-action support-dismiss">Dismiss</button></div>`
  M.toast({ html: toastHTML, displayLength: 'stay', classes: 'actionable-toast', inDuration: 600 })

  const supportDismissEls = document.querySelectorAll('.support-dismiss')
  supportDismissEls.forEach((el) => {
    el.addEventListener('click', () => {
      M.Toast.dismissAll()
    })
  })

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
    })

    const topNineIconEl = document.createElement('i')
    topNineIconEl.classList.add('material-icons', 'right')
    topNineIconEl.textContent = 'grid_on'

    topNineButtonEl.appendChild(topNineIconEl)
    dtButtonsEl.appendChild(topNineButtonEl)
    renderTopNine(images)
  }
}

export { initPrevResult, renderResult, getResultData, setResultData }

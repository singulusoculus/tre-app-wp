import { showResultSection, setupSaveLogin } from './views'
import { saveData } from './functions'
import { setCategory } from './category'
import { setCurrentStep } from './step'

let resultData

const initPrevResult = (category, data) => {
  resultData = data
  setCategory(category)
  setCurrentStep('Result')
  saveData(resultData)
  renderResult(resultData)
  showResultSection()
}

const getResultData = () => resultData

const setResultData = (data) => {
  resultData = data
}

const renderResult = () => {
  let str = ''
  // let str1 = ''

  str += `<table id="results-table-details" class="table-responsive"><thead><tr><th class="rank-column" scope="col">Rank</th><th scope="col">Item</th></tr></thead><tbody>`

  for (let i = 0; i < resultData.length; i++) {
    str += `<tr><td>${resultData[i].rank}</td><td>${resultData[i].name}</td></tr>`
  }

  str += `</tbody></table>`
  // str1 = comparisons ? `<p class="text-center">Total Comparisons: ${comparisons}</p>` : ''

  // document.getElementById('total-comparisons').innerHTML = str1
  document.getElementById('results-table').innerHTML = str

  // Initialize data table buttons - after results are populated
  jQuery('#results-table-details').DataTable({
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
  document.querySelector('.rank-column').setAttribute('style', 'width: 10%')

  // Put save button in line with other buttons
  const saveButtonEl = document.createElement('a')
  saveButtonEl.classList.add('waves-effect', 'waves-light', 'btn', 'modal-trigger', 'save-btn')
  saveButtonEl.setAttribute('id', 'save-results')
  saveButtonEl.setAttribute('href', '#login-modal')
  saveButtonEl.textContent = 'Save'
  const saveIconEl = document.createElement('i')
  saveIconEl.classList.add('material-icons', 'right')
  saveIconEl.textContent = 'save'
  saveButtonEl.appendChild(saveIconEl)
  const dtButtonsEl = document.querySelector('.dt-buttons')
  dtButtonsEl.appendChild(saveButtonEl)

  setupSaveLogin()

  saveData(resultData)
}

export { initPrevResult, renderResult, getResultData, setResultData }

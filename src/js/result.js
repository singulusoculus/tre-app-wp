import { showResultSection, showResultNav, selectTab } from './views'
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
}

const getResultData = () => resultData

const renderResult = (data, comparisons) => {
  setCurrentStep('Result')
  resultData = data

  let str = ''
  let str1 = ''

  str += `<table id="results-table-details" class="table table-bordered table-sm"><thead class="thead-dark"><tr><th style="width: 10%" scope="col">Rank</th><th scope="col">Item</th></tr></thead><tbody>`

  for (let i = 0; i < resultData.length; i++) {
    str += `<tr><td>${resultData[i].rank}</td><td>${resultData[i].name}</td></tr>`
  }

  str += `</tbody></table>`
  str1 = comparisons ? `<p class="text-center">Total Comparisons: ${comparisons}</p>` : ''

  // document.getElementById('total-comparisons').innerHTML = str1
  document.getElementById('results-table').innerHTML = str

  saveData(resultData)

  showResultNav()
  selectTab('result')
}

export { initPrevResult, renderResult, getResultData }

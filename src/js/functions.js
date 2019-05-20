import { getCategory } from './category'
import { getCurrentStep, setCurrentStep } from './step'
import { showTab, renderPreviousSession, setupSaveLogin } from './views'
import { initPrevList } from './list'
import { initPrevRanking } from './rank'
import { initPrevResult } from './result'
import { saveTemplateData, saveProgressData } from './database'

const initRankingEngine = () => {
  initMaterializeComponents()
  showTab('start')
  setCurrentStep('Start')

  const loginReload = sessionStorage.getItem('loginReload')
  if (loginReload) {
    const prevData = JSON.parse(localStorage.getItem('saveData'))
    const data = prevData.data
    const category = prevData.category
    const loginStep = prevData.step
    if (loginStep === 'List') {
      initPrevList(category, data)
    } else if (loginStep === 'Rank') {
      initPrevRanking(category, data)
    } else if (loginStep === 'Result') {
      initPrevResult(category, data)
    }
    const modal = M.Modal.getInstance(document.querySelector('#save-modal'))
    modal.open()
    sessionStorage.removeItem('loginReload')
  } else {
    renderPreviousSession()
  }

  setupSaveLogin()
}

const handleClickSave = () => {
  const currentStep = getCurrentStep()
  const saveDesc = document.querySelector('#save-description').value

  if (saveDesc === '') {
    alert('Please add adescription for your list')
  } else {
    if (currentStep === 'List') {
      saveTemplateData(saveDesc)
    } else if (currentStep === 'Rank') {
      saveProgressData(saveDesc)
    } else if (currentStep === 'Result') {
      // save results
    }
  }
}

const disableArrowKeyScroll = () => {
  // Disable arrow keys from scrolling
  window.addEventListener('keydown', (e) => {
    // space and arrow keys
    if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault()
    }
  }, false)
}

const initMaterializeComponents = () => {
  M.AutoInit()

  const elems = document.querySelectorAll('input[type=range]')
  M.Range.init(elems)

  const modalOptions = { dismissible: false }
  const alertModal = document.querySelector('#alert-modal')
  const restartModal = document.querySelector('#restart-modal')
  M.Modal.init(alertModal, modalOptions)
  M.Modal.init(restartModal, modalOptions)
}

const saveData = (data) => {
  const category = getCategory()
  const step = getCurrentStep()

  const obj = {
    category,
    step,
    data
  }
  localStorage.setItem('saveData', JSON.stringify(obj))
}

// Changes XML to JSON
const xmlToJson = (xml) => {
  // Create the return object
  let obj = {}

  if (xml.nodeType === 1) { // element
    // do attributes
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {}
      for (let j = 0; j < xml.attributes.length; j++) {
        let attribute = xml.attributes.item(j)
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue
      }
    }
  } else if (xml.nodeType === 3) { // text
    obj = xml.nodeValue
  }

  // do children
  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      let item = xml.childNodes.item(i)
      let nodeName = item.nodeName
      if (typeof (obj[nodeName]) === 'undefined') {
        obj[nodeName] = xmlToJson(item)
      } else {
        if (typeof (obj[nodeName].push) === 'undefined') {
          let old = obj[nodeName]
          obj[nodeName] = []
          obj[nodeName].push(old)
        }
        obj[nodeName].push(xmlToJson(item))
      }
    }
  }
  return obj
}

export { disableArrowKeyScroll, saveData, xmlToJson, initMaterializeComponents, initRankingEngine, handleClickSave }

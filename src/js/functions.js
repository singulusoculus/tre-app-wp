import { getCategory } from './category'
import { getCurrentStep, setCurrentStep } from './step'
import { showTab, renderPreviousSession, setupSaveLogin, custConfirm, showStartSection, showListSection, showRankSection, showMyLists } from './views'
import { initPrevList, getListData } from './list'
import { initPrevRanking } from './rank'
import { initPrevResult, getResultData } from './result'
import { dbSaveTemplateData, dbSaveProgressData, dbUpdateTemplateData, setDBListInfo, getDBListInfo, dbSaveUserResultData } from './database'

const initRankingEngine = () => {
  initMaterializeComponents()
  showTab('start')
  setCurrentStep('Start')

  let reload = sessionStorage.getItem('reload')
  if (reload) {
    reload = JSON.parse(reload)
    const step = reload.step
    const type = reload.type

    const prevData = JSON.parse(localStorage.getItem('saveData'))
    const data = prevData.data
    const category = prevData.category
    const loginStep = prevData.step
    const dbListInfo = prevData.dbListInfo

    if (step !== 'Start') {
      if (loginStep === 'List') {
        initPrevList(category, data)
      } else if (loginStep === 'Rank') {
        initPrevRanking(category, data)
      } else if (loginStep === 'Result') {
        initPrevResult(category, data)
      }
      if (type === 'login') {
        const modal = M.Modal.getInstance(document.querySelector('#save-modal'))
        modal.open()
        setDBListInfo(dbListInfo)
      }
    } else {
      showMyLists()
    }
  }

  renderPreviousSession()
  setupSaveLogin()
  sessionStorage.removeItem('reload')
}

const handleClickSave = (e) => {
  const currentStep = getCurrentStep()
  const saveDesc = document.querySelector('#save-description').value

  if (saveDesc === '') {
    alert('Please add a description for your list')
    e.stopPropagation()
  } else {
    if (currentStep === 'List') {
      dbSaveTemplateData(saveDesc)
    } else if (currentStep === 'Rank') {
      // This handles both insert and update db opeations depending on if they have a current list.
      dbSaveProgressData(saveDesc)
    } else if (currentStep === 'Result') {
      dbSaveUserResultData(saveDesc)
    }
  }
}

const handleClickUpdate = (e) => {
  const saveDesc = document.querySelector('#save-description').value

  if (saveDesc === '') {
    alert('Please add a description for your list')
    e.stopPropagation()
  } else {
    dbUpdateTemplateData(saveDesc)
  }
}

const handleClickSaveList = () => {
  const listInfo = getDBListInfo()
  if (listInfo.template.id > 0) {
    document.querySelector('#update-list-btn').classList.remove('hide')
    document.querySelector('#save-list-btn').textContent = 'Save New'
    document.querySelector('#save-description').value = listInfo.template.desc
    document.querySelector('#save-description-label').classList.add('active')
  } else {
    document.querySelector('#update-list-btn').classList.add('hide')
    document.querySelector('#save-list-btn').textContent = 'Save'
    document.querySelector('#save-description').value = ''
    document.querySelector('#save-description-label').classList.remove('active')
  }
}

const handleClickSaveRank = () => {
  const progressID = getDBListInfo().progress.id
  const listInfo = getDBListInfo()

  document.querySelector('#update-list-btn').classList.add('hide')

  if (progressID > 0) {
    document.querySelector('#save-list-btn').textContent = 'Update'
    document.querySelector('#save-description').value = listInfo.progress.desc
    document.querySelector('#save-description-label').classList.add('active')
  } else {
    document.querySelector('#save-list-btn').textContent = 'Save'
    document.querySelector('#save-description').value = ''
    document.querySelector('#save-description-label').classList.remove('active')
  }
}

// //////////////////////////////////////////////////////////////////////
// // HANDLE TAB CLICKS
// //////////////////////////////////////////////////////////////////////

const handleClickStart = () => {
  const source = getCurrentStep()
  const category = document.querySelector('#list-category-select').value
  if (source !== 'Start' || category !== '0') {
    const message = 'This will clear any progress and start the process from the beginning. Want to continue?'
    custConfirm(message, showStartSection, source)
  }
}

const handleClickList = () => {
  const source = getCurrentStep()
  if (source === 'Rank') {
    const message = 'This will terminate the ranking process and allow you to edit the list. Want to continue?'
    custConfirm(message, showListSection, source)
  } else if (source === 'Result') {
    const message = 'This will clear your results and allow you to edit the list. Want to continue?'
    custConfirm(message, showListSection, source)
  }
}

const handleClickRank = () => {
  const source = getCurrentStep()
  if (source === 'List') {
    const listData = getListData()
    if (listData.length > 0) {
      const message = 'Are you ready to start ranking this list?'
      custConfirm(message, showRankSection, source)
    }
  } else if (source === 'Rank') {
    const message = 'Do you really want to restart ranking this list?'
    custConfirm(message, showRankSection, source)
  } else if (source === 'Result') {
    const instance = M.Modal.getInstance(document.querySelector('#restart-modal'))
    instance.open()
    const data = getResultData()
    // Set List Size - total-list-size
    document.querySelector('.total-list-size').textContent = `Complete: ${data.length} Items`
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
  const dbListInfo = getDBListInfo()
  // const rankDataHistory = getRankDataHistory()

  // if (step === 'List') {
  //   data = getListData()
  // } else if (step === 'Rank') {
  //   data = getRankData()
  // } else if (step === 'Result') {
  //   data = getResultData()
  // }

  const obj = {
    category,
    step,
    dbListInfo,
    data
  }
  localStorage.setItem('saveData', JSON.stringify(obj))
}

const updateLocalStorageSaveDataItem = (type, update) => {
  const saveData = JSON.parse(localStorage.getItem('saveData'))

  let category = saveData.category
  let step = saveData.step
  let dbListInfo = saveData.dbListInfo
  let data = saveData.data

  if (type === 'category') {
    category = update
  } else if (type === 'step') {
    step = update
  } else if (type === 'dbListInfo') {
    dbListInfo = update
  } else if (type === data) {
    data = update
  }

  const obj = {
    category,
    step,
    dbListInfo,
    data
  }

  localStorage.setItem('saveData', JSON.stringify(obj))
}

// Changes XML to JSON
const xmlToJson = (xml) => {
  // Create the return object
  let obj = {}

  if (xml.nodeType === 1) { // element
    // attributes
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

  // children
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

const setReloadInfo = (type) => {
  const data = {
    type,
    step: getCurrentStep()
  }
  const dataJSON = JSON.stringify(data)
  sessionStorage.setItem('reload', dataJSON)
}

export { disableArrowKeyScroll,
  saveData,
  xmlToJson,
  initMaterializeComponents,
  initRankingEngine,
  handleClickSave,
  handleClickUpdate,
  handleClickStart,
  handleClickList,
  handleClickRank,
  updateLocalStorageSaveDataItem,
  setReloadInfo,
  handleClickSaveList,
  handleClickSaveRank
}

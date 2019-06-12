import { getCategory } from './category'
import { getCurrentStep, setCurrentStep } from './step'
import { showTab, renderPreviousSession, setupSaveLogin, custConfirm, showStartSection, showListSection, showRankSection, showMyLists, custMessage } from './views'
import { initPrevList, getListData } from './list'
import { initPrevRanking } from './rank'
import { initPrevResult, getResultData } from './result'
import { dbSaveTemplateData, dbSaveProgressData, dbUpdateTemplateData, setDBListInfo, getDBListInfo, dbSaveUserResultData, dbGetTopTenYear } from './database'

const initRankingEngine = () => {
  initMaterializeComponents()
  showTab('start')
  setCurrentStep('Start')
  dbGetTopTenYear()

  let reload = sessionStorage.getItem('reload')
  if (reload !== null) {
    reload = JSON.parse(reload)
    const step = reload.step
    const type = reload.type

    const prevData = JSON.parse(localStorage.getItem('saveData'))
    if (prevData) {
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
        if (type === 'login-save') {
          const modal = M.Modal.getInstance(document.querySelector('#save-modal'))
          modal.open()
          setDBListInfo(dbListInfo)
        }
      }
    }
    if (type === 'login-my-lists') {
      showMyLists()
    }
  } else {
    renderPreviousSession()
  }
  
  setupSaveLogin()
  sessionStorage.removeItem('reload')
}

const handleClickSave = (e) => {
  const currentStep = getCurrentStep()
  const saveDesc = document.querySelector('#save-description').value

  if (saveDesc === '') {
    custMessage('Please add a description for your list')
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
    custMessage('Please add a description for your list')
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

// //////////////////////////////////////////////////////////////////////
// // MISC
// //////////////////////////////////////////////////////////////////////

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

  const bottomSheetOptions = { inDuration: 500, outDuration: 500 }
  const bottomSheetModal = document.querySelector('#account-modal')
  M.Modal.init(bottomSheetModal, bottomSheetOptions)
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
  } else if (type === 'data') {
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

const numWithCommas = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

const renderTableRows = (data, table) => {
  const rowsEl = document.querySelector(`#${table}__rows`)

  data.forEach((row) => {
    const trEl = document.createElement('tr')
    const items = Object.values(row)

    items.forEach((item) => {
      const tdEl = document.createElement('td')
      tdEl.textContent = item
      trEl.appendChild(tdEl)
    })
    rowsEl.appendChild(trEl)
  })
}

const initDataTable = (table) => {
  jQuery(`#${table}__table`).DataTable({
    dom: 'lfBtip',
    buttons: [
      'copyHtml5',
      'excelHtml5',
      'csvHtml5'
    ]
  })

  // DataTables fixes
  var el = document.querySelector('select:not(.complete)')
  M.FormSelect.init(el)
  el.classList.add('complete')

  const dtWrapper = document.querySelector(`#${table}__table_wrapper`)

  const lengthEl = jQuery(`#${table}__table_length`).detach()
  const filterEl = jQuery(`#${table}__table_filter`).detach()

  document.querySelector('.dt-buttons:not(.complete)').setAttribute('id', `${table}__table_buttons`)
  const buttonEl = jQuery(`#${table}__table_buttons`).detach()

  const div = document.createElement('div')
  div.classList.add(`${table}-dt-elements-wrapper`, 'dt-elements-wrapper')

  dtWrapper.prepend(div)

  const specDiv = jQuery(`.${table}-dt-elements-wrapper`)

  lengthEl.appendTo(specDiv)
  buttonEl.appendTo(specDiv)
  filterEl.appendTo(specDiv)

  document.querySelector(`#${table}__table_buttons`).classList.add('complete')

  // Fix select

  document.querySelector('.select-wrapper:not(.complete)').setAttribute('id', `${table}-select-wrapper`)

  const selectEl = jQuery(`#${table}-select-wrapper`).detach()
  jQuery(`#${table}__table_length.dataTables_length > label`).remove()

  const newLengthEl = jQuery(`#${table}__table_length`)
  selectEl.appendTo(newLengthEl)

  document.querySelector(`#${table}-select-wrapper`).classList.add('complete')

  // Fix search

  document.querySelector(`#${table}__table_filter > label > input`).setAttribute('placeholder', 'Search')
  const searchEl = jQuery(`#${table}__table_filter > label > input`).detach()
  jQuery(`#${table}__table_filter > label`).remove()

  const newFilterEl = jQuery(`#${table}__table_filter`)

  searchEl.appendTo(newFilterEl)
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
  handleClickSaveRank,
  numWithCommas,
  renderTableRows,
  initDataTable
}

import { getCategory, setCategory } from './category'
import { getCurrentStep, setCurrentStep } from './step'
import { showTab, renderPreviousSessionToast, setupSaveLogin, custConfirm, showStartSection, showListSection, showRankSection, showMyLists, custMessage } from './views'
import { initPrevList, getListData, estimateTotalComparisons, setListData } from './list'
import { initPrevRanking } from './rank'
import { initPrevResult, getResultData } from './result'
import { dbSaveTemplateData, dbSaveProgressData, dbUpdateTemplateData, setDBListInfo, getDBListInfo, dbSaveUserResultData, dbGetTopTenYear, dbGetSharedList } from './database'
import { getParentList, setParentList } from './list-sharing'

const initRankingEngine = async () => {
  initMaterializeComponents()
  showTab('start')
  setCurrentStep('Start')
  dbGetTopTenYear()

  // Check for a previous session on reload from a login/logout
  // If it does, load the correct step and data.
  // If it was generated from a save modal, show the save modal. If it was from My Lists then show My Lists
  let reload = checkForReload()
  if (reload) {
    initRankingEngineReload(reload)
  } else { // If it is not a reload, check for a url parameter or a previous session
    // If a URL parameter exists, process it and load the list
    const param = checkForURLParam()
    if (param) {
      initRankingEngineUrlParam(param)
    } else {
      // If a previous session exists then render a notification toast
      renderPreviousSessionToast()
    }
  }

  setupSaveLogin()
  sessionStorage.removeItem('reload')
}

const checkForReload = () => {
  const reload = sessionStorage.getItem('reload')
  if (reload === null) {
    return false
  } else {
    return reload
  }
}

const checkForURLParam = () => {
  const url = new URL(window.location.href)
  if (url.search === '') {
    return false
  } else {
    return {
      url,
      search: url.search,
      type: url.search.substring(1, 2),
      id: url.search.substring(3)
    }
  }
}

const initRankingEngineReload = async (reload) => {
  reload = JSON.parse(reload)
  const step = reload.step
  const type = reload.type

  const prevData = JSON.parse(localStorage.getItem('saveData'))
  if (prevData) {
    const data = prevData.data
    const category = prevData.category
    const loginStep = prevData.step
    const dbListInfo = prevData.dbListInfo
    const parentList = prevData.parentList

    if (step !== 'Start') {
      if (loginStep === 'List') {
        initPrevList(category, data)
      } else if (loginStep === 'Rank') {
        setParentList(parentList)
        initPrevRanking(category, data)
      } else if (loginStep === 'Result') {
        initPrevResult(category, data)
      }
      if (type === 'login-save') {
        const userID = await getUserID()
        if (userID > 0) {
          const modal = M.Modal.getInstance(document.querySelector('#save-modal'))
          modal.open()
          setDBListInfo(dbListInfo)
        } else {
          const instance = M.Modal.getInstance(document.querySelector('#login-modal'))
          instance.open()
        }
      }
    }
  }
  if (type === 'login-my-lists') {
    showMyLists()
  }
}

const initRankingEngineUrlParam = async (param) => {
  try {
    if (param.type === 'r') {
      // console.log(`loading result: ${param.id}`)
      const result = await dbGetSharedList(param.id, 'Result')
      const category = parseInt(result[0].list_category)
      const data = JSON.parse(result[0].result_data)
      initPrevResult(category, data)
      document.querySelector('#save-results').classList.add('disabled')
      removeURLParam()
    } else if (param.type === 't') {
      // console.log(`loading template to rank: ${param.id}`)
      const template = await dbGetSharedList(param.id, 'Template')
      const category = parseInt(template[0].list_category)
      const data = JSON.parse(template[0].template_data)
      const templateId = parseInt(template[0].template_id)

      // check localStorage for templateId
      const lsParentLists = JSON.parse(localStorage.getItem('str'))

      let listIndex = -1

      if (lsParentLists !== null) {
        listIndex = lsParentLists.indexOf(templateId)
      }

      if (listIndex > -1) {
        custMessage(`You've already ranked this list`)
        removeURLParam()
      } else if (listIndex === -1) {
        setListData(data)
        setCategory(category)
        setParentList(templateId)
        showRankSection('List')
        removeURLParam()
      }
    } else if (param.type === 'p') {
      // console.log(`loading progress list: ${param.id}`)
      const progress = await dbGetSharedList(param.id, 'Progress')
      const category = parseInt(progress[0].list_category)
      const data = JSON.parse(progress[0].progress_data)
      initPrevRanking(category, data)
      removeURLParam()
    }
  } catch (error) {
    custMessage('The specified list does not exist or is not shared. Please check the id and try again')
    throw new Error('The specified list does not exist or is not shared')
  }
}

const removeURLParam = () => {
  window.history.pushState('object or string', 'Title', window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1))
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

const handleClickSaveList = async () => {
  const userID = await getUserID()
  if (userID === 0) {
    setupSaveLogin()
    const instance = M.Modal.getInstance(document.querySelector('#login-modal'))
    instance.open()
  } else {
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
    const instance = M.Modal.getInstance(document.querySelector('#save-modal'))
    instance.open()
  }
}

const handleClickSaveResult = async () => {
  const userID = await getUserID()
  if (userID === 0) {
    const instance = M.Modal.getInstance(document.querySelector('#login-modal'))
    instance.open()
  } else {
    const instance = M.Modal.getInstance(document.querySelector('#save-modal'))
    instance.open()
  }
}

const handleClickSaveRank = async () => {
  const userID = await getUserID()
  if (userID === 0) {
    setupSaveLogin()
    const instance = M.Modal.getInstance(document.querySelector('#login-modal'))
    instance.open()
  } else {
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
    const instance = M.Modal.getInstance(document.querySelector('#save-modal'))
    instance.open()
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
  let message = ''

  if (source === 'Rank') {
    message = 'This will terminate the ranking process and allow you to edit the list. Want to continue?'
    custConfirm(message, showListSection, source)
  } else if (source === 'Result') {
    message = 'This will clear your results and allow you to edit the list. Want to continue?'
    custConfirm(message, showListSection, source)
  }
}

const handleClickRank = () => {
  const source = getCurrentStep()
  if (source === 'List') {
    const listData = getListData()
    const listLength = listData.length
    if (listLength > 0) {
      const comparisonEstimate = estimateTotalComparisons(listData)
      const message = `You are about to rank ${listLength} items. This will take an estimated ${comparisonEstimate} comparisons. Do you want to continue?`
      // const message = 'Are you ready to start ranking this list?'
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

const getUserID = () => {
  return new Promise((resolve, reject) => {
    jQuery.post(getFilePath('/re-func/re-functions.php'), {
      func: 'getWPUserID'
    }, (data, status) => {
      if (status === 'success') {
        resolve(parseInt(data))
        // resolve(0)
      }
    })
  })
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

  const bottomSheetOptions = { inDuration: 500, outDuration: 500 }
  const bottomSheetModal = document.querySelector('#account-modal')
  M.Modal.init(bottomSheetModal, bottomSheetOptions)
}

const saveData = (data) => {
  const category = getCategory()
  const step = getCurrentStep()
  const dbListInfo = getDBListInfo()
  const parentList = getParentList()

  const obj = {
    category,
    step,
    dbListInfo,
    data,
    parentList
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

const setReloadInfo = (type) => {
  const data = {
    type,
    step: getCurrentStep()
  }
  const dataJSON = JSON.stringify(data)
  sessionStorage.setItem('reload', dataJSON)
}

const numWithCommas = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

// columns is an array of column names for the table
// expects a wrapper div to exist with an id of tableName'-table-wrapper'
const renderTableHeader = (columns, tableName) => {
  const tableWrapperEl = document.querySelector(`#${tableName}-table-wrapper`)

  tableWrapperEl.innerHTML = ''

  const tableEl = document.createElement('table')
  tableEl.setAttribute('id', `${tableName}__table`)
  tableEl.classList.add('table-responsive')

  const theadEl = document.createElement('thead')
  theadEl.setAttribute('id', `${tableName}__header`)
  const trEl = document.createElement('tr')

  columns.forEach((col) => {
    const thEl = document.createElement('th')
    thEl.setAttribute('scope', 'col')
    thEl.textContent = col
    trEl.appendChild(thEl)
  })

  theadEl.appendChild(trEl)
  tableEl.appendChild(theadEl)

  const tbodyEl = document.createElement('tbody')
  tbodyEl.setAttribute('id', `${tableName}__rows`)

  tableEl.appendChild(tbodyEl)

  tableWrapperEl.appendChild(tableEl)
}

// data is an array of objects with the correct number of items as there are columns in the table
const renderTableRows = (data, tableName) => {
  const rowsEl = document.querySelector(`#${tableName}__rows`)

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

const renderTable = (tableName, columns, rows) => {
  renderTableHeader(columns, tableName)
  renderTableRows(rows, tableName)
}

const initDataTable = (table) => {
  jQuery(`#${table}__table`).DataTable({
    'destroy': true,
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

export {
  disableArrowKeyScroll,
  saveData,
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
  initDataTable,
  renderTable,
  renderTableHeader,
  getUserID,
  handleClickSaveResult
}

import { getCategory, setCategory } from './category'
import { getCurrentStep, setCurrentStep } from './step'
import { showTab, renderPreviousSessionToast, showStartSection, showListSection, showRankSection, showMyLists, renderMyLists } from './views'
import { initPrevList, getListData, estimateTotalComparisons, setListData } from './list'
import { initPrevRanking } from './rank'
import { initPrevResult, getResultData } from './result'
import { dbSaveTemplateData, dbSaveProgressData, dbUpdateTemplateData, setDBListInfo, getDBListInfo, dbSaveUserResultData, dbGetTopTenYear, dbGetSharedList, clearUserDBListInfo, dbGetAnnouncement } from './database'
import { getParentList, setParentList } from './list-sharing'
import { getUserID, custConfirm, custMessage } from './common'
import { fadeInSpinner, fadeOutSpinner } from './spinner'

const initRankingEngine = async () => {
  initMaterializeComponents()
  checkForAnnouncement()
  showTab('start')
  setCurrentStep('start')
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

  renderMyLists()
  sessionStorage.removeItem('reload')
}

const checkForAnnouncement = async () => {
  const announcementCheck = await dbGetAnnouncement()

  if (announcementCheck.length > 0) {
    const announcement = announcementCheck[0]

    const wrapperEl = document.querySelector('.announcement')

    const rowEl = document.createElement('div')
    rowEl.classList.add('row')

    const colEl = document.createElement('div')
    colEl.classList.add('col', 's10', 'offset-s1')

    const cardWrapper = document.createElement('div')
    cardWrapper.classList.add('card', 'blue-grey', 'darken-1')

    const cardContent = document.createElement('div')
    cardContent.classList.add('card-content', 'white-text', 'center-align', 'announcement-content')

    // IMAGE
    if (announcement.image_url.length > 0) {
      const imageWrapper = document.createElement('div')
      imageWrapper.classList.add('card-image')

      const imgEl = document.createElement('img')
      imgEl.setAttribute('src', announcement.image_url)
      imageWrapper.appendChild(imgEl)
      cardContent.appendChild(imageWrapper)
    }

    const announcementText = document.createElement('div')
    announcementText.classList.add('announcement-text')

    // TITLE
    if (announcement.title.length > 0) {
      const titleEl = document.createElement('span')
      titleEl.classList.add('card-title')
      titleEl.textContent = announcement.title
      announcementText.appendChild(titleEl)
    }

    // TEXT
    if (announcement.text.length > 0) {
      const textEl = document.createElement('p')
      textEl.textContent = announcement.text
      announcementText.appendChild(textEl)
    }

    cardContent.appendChild(announcementText)

    // ACTION SECTION
    if (announcement.action1_text.length > 0) {
      const actionEl = document.createElement('div')
      actionEl.classList.add('card-action', 'center-align')

      // ACTION 1
      const action1El = document.createElement('a')
      action1El.setAttribute('href', announcement.action1_link)
      action1El.textContent = announcement.action1_text
      actionEl.appendChild(action1El)

      // ACTION 2
      if (announcement.action2_text.length > 0) {
        const action2El = document.createElement('a')
        action2El.setAttribute('href', announcement.action2_link)
        action2El.textContent = announcement.action2_text
        actionEl.appendChild(action2El)
      }

      cardWrapper.appendChild(actionEl)
    }

    cardWrapper.prepend(cardContent)
    colEl.appendChild(cardWrapper)
    rowEl.appendChild(colEl)
    wrapperEl.appendChild(rowEl)
  }
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

    if (step !== 'start') {
      if (loginStep === 'list') {
        initPrevList(category, data)
      } else if (loginStep === 'rank') {
        setParentList(parentList)
        initPrevRanking(category, data)
      } else if (loginStep === 'result') {
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
      const result = await dbGetSharedList(param.id, 'result')
      const category = parseInt(result[0].list_category)
      const data = JSON.parse(result[0].result_data)
      initPrevResult(category, data)
      document.querySelector('#save-results').classList.add('disabled')
      removeURLParam()
    } else if (param.type === 't') {
      const template = await dbGetSharedList(param.id, 'template')
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
        showRankSection('list')
        removeURLParam()
      }
    } else if (param.type === 'p') {
      const progress = await dbGetSharedList(param.id, 'progress')
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
    if (currentStep === 'list') {
      dbSaveTemplateData(saveDesc)
    } else if (currentStep === 'rank') {
      // This handles both insert and update db opeations depending on if they have a current list.
      dbSaveProgressData(saveDesc)
    } else if (currentStep === 'result') {
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
  if (navigator.onLine) {
    fadeInSpinner()
    const userID = await getUserID()

    if (userID === 0) {
      clearUserDBListInfo()
      document.querySelector('#login-form-button').setAttribute('from', '')
      document.querySelector('#login-form-button').setAttribute('from', 'save')
      const instance = M.Modal.getInstance(document.querySelector('#login-modal'))
      instance.open()
    } else if (userID > 0) {
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
    fadeOutSpinner()
  } else {
    custMessage('You seem to be offline. Please check your connection and try again.')
  }
}

const handleClickSaveRank = async () => {
  if (navigator.onLine) {
    fadeInSpinner()
    const userID = await getUserID()
    if (userID === 0) {
      clearUserDBListInfo()
      document.querySelector('#login-form-button').setAttribute('from', '')
      document.querySelector('#login-form-button').setAttribute('from', 'save')
      const instance = M.Modal.getInstance(document.querySelector('#login-modal'))
      instance.open()
    } else if (userID > 0) {
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
    fadeOutSpinner()
  } else {
    custMessage('You seem to be offline. Please check your connection and try again.')
  }
}

const handleClickSaveResult = async () => {
  if (navigator.onLine) {
    fadeInSpinner()
    const userID = await getUserID()

    document.querySelector('#save-list-btn').textContent = 'Save'
    document.querySelector('#save-description').value = ''
    if (userID === 0) {
      clearUserDBListInfo()
      document.querySelector('#login-form-button').setAttribute('from', '')
      document.querySelector('#login-form-button').setAttribute('from', 'save')
      const instance = M.Modal.getInstance(document.querySelector('#login-modal'))
      instance.open()
    } else if (userID > 0) {
      const instance = M.Modal.getInstance(document.querySelector('#save-modal'))
      instance.open()
    }
    fadeOutSpinner()
  } else {
    custMessage('You seem to be offline. Please check your connection and try again.')
  }
}

const handleClickAccount = () => {
  if (navigator.onLine) {
    renderMyLists()
    const instance = M.Modal.getInstance(document.querySelector('#account-modal'))
    instance.open()
  } else {
    custMessage('You seem to be offline. Please check your connection and try again.')
  }
}

// //////////////////////////////////////////////////////////////////////
// // HANDLE TAB CLICKS
// //////////////////////////////////////////////////////////////////////

const handleClickStart = () => {
  const source = getCurrentStep()
  const category = document.querySelector('#list-category-select').value
  if (source !== 'start' || category !== '0') {
    const message = 'This will clear any progress and start the process from the beginning. Want to continue?'
    custConfirm(message, showStartSection, source)
  }
}

const handleClickList = () => {
  const source = getCurrentStep()
  let message = ''

  if (source === 'rank') {
    message = 'This will terminate the ranking process and allow you to edit the list. Want to continue?'
    custConfirm(message, showListSection, source)
  } else if (source === 'result') {
    message = 'This will clear your results and allow you to edit the list. Want to continue?'
    custConfirm(message, showListSection, source)
  }
}

const handleClickRank = () => {
  const source = getCurrentStep()
  if (source === 'list') {
    const listData = getListData()
    const listLength = listData.length
    if (listLength > 0) {
      const comparisonEstimate = estimateTotalComparisons(listData)
      const message = `You are about to rank ${listLength} items. This will take an estimated ${comparisonEstimate} comparisons. Do you want to continue?`
      // const message = 'Are you ready to start ranking this list?'
      custConfirm(message, showRankSection, source)
    }
  } else if (source === 'rank') {
    const message = 'Do you really want to restart ranking this list?'
    custConfirm(message, showRankSection, source)
  } else if (source === 'result') {
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

const handleClickRatedCb = () => {
  const slider = document.getElementById('min-max-rating-slider')
  const ratedCBChecked = document.querySelector('.bgg-cb .rated').checked
  const personalRatingEl = document.querySelector('.bgg-personal-rating')
  if (ratedCBChecked) {
    slider.removeAttribute('disabled')
    personalRatingEl.classList.remove('hide')
  } else {
    slider.setAttribute('disabled', true)
    personalRatingEl.classList.add('hide')
  }
}

const initMaterializeComponents = () => {
  M.AutoInit()

  const elems = document.querySelectorAll('input[type=range]')
  M.Range.init(elems)

  const slider = document.getElementById('min-max-rating-slider')
  noUiSlider.create(slider, {
    start: [0, 10],
    margin: 0.5,
    connect: true,
    step: 0.5,
    orientation: 'horizontal',
    range: {
      'min': 0,
      'max': 10
    },
    tooltips: true,
    format: wNumb({
      decimals: 1
    })
  })

  handleClickRatedCb()

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
  handleClickSaveResult,
  handleClickAccount,
  handleClickRatedCb
}

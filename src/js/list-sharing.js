import { dbSetShareFlag } from './database'
import { renderMyLists } from './views'
import { renderTable } from './tables'

let myListsInfo = {}
let selectedList = {}
let parentList = 0

const getMyListsInfo = () => myListsInfo

const setMyListsInfo = (data) => {
  myListsInfo = data

  myListsInfo.template.forEach((item) => {
    item.id = parseInt(item.id)
    item.shared = parseInt(item.shared)
    item.ranked = parseInt(item.ranked)
  })

  myListsInfo.progress.forEach((i) => {
    i.id = parseInt(i.id)
  })

  myListsInfo.result.forEach((i) => {
    i.id = parseInt(i.id)
  })
}

const getParentList = () => parentList

const setParentList = (id) => {
  parentList = parseInt(id)
}

const setMyListsInfoShared = (id, value) => {
  const index = myListsInfo.template.findIndex((item) => item.id === id)
  myListsInfo.template[index].shared = value
}

const openShareModal = (data) => {
  selectedList = data
  const modal = M.Modal.getInstance(document.querySelector('#share-modal'))
  const descEl = document.querySelector('.share-list__heading')
  descEl.textContent = data.descr
  const urlEl = document.querySelector('#share-list__url')
  const siteURL = getSiteURL()
  urlEl.value = `${siteURL}?t=${data.uuid}`
  const switchEl = document.querySelector('#share-switch')
  const shared = data.shared
  shared === 1 ? switchEl.checked = true : switchEl.checked = false
  renderShareOptions(shared, data)

  const listData = JSON.parse(data.templateData)
  const items = []
  listData.forEach((i) => {
    items.push({ name: i.name })
  })

  renderReadOnlyTemplate(items)

  modal.open()
}

const renderReadOnlyTemplate = (items) => {
  // clear list data
  const readOnlyTemplateEl = document.querySelector('#read-only-template-table-wrapper')
  readOnlyTemplateEl.innerHTML = ''
  renderTable('read-only-template', ['Item Name'], items)
}

const createStatsBtn = (listData) => {
  const aEl = document.createElement('a')
  const iEl = document.createElement('i')

  aEl.href = `./group-results/?l=${listData.uuid}`
  aEl.target = '_blank'
  aEl.textContent = 'Results'
  aEl.classList.add('waves-effect', 'waves-light', 'btn', 'share-list__result')

  iEl.textContent = 'show_chart'
  iEl.classList.add('material-icons', 'right', 'small', 'white-text')

  aEl.appendChild(iEl)

  return aEl
}

const copyURLText = () => {
  const copyText = document.getElementById('share-list__url')
  const urlFieldEl = document.getElementById('share-list__url')
  urlFieldEl.removeAttribute('disabled')
  copyText.select()
  document.execCommand('copy')
  urlFieldEl.setAttribute('disabled', '')
  M.toast({ html: 'Copied Url' })
}

const handleShareSwitchChange = async () => {
  const value = document.querySelector('#share-switch').checked ? 1 : 0
  // Send value to database --need the list id
  const listId = selectedList.id
  renderShareOptions(value, selectedList)
  await dbSetShareFlag(listId, value)
  setMyListsInfoShared(listId, value)
  renderMyLists()
}

const renderShareOptions = (switchValue, data) => {
  const copyBtnEl = document.getElementById('share-list__copy')
  // const urlFieldEl = document.getElementById('share-list__url')

  if (switchValue === 1) {
    // urlFieldEl.removeAttribute('disabled')
    copyBtnEl.classList.remove('disabled')
  } else {
    // urlFieldEl.setAttribute('disabled', '')
    copyBtnEl.classList.add('disabled')
  }

  // remove previous stats button
  const btnsEl = document.querySelector('.share-list__btns')
  const button = document.querySelector('.share-list__result')
  if (button !== null) {
    button.remove()
  }
  // render stats button if it has been ranked
  if (data.ranked === 1) {
    const buttonEl = createStatsBtn(data)
    btnsEl.appendChild(buttonEl)
  }
}

export { getMyListsInfo, setMyListsInfo, openShareModal, copyURLText, handleShareSwitchChange, getParentList, setParentList }

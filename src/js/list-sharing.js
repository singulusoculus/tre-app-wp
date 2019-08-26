import { dbSetShareFlag } from './database'
import { renderMyLists } from './views'
import { renderTableRows } from './functions'

let myListsInfo = {}
let selectedList = {}
let parentList = 0

const getMyListsInfo = () => myListsInfo

const setMyListsInfo = (data) => {
  myListsInfo = data

  myListsInfo.templates.forEach((item) => {
    item.id = parseInt(item.id)
    item.shared = parseInt(item.shared)
    item.ranked = parseInt(item.ranked)
  })

  myListsInfo.progress.forEach((i) => {
    i.id = parseInt(i.id)
  })

  myListsInfo.results.forEach((i) => {
    i.id = parseInt(i.id)
  })
}

const getParentList = () => parentList

const setParentList = (id) => {
  parentList = parseInt(id)
}

const setMyListsInfoShared = (id, value) => {
  const index = myListsInfo.templates.findIndex((item) => item.id === id)
  myListsInfo.templates[index].shared = value
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
  const readOnlyTemplateEl = document.querySelector('.read-only-template')
  readOnlyTemplateEl.innerHTML = ''

  // create DOM Elements
  const tableEl = document.createElement('table')
  tableEl.classList.add('striped')
  const theadEl = document.createElement('thead')
  const trEl = document.createElement('tr')
  const thEl = document.createElement('th')
  thEl.setAttribute('scope', 'col')
  thEl.textContent = 'Item Name'
  trEl.appendChild(thEl)
  theadEl.appendChild(trEl)
  tableEl.appendChild(theadEl)
  const tbodyEl = document.createElement('tbody')
  tbodyEl.setAttribute('id', 'read-only-template__rows')
  tableEl.appendChild(tbodyEl)
  readOnlyTemplateEl.appendChild(tableEl)

  renderTableRows(items, 'read-only-template')
}

const createStatsBtn = (listData) => {
  const aEl = document.createElement('a')
  const iEl = document.createElement('i')

  aEl.href = `./shared-rankings/?l=${listData.uuid}`
  aEl.target = '_blank'
  aEl.textContent = 'Results'
  aEl.classList.add('waves-effect', 'waves-light', 'btn', 'share-list__results')

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

const handleShareSwitchChange = () => {
  const value = document.querySelector('#share-switch').checked ? 1 : 0
  // Send value to database --need the list id
  const listId = selectedList.id
  dbSetShareFlag(listId, value)
  setMyListsInfoShared(listId, value)
  renderShareOptions(value, selectedList)
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
  const button = document.querySelector('.share-list__results')
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

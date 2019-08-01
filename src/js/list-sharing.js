import { dbSetShareFlag } from './database'

let myListsInfo = {}
let selectedList = {}
let parentList = 0

const getMyListsInfo = () => myListsInfo

const setMyListsInfo = (data) => {
  myListsInfo = data

  myListsInfo.templates.forEach((item) => {
    item.id = parseInt(item.id)
    item.shared = parseInt(item.shared)
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
  urlEl.value = `https://rankingengine.pubmeeple.com/?t=${data.uuid}`
  const switchEl = document.querySelector('#share-switch')
  const shared = data.shared
  shared === 1 ? switchEl.checked = true : switchEl.checked = false
  // const urlFieldEl = document.getElementById('share-list__url')
  const copyBtnEl = document.getElementById('share-list__copy')

  if (shared === 1) {
    // urlFieldEl.removeAttribute('disabled')
    copyBtnEl.classList.remove('disabled')
  } else {
    // urlFieldEl.setAttribute('disabled', '')
    copyBtnEl.classList.add('disabled')
  }
  modal.open()
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
  // const urlFieldEl = document.getElementById('share-list__url')
  const copyBtnEl = document.getElementById('share-list__copy')

  if (value === 1) {
    // urlFieldEl.removeAttribute('disabled')
    copyBtnEl.classList.remove('disabled')
  } else {
    // urlFieldEl.setAttribute('disabled', '')
    copyBtnEl.classList.add('disabled')
  }
}

const renderShareOptions = (switchValue) => {

}

export { getMyListsInfo, setMyListsInfo, openShareModal, copyURLText, handleShareSwitchChange, getParentList, setParentList }

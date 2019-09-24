import { showRankSection, showResultSection, custConfirm, custMessage } from './views'
import { setResultData, getResultData } from './result'
import { disableArrowKeyScroll, saveData } from './functions'
import { setCategory, getCategoryInfo } from './category'
import { setCurrentStep, getCurrentStep } from './step'
import { dbSaveResultData, setDBListInfoType, getDBListInfo, dbUpdateResultData, dbSaveProgressData } from './database'
import { createList } from './list'

let rankData = {}
let rankDataHistory = []
let localStorageHistoryEnabled = true

const initPrevRanking = (category, data) => {
  disableArrowKeyScroll()
  setCurrentStep('Rank')
  setCategory(category)

  data.masterList = createList(data.masterList)

  populateRankData(data)
  saveData(rankData)
  showComparison()
  updateProgressBar()
  showRankSection()

  document.querySelector('#undo-btn').classList.add('disabled')

  const history = JSON.parse(localStorage.getItem('rankDataHistory'))
  if (Array.isArray(history)) {
    if (history.length > 0) {
      rankDataHistory = history
      document.querySelector('#undo-btn').classList.remove('disabled')
    }
  }
}

const getRankData = () => rankData

const getRankDataHistory = () => rankDataHistory

const populateRankData = (data) => {
  // Set up rankData Object
  rankData = {
    masterList: data ? data.masterList : [],
    sortList: data ? data.sortList : [],
    parent: data ? data.parent : [-1],
    rec: data ? data.rec : [],
    deletedItems: data ? data.deletedItems : [],
    cmp1: data ? data.cmp1 : 0,
    cmp2: data ? data.cmp2 : 0,
    head1: data ? data.head1 : 0,
    head2: data ? data.head2 : 0,
    nrec: data ? data.nrec : 0,
    numQuestion: data ? data.numQuestion : 1,
    totalSize: data ? data.totalSize : 0,
    finishSize: data ? data.finishSize : 0,
    finishFlag: data ? data.finishFlag : 0,
    bggFlag: data ? data.bggFlag : 0,
    finalListID: data ? data.finalListID : 0
  }
}

const initRanking = (itemsList, category) => {
  disableArrowKeyScroll()
  populateRankData()

  document.querySelector('#undo-btn').classList.add('disabled')

  itemsList = createList(itemsList)

  rankData.masterList = itemsList
  setCategory(category)

  // Initialize sorting lists
  let n = 0
  let mid

  rankData.sortList[n] = []

  const masterListLength = rankData.masterList.length

  for (let i = 0; i < masterListLength; i++) {
    rankData.sortList[n][i] = i
  }

  n++

  for (let i = 0; i < rankData.sortList.length; i++) {
    // Initialize sortList
    if (rankData.sortList[i].length >= 2) {
      mid = Math.ceil(rankData.sortList[i].length / 2)
      rankData.sortList[n] = []
      rankData.sortList[n] = rankData.sortList[i].slice(0, mid)
      rankData.totalSize += rankData.sortList[n].length
      rankData.parent[n] = i
      n++
      rankData.sortList[n] = []
      rankData.sortList[n] = rankData.sortList[i].slice(mid, rankData.sortList[i].length)
      rankData.totalSize += rankData.sortList[n].length
      rankData.parent[n] = i
      n++
    }
  }

  // Initialize rec
  rankData.masterList.forEach((item) => {
    rankData.rec.push(0)
  })

  rankData.cmp1 = rankData.sortList.length - 2
  rankData.cmp2 = rankData.sortList.length - 1

  setCurrentStep('Rank')
  saveData(rankData)

  resetHistory()
  updateProgressBar()
  showComparison()
}

const getComparisonInfo = () => {
  if (rankData.cmp1 < 1) {
    return {}
  } else {
    const item1Ref = rankData.sortList[rankData.cmp1][rankData.head1]
    const item2Ref = rankData.sortList[rankData.cmp2][rankData.head2]

    return {
      item1: rankData.masterList[item1Ref],
      item2: rankData.masterList[item2Ref],
      item1Ref: item1Ref,
      item2Ref: item2Ref
    }
  }
}

const showComparison = () => {
  const { item1, item2 } = getComparisonInfo()
  const categoryName = getCategoryInfo().name

  // Image control
  if (item1.image !== '') {
    document.querySelector('#item-1-img').setAttribute('src', item1.image)
  } else {
    document.querySelector('#item-1-img').setAttribute('src', getFilePath(`/images/${categoryName}-lime.png`))
  }

  if (item2.image !== '') {
    document.querySelector('#item-2-img').setAttribute('src', item2.image)
  } else {
    document.querySelector('#item-2-img').setAttribute('src', getFilePath(`/images/${categoryName}-orange.png`))
  }

  // Text control
  document.querySelector('#item-1-text').textContent = item1.name
  document.querySelector('#item-2-text').textContent = item2.name

  setTimeout(() => {
    cardFadeIn()
  }, 100)
}

const handlePick = (flag) => {
  if (rankData.cmp1 >= 1) {
    setHistory()

    const { item1, item2 } = getComparisonInfo()

    updateProgressBar()

    updateRec(flag)
    sortList()
    cardFadeOut(item1.id, item2.id)
    rankData.numQuestion++
  }

  cmpCheck()
  if (rankData.finishFlag !== 1) {
    saveData(rankData)
  }
}

const updateRec = (flag) => {
  if (flag < 0) {
    rankData.rec[rankData.nrec] = rankData.sortList[rankData.cmp1][rankData.head1]
    rankData.head1++
    rankData.nrec++
    rankData.finishSize++
  } else if (flag > 0) {
    rankData.rec[rankData.nrec] = rankData.sortList[rankData.cmp2][rankData.head2]
    rankData.head2++
    rankData.nrec++
    rankData.finishSize++
  }
}

const sortList = () => {
  const cmp1Length = rankData.sortList[rankData.cmp1].length
  const cmp2Length = rankData.sortList[rankData.cmp2].length

  // if there are items left in head1 after head 2 is complete then put them in rec
  // else if there are items left in head2 after head 1 is complete then put them in rec
  if (rankData.head1 < cmp1Length && rankData.head2 === cmp2Length) {
    while (rankData.head1 < cmp1Length) {
      updateRec(-1)
    }
  } else if (rankData.head1 === cmp1Length && rankData.head2 < cmp2Length) {
    while (rankData.head2 < cmp2Length) {
      updateRec(1)
    }
  }

  // If you reach the end of the list of both update the parent list
  if (rankData.head1 === cmp1Length && rankData.head2 === cmp2Length) {
    for (let i = 0; i < cmp1Length + cmp2Length; i++) {
      rankData.sortList[rankData.parent[rankData.cmp1]][i] = rankData.rec[i]
    }

    rankData.sortList.pop()
    rankData.sortList.pop()
    rankData.cmp1 = rankData.cmp1 - 2
    rankData.cmp2 = rankData.cmp2 - 2
    rankData.head1 = 0
    rankData.head2 = 0

    const masterListLength = rankData.masterList.length

    // Initialize the rec before you make a new comparison
    if (rankData.head1 === 0 && rankData.head2 === 0) {
      for (let i = 0; i < masterListLength; i++) {
        rankData.rec[i] = 0
      }
      rankData.nrec = 0
    }
  }
}

const cmpCheck = () => {
  if (rankData.cmp1 < 0) {
    updateProgressBar()
    calcRankedList()
    rankData.finishFlag = 1
    showResultSection()
  } else {
    checkForDeletedItems()
    updateProgressBar()

    // auto save
    const dbListInfo = getDBListInfo()
    if (dbListInfo.progress.id > 0 && rankData.numQuestion % 5 === 0) {
      dbSaveProgressData()
    }

    setTimeout(() => {
      showComparison()
    }, 400)
  }
}

// History and Undo
const setHistory = () => {
  let maxHistory
  if (rankData.masterList.length > 700) {
    maxHistory = 4
  } else {
    maxHistory = 10
  }

  const rankDataJSON = JSON.stringify(rankData)
  rankDataHistory.push(rankDataJSON)

  if (rankDataHistory.length > maxHistory) {
    rankDataHistory.shift()
  }

  document.querySelector('#undo-btn').classList.remove('disabled')
  saveRankDataHistory()
}

const resetHistory = () => {
  rankDataHistory = []
  document.querySelector('#undo-btn').classList.add('disabled')
  saveRankDataHistory()
}

const saveRankDataHistory = () => {
  if (localStorageHistoryEnabled) {
    try {
      localStorage.setItem('rankDataHistory', JSON.stringify(rankDataHistory))
    } catch (error) {
      localStorageHistoryEnabled = false
      localStorage.removeItem('rankDataHistory')
      console.log(error)
    }
  }
}

const handleUndo = () => {
  const { item1, item2 } = getComparisonInfo()

  const historyLength = rankDataHistory.length
  if (historyLength > 0) {
    const historyJSON = rankDataHistory.pop()
    const history = JSON.parse(historyJSON)
    rankData = history

    if (rankDataHistory.length === 0) {
      document.querySelector('#undo-btn').classList.add('disabled')
    }

    cardFadeOut(item1.id, item2.id)

    updateProgressBar()

    setTimeout(() => {
      showComparison()
    }, 400)

    saveData(rankData)
    saveRankDataHistory()
  }

  const newHistoryLength = rankDataHistory.length
  if (newHistoryLength === 0) {
    document.querySelector('#undo-btn').classList.add('disabled')
  }
}

// Delete
const deleteItem = (flag) => {
  let indexToDelete
  const { item1, item2, item1Ref, item2Ref } = getComparisonInfo()

  // decide which item to delete of the two listed. Set to indexToDelete
  if (flag < 0) {
    indexToDelete = item1Ref
  } else {
    indexToDelete = item2Ref
  }

  setHistory()

  rankData.deletedItems.push(indexToDelete)

  updateRec(flag)
  sortList()

  saveData(rankData)
  saveRankDataHistory()

  cardFadeOut(item1.id, item2.id)

  cmpCheck()
}

const handleDeleteItem = (flag) => {
  const { item1, item2 } = getComparisonInfo()

  if (flag < 0) {
    const message = `Are you sure you want to remove ${item1.name} from the ranking process?`
    custConfirm(message, deleteItem, flag)
  } else {
    const message = `Are you sure you want to remove ${item2.name} from the ranking process?`
    custConfirm(message, deleteItem, flag)
  }
}

const checkForDeletedItems = () => {
  let { item1, item2, item1Ref, item2Ref } = getComparisonInfo()

  while (rankData.deletedItems.indexOf(item1Ref) > -1 || rankData.deletedItems.indexOf(item2Ref) > -1) {
    // run while item is in deletedItems && is not at the end of cmp1
    while (rankData.deletedItems.indexOf(item1Ref) > -1 && rankData.head1 < rankData.sortList[rankData.cmp1].length) {
      updateRec(-1)
      item1Ref = rankData.sortList[rankData.cmp1][rankData.head1]
    }
    while (rankData.deletedItems.indexOf(item2Ref) > -1 && rankData.head2 < rankData.sortList[rankData.cmp2].length) {
      updateRec(1)
      item2Ref = rankData.sortList[rankData.cmp2][rankData.head2]
    }
    sortList()
  }

  cardFadeOut(item1.id, item2.id)

  // check for completion
  if (rankData.cmp1 < 0) {
    updateProgressBar()
    calcRankedList()
    rankData.finishFlag = 1
    showResultSection()
  }
}

const calcRankedList = () => {
  let list = rankData.sortList[0]
  let rankedList = []

  // filter out deleted items from sortList
  if (rankData.deletedItems) {
    list = list.filter((e) => rankData.deletedItems.indexOf(e) < 0, rankData.deletedItems)
  }

  list.forEach((item, index) => {
    let obj = rankData.masterList[list[index]]
    obj = { ...obj, rank: index + 1 }
    rankedList.push(obj)
  })

  // reset dbListInfo.userResult
  setDBListInfoType('userResult', { id: 0, desc: '' })

  setResultData(rankedList)
  setCurrentStep('Result')

  rankDataHistory = []
  saveRankDataHistory()

  const rankedItems = []
  rankedList.forEach((item) => {
    rankedItems.push({
      name: item.name,
      bggid: item.bggId,
      yearPublished: item.yearPublished
    })
  })

  const resultId = getDBListInfo().result.id
  if (resultId === 0) {
    dbSaveResultData(rankedItems)
  } else if (resultId > 0) {
    dbUpdateResultData(rankedItems, resultId)
  }
}

const updateProgressBar = () => {
  const progress = Math.floor((rankData.finishSize * 100) / rankData.totalSize)
  document.querySelector('#progress-bar').style.width = `${progress}%`
}

const handleRestart = (e) => {
  // get selected option
  const options = Array.from(document.getElementsByName('rerank-options'))
  let checkedOption

  options.forEach((el) => {
    if (el.checked) {
      checkedOption = el.id
    }
  })

  if (checkedOption === 'restart-complete') {
    setDBListInfoType('result', { id: 0 })
    showRankSection('Result')
  } else if (checkedOption === 'restart-partial') {
    // Destroy template connection to database
    setDBListInfoType('template', { id: 0, desc: '' })

    // Get number of items
    const numOfItems = parseInt(document.querySelector('#num-of-items').value)

    if (isNaN(numOfItems)) {
      custMessage('Please enter a number')
      e.stopPropagation()
    } else {
      const fullData = getResultData()
      const newData = fullData.slice(0, numOfItems)
      setResultData(newData)
      showRankSection('Result')
    }
  }
  // Clears database link when starting a new ranking
  setDBListInfoType('progress', { id: 0, desc: '' })
}

const cardFadeOut = (prevItem1, prevItem2) => {
  if (rankData.cmp1 > 0) {
    const { item1, item2 } = getComparisonInfo()

    if (prevItem1 !== item1.id) {
      // figure out if item name has changed before adding the class
      document.querySelector('#item-1-card').classList.add('rank-card--fade-out')
    }

    if (prevItem2 !== item2.id) {
      document.querySelector('#item-2-card').classList.add('rank-card--fade-out')
    }
  }
}

const cardFadeIn = () => {
  document.querySelector('#item-1-card').classList.remove('rank-card--fade-out')
  document.querySelector('#item-2-card').classList.remove('rank-card--fade-out')
}

// Enable use of left, right, and down keys to make selections
document.onkeydown = function (e) {
  // If a modal is open arrow keys will not work
  if (!document.querySelector('.modal.open') && getCurrentStep() === 'Rank') {
    switch (e.keyCode) {
      case 37:
        // Left
        handlePick(-1)
        break
      case 39:
        // Right
        handlePick(1)
        break
      case 38:
        // Up
        handleUndo()
    }
    const keys = document.querySelector('#keys-reminder')
    if (keys) {
      keys.classList.add('hide')
    }
  }
}

// -----------------------------------------------------
export { initPrevRanking,
  initRanking,
  handlePick,
  handleUndo,
  deleteItem,
  getRankData,
  calcRankedList,
  handleDeleteItem,
  handleRestart,
  getRankDataHistory,
  resetHistory
}

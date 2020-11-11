import uuidv4 from 'uuid'
import { getListData, initPrevList } from './list'
import { getRankData, initPrevRanking, resetHistory } from './rank'
import { getResultData, initPrevResult } from './result'
import { getCategory } from './category'
import { saveData, updateLocalStorageSaveDataItem } from './functions'
import { renderMyLists, renderTemplateDesc } from './views'
import { fadeInSpinner, fadeOutSpinner } from './spinner'
import { getParentList, setParentList } from './list-sharing'
import { getUserID } from './common'
import { renderTable } from './tables'

let dbListInfo = {
  template: {
    id: 0,
    desc: ''
  },
  progress: {
    id: 0,
    desc: ''
  },
  result: {
    id: 0
  },
  userResult: {
    id: 0,
    desc: ''
  }
}

const getDBListInfo = () => dbListInfo

const setDBListInfoType = (type, updates) => {
  if (typeof updates.id === 'number') {
    dbListInfo[type].id = updates.id
  }

  if (typeof updates.desc === 'string') {
    dbListInfo[type].desc = updates.desc
  }

  renderTemplateDesc()
}

const setDBListInfo = (newData) => {
  dbListInfo = newData
  renderTemplateDesc()
}

const clearDBListInfo = () => {
  dbListInfo = {
    template: {
      id: 0,
      desc: ''
    },
    progress: {
      id: 0,
      desc: ''
    },
    result: {
      id: 0
    },
    userResult: {
      id: 0,
      desc: ''
    }
  }
  renderTemplateDesc()
}

const clearUserDBListInfo = () => {
  // Clear user saved list ids if they aren't logged in
  setDBListInfoType('template', { id: 0, desc: '' })
  setDBListInfoType('progress', { id: 0, desc: '' })
  setDBListInfoType('userResult', { id: 0, desc: '' })

  const update = getDBListInfo()
  const prevData = JSON.parse(localStorage.getItem('saveData'))
  if (prevData) {
    updateLocalStorageSaveDataItem('dbListInfo', update)
  }
}

const dbGetUserLists = async (wpuid) => {
  return new Promise((resolve, reject) => {
    jQuery.post(getFilePath('/re-func/re-functions.php'), {
      func: 'getUserLists',
      wpuid
    }, (data, status) => {
      if (status === 'success') {
        const parsedData = JSON.parse(data)
        parsedData ? resolve(parsedData) : reject(new Error('No data returned'))
      }
    })
  })
}

const dbGetTopTenYear = () => {
  jQuery.post(getFilePath('/re-func/re-functions.php'), {
    func: 'getYearTopTen'
  }, (data, status) => {
    const parsedData = JSON.parse(data)
    renderTable('top-ten-year', ['Rank', 'Game'], parsedData)
  })
}

const dbLoadUserList = (type, id) => {
  if (type === 'template') {
    jQuery.post(getFilePath('/re-func/re-functions.php'), {
      func: 'getTemplateList',
      templateid: id
    }, (data, status) => {
      if (status === 'success') {
        const parsedData = JSON.parse(data)
        const listData = JSON.parse(parsedData[0].template_data)
        const category = parseInt(parsedData[0].list_category)
        const desc = parsedData[0].template_desc
        const intID = parseInt(id)
        setDBListInfoType('template', { id: intID, desc })
        initPrevList(category, listData)
      }
    })
  } else if (type === 'progress') {
    jQuery.post(getFilePath('/re-func/re-functions.php'), {
      func: 'getProgressList',
      progressid: id
    }, (data, status) => {
      if (status === 'success') {
        const parsedData = JSON.parse(data)
        const rankData = JSON.parse(parsedData[0].progress_data)
        const category = parseInt(parsedData[0].list_category)
        const desc = parsedData[0].progress_desc
        const parentList = parsedData[0].parent_list_id
        resetHistory()
        const intID = parseInt(id)
        setDBListInfoType('progress', { id: intID, desc })
        setParentList(parentList)
        initPrevRanking(category, rankData)
      }
    })
  } else if (type === 'result') {
    jQuery.post(getFilePath('/re-func/re-functions.php'), {
      func: 'getUserResultList',
      resultid: id
    }, (data, status) => {
      if (status === 'success') {
        const parsedData = JSON.parse(data)
        const resultData = JSON.parse(parsedData[0].result_data)
        const category = parseInt(parsedData[0].list_category)
        const desc = parsedData[0].result_desc
        const intID = parseInt(id)
        setDBListInfoType('userResult', { id: intID, desc })
        initPrevResult(category, resultData)
        document.querySelector('#save-results').classList.add('disabled')
      }
    })
  }
}

const dbDeleteUserList = (type, id) => {
  if (type === 'template') {
    jQuery.post(getFilePath('/re-func/re-functions.php'), {
      func: 'deleteTemplateList',
      templateid: id
    }, (data, status) => {
      if (status === 'success') {
        renderMyLists()

        if (parseInt(id) === dbListInfo.template.id) {
          setDBListInfoType('template', { id: 0, desc: '' })
        }

        M.toast({ html: `Template Deleted`, displayLength: 2000 })
      }
    })
  } else if (type === 'progress') {
    jQuery.post(getFilePath('/re-func/re-functions.php'), {
      func: 'deleteProgressList',
      progressid: id
    }, (data, status) => {
      if (status === 'success') {
        renderMyLists()

        if (parseInt(id) === dbListInfo.progress.id) {
          setDBListInfoType('progress', { id: 0, desc: '' })
        }

        M.toast({ html: `Progress List Deleted`, displayLength: 2000 })
      }
    })
  } else if (type === 'result') {
    jQuery.post(getFilePath('/re-func/re-functions.php'), {
      func: 'deleteUserResultList',
      resultid: id
    }, (data, status) => {
      if (status === 'success') {
        renderMyLists()

        if (parseInt(id) === dbListInfo.userResult.id) {
          setDBListInfoType('userResult', { id: 0, desc: '' })
          document.querySelector('#save-results').classList.remove('disabled')
        }

        // Set table title
        const titleEl = document.querySelector('.result-desc')
        if (titleEl) {
          titleEl.textContent = dbListInfo.userResult.desc !== '' ? `${dbListInfo.userResult.desc}:` : 'Your Results:'
        }

        M.toast({ html: `Result List Deleted`, displayLength: 2000 })
      }
    })
  }
}

const dbSaveTemplateData = async (saveDesc) => {
  const wpuid = await getUserID()
  let listData = getListData()

  let newListData = JSON.parse(JSON.stringify(listData))

  // strip out uuid before saving to database
  newListData.forEach((item) => {
    delete item.id
  })

  const itemCount = newListData.length
  const listDataJSON = JSON.stringify(newListData)
  const category = getCategory()
  setDBListInfoType('template', { id: 0, desc: '' })

  fadeInSpinner()

  if (dbListInfo.template.id === 0) {
    const uuid = uuidv4()

    jQuery.post(getFilePath('/re-func/re-functions.php'), {
      func: 'insertTemplateList',
      wpuid,
      uuid,
      listData: listDataJSON,
      itemCount,
      saveDesc,
      category
    }, (data, status) => {
      let newData = parseInt(data.replace(/[\n\r]+/g, ''))
      if (status === 'success') {
        setDBListInfoType('template', {
          id: newData,
          desc: saveDesc
        })
        saveData(listData)
        renderMyLists()

        fadeOutSpinner()
        M.toast({ html: `Template Saved`, displayLength: 2000 })
      }
    })
  }
}

const dbUpdateTemplateData = (saveDesc) => {
  let listData = getListData()
  let newListData = JSON.parse(JSON.stringify(listData))

  // strip out uuid before saving to database
  newListData.forEach((item) => {
    delete item.id
  })

  const itemCount = newListData.length
  const listDataJSON = JSON.stringify(newListData)

  fadeInSpinner()

  jQuery.post(getFilePath('/re-func/re-functions.php'), {
    func: 'updateTemplateList',
    currentTemplateID: dbListInfo.template.id,
    listData: listDataJSON,
    itemCount,
    saveDesc
  }, (data, status) => {
    if (status === 'success') {
      setDBListInfoType('template', {
        desc: saveDesc
      })

      saveData(listData)
      renderMyLists()

      fadeOutSpinner()
      M.toast({ html: `Template Updated`, displayLength: 2000 })
    }
  })
}

const dbSaveProgressData = async (saveDesc = dbListInfo.progress.desc) => {
  const saveBtnEl = document.querySelector('#save-ranking')
  saveBtnEl.classList.add('disabled')
  const wpuid = await getUserID()
  const rankData = getRankData()

  // create a deep copy before stripping out id
  let newRankData = JSON.parse(JSON.stringify(rankData))

  // strip out uuid before saving to database
  newRankData.masterList.forEach((item) => {
    delete item.id
  })

  const itemCount = newRankData.masterList.length
  const percent = Math.floor(newRankData.finishSize * 100 / newRankData.totalSize)
  const rankDataJSON = JSON.stringify(newRankData)
  const category = getCategory()

  if (dbListInfo.progress.id === 0 && wpuid > 0) {
    const uuid = uuidv4()
    const parentList = getParentList()

    // INSERT
    jQuery.post(getFilePath('/re-func/re-functions.php'), {
      func: 'insertProgressList',
      wpuid,
      uuid,
      rankData: rankDataJSON,
      saveDesc,
      itemCount,
      percent,
      category,
      parentList
    }, (data, status) => {
      if (status === 'success') {
        let newData = parseInt(data.replace(/[\n\r]+/g, ''))
        setDBListInfoType('progress', {
          id: newData,
          desc: saveDesc
        })
        saveData(rankData)
        renderMyLists()

        saveBtnEl.classList.remove('disabled')

        M.toast({ html: `Progress List Saved`, displayLength: 2000 })
      }
    })
  } else if (dbListInfo.progress.id > 0) {
    // UPDATE
    jQuery.post(getFilePath('/re-func/re-functions.php'), {
      func: 'updateProgressList',
      currentProgressID: dbListInfo.progress.id,
      rankData: rankDataJSON,
      saveDesc,
      itemCount,
      percent
    }, (data, status) => {
      if (status === 'success') {
        setDBListInfoType('progress', {
          desc: saveDesc
        })
        saveData(rankData)
        renderMyLists()

        saveBtnEl.classList.remove('disabled')

        M.toast({ html: `Progress List Saved`, displayLength: 2000 })
      }
    })
  }
}

const dbUpdateResultData = (rankedItems, resultId) => {
  const category = getCategory()
  jQuery.post(getFilePath('/re-func/re-functions.php'), {
    func: 'updateResultRanking',
    rankedItems,
    resultId
  }, (data, status) => {
    if (status === 'success') {
      const resultData = getResultData()
      saveData(resultData)
      if (category === 2 && resultId > 0) {
        dbUpdateRankings(resultId)
      }
    }
  })
}

const dbSaveResultData = (rankedItems) => {
  const itemCount = rankedItems.length
  const rankData = getRankData()
  const resultData = getResultData()
  const bggFlag = rankData.bggFlag
  const templateID = dbListInfo.template.id
  const category = getCategory()
  const parentList = getParentList()

  jQuery.post(getFilePath('/re-func/re-functions.php'), {
    func: 'insertResultRanking',
    rankedItems,
    itemCount,
    bggFlag,
    templateID,
    category,
    parentList
  }, (data, status) => {
    if (status === 'success') {
      let newData = parseInt(data.replace(/[\n\r]+/g, ''))
      setDBListInfoType('result', {
        id: newData
      })
      saveData(resultData)

      // get str items from localStorage
      const lsParentLists = JSON.parse(localStorage.getItem('str'))
      // if null then set it / else push new ParentList into the array and set it
      if (lsParentLists === null) {
        const parentListArray = JSON.stringify([parentList])
        localStorage.setItem('str', parentListArray)
      } else {
        lsParentLists.push(parentList)
        localStorage.setItem('str', JSON.stringify(lsParentLists))
      }

      if (category === 2 && newData > 0) {
        dbUpdateRankings(dbListInfo.result.id)
      }
    }
  })
}

const dbSaveUserResultData = async (saveDesc) => {
  const wpuid = await getUserID()
  let resultData = getResultData()
  const itemCount = resultData.length

  let newResultData = JSON.parse(JSON.stringify(resultData))

  // strip out uuid before saving to database
  newResultData.forEach((item) => {
    delete item.id
  })

  const resultDataJSON = JSON.stringify(newResultData)
  const category = getCategory()

  fadeInSpinner()

  const uuid = uuidv4()

  jQuery.post(getFilePath('/re-func/re-functions.php'), {
    func: 'insertResultUser',
    currentProgressID: dbListInfo.progress.id,
    resultData: resultDataJSON,
    desc: saveDesc,
    itemCount: itemCount,
    category,
    wpuid,
    uuid
  }, (data, status) => {
    if (status === 'success') {
      let newData = parseInt(data.replace(/[\n\r]+/g, ''))
      setDBListInfoType('userResult', {
        id: newData,
        desc: saveDesc
      })
      document.querySelector('#save-results').classList.add('disabled')
      setDBListInfoType('progress', { id: 0, desc: '' })
      saveData(resultData)
      renderMyLists()

      // Set table title
      const titleEl = document.querySelector('.result-desc')
      titleEl.textContent = dbListInfo.userResult.desc !== '' ? `${dbListInfo.userResult.desc}:` : 'Your Results:'

      fadeOutSpinner()
      M.toast({ html: `Result List Saved`, displayLength: 2000 })
    }
  })
}

const dbUpdateRankings = (listId) => {
  jQuery.post(getFilePath('/re-func/re-functions.php'), {
    func: 'updateRankings',
    listId: listId
  }, (data, status) => {
  })
}

// type - Result, Template, Progress
const dbGetSharedList = (id, type) => {
  return new Promise((resolve, reject) => {
    jQuery.post(getFilePath('/re-func/re-functions.php'), {
      func: `getSharedList`,
      id: `"${id}"`,
      type: type
    }, (data, status) => {
      const parsedData = JSON.parse(data)
      resolve(parsedData)
    })
  })
}

const dbSetShareFlag = (id, value) => {
  return new Promise((resolve, reject) => {
    jQuery.post(getFilePath('/re-func/re-functions.php'), {
      func: `setShareFlag`,
      id: parseInt(id),
      value: parseInt(value)
    }, (data, status) => {
      resolve()
    })
  })
}

const dbCaptureBGGData = (data) => {
  jQuery.post(getFilePath('/re-func/re-functions.php'), {
    func: 'captureBGGData',
    data: data
  }, (data, status) => {
  })
}

const dbGetAnnouncement = () => {
  return new Promise((resolve, reject) => {
    jQuery.post(getFilePath('/re-func/re-functions.php'), {
      func: 'getAnnouncement'
    }, (data, status) => {
      if (status === 'success') {
        const parsedData = JSON.parse(data)
        parsedData ? resolve(parsedData) : reject(new Error('No data returned'))
      }
    })
  })
}

export { dbSaveTemplateData,
  dbSaveProgressData,
  dbSaveResultData,
  setDBListInfo,
  setDBListInfoType,
  getDBListInfo,
  dbUpdateTemplateData,
  dbSaveUserResultData,
  dbUpdateResultData,
  dbGetUserLists,
  dbLoadUserList,
  dbDeleteUserList,
  clearDBListInfo,
  dbGetTopTenYear,
  dbGetSharedList,
  dbSetShareFlag,
  dbCaptureBGGData,
  clearUserDBListInfo,
  dbGetAnnouncement
}

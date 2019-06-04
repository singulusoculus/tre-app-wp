import { getListData, initPrevList } from './list'
import { getRankData, initPrevRanking, resetHistory } from './rank'
import { getResultData, initPrevResult } from './result'
import { getCategory } from './category'
import { saveData } from './functions'
import { renderMyLists, setupSaveButtons } from './views'

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
}

const setDBListInfo = (newData) => {
  dbListInfo = newData
}

const dbGetUserLists = () => new Promise((resolve, reject) => {
  const wpuid = getUserID()

  jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
    func: 'getUserLists',
    wpuid
  }, (data, status) => {
    if (status === 'success') {
      const parsedData = JSON.parse(data)
      parsedData ? resolve(parsedData) : reject('No data returned')
    }
  })
})

const dbLoadUserList = (type, id) => {
  if (type === 'templates') {
    jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
      func: 'getTemplateList',
      templateid: id
    }, (data, status) => {
      if (status === 'success') {
        const parsedData = JSON.parse(data)
        const listData = JSON.parse(parsedData[0].template_data)
        const category = parsedData[0].list_category
        const desc = parsedData[0].template_desc
        const intID = parseInt(id)
        setDBListInfoType('template', { id: intID, desc })
        initPrevList(category, listData)
      }
    })
  } else if (type === 'progress') {
    jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
      func: 'getProgressList',
      progressid: id
    }, (data, status) => {
      if (status === 'success') {
        const parsedData = JSON.parse(data)
        const rankData = JSON.parse(parsedData[0].progress_data)
        const category = parsedData[0].list_category
        const desc = parsedData[0].progress_desc
        resetHistory()
        const intID = parseInt(id)
        setDBListInfoType('progress', { id: intID, desc })
        initPrevRanking(category, rankData)
      }
    })
  } else if (type === 'results') {
    jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
      func: 'getUserResultList',
      resultid: id
    }, (data, status) => {
      if (status === 'success') {
        const parsedData = JSON.parse(data)
        const resultData = JSON.parse(parsedData[0].result_data)
        const category = parsedData[0].list_category
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
  const r = confirm('Are you sure you want to delete this list?')
  if (r === true) {
    if (type === 'templates') {
      jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
        func: 'deleteTemplateList',
        templateid: id
      }, (data, status) => {
        if (status === 'success') {
          renderMyLists()
          setupSaveButtons()
        }
      })
    } else if (type === 'progress') {
      jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
        func: 'deleteProgressList',
        progressid: id
      }, (data, status) => {
        if (status === 'success') {
          renderMyLists()
          setupSaveButtons()
        }
      })
    } else if (type === 'results') {
      jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
        func: 'deleteUserResultList',
        resultid: id
      }, (data, status) => {
        if (status === 'success') {
          renderMyLists()
          setupSaveButtons()
        }
      })
    }
  }
}

const dbSaveTemplateData = (saveDesc) => {
  const wpuid = getUserID()
  let listData = getListData()
  const itemCount = listData.length
  const listDataJSON = JSON.stringify(listData)
  const category = getCategory()
  setDBListInfoType('template', { id: 0, desc: '' })

  if (dbListInfo.template.id === 0) {
    jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
      func: 'insertTemplateList',
      wpuid,
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
        console.log('Saved Template')
        console.log(dbListInfo.template.id)

        saveData(listData)
      } else {
        console.log(data)
      }
    })
  }
}

const dbUpdateTemplateData = (saveDesc) => {
  let listData = getListData()
  const itemCount = listData.length
  const listDataJSON = JSON.stringify(listData)

  jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
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
      console.log('Updated Template')
      console.log(dbListInfo.template.id)
      console.log(dbListInfo.template.desc)

      saveData(listData)
    }
  })
}

const dbSaveProgressData = (saveDesc) => {
  const wpuid = getUserID()
  let rankData = getRankData()
  const itemCount = rankData.masterList.length
  const percent = Math.floor(rankData.finishSize * 100 / rankData.totalSize)
  const rankDataJSON = JSON.stringify(rankData)
  const category = getCategory()

  if (dbListInfo.progress.id === 0) {
    // INSERT
    jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
      func: 'insertProgressList',
      wpuid,
      rankData: rankDataJSON,
      saveDesc,
      itemCount,
      percent,
      category
    }, (data, status) => {
      if (status === 'success') {
        let newData = parseInt(data.replace(/[\n\r]+/g, ''))
        setDBListInfoType('progress', {
          id: newData,
          desc: saveDesc
        })
        console.log('Insert Progress')
        console.log(dbListInfo.progress.id)
        saveData(rankData)
      }
    })
  } else {
    // UPDATE
    jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
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
        console.log('Update Progress')
        console.log(dbListInfo.progress.id)
        saveData(rankData)
      }
    })
  }
}

const dbUpdateResultData = (rankedItems, resultId) => {
  const category = getCategory()
  console.log('start update')
  jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
    func: 'updateResultRanking',
    rankedItems,
    resultId
  }, (data, status) => {
    if (status === 'success') {
      const resultData = getResultData()
      saveData(resultData)
      console.log('List updated')
      if (category === 2) {
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

  jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
    func: 'insertResultRanking',
    rankedItems,
    itemCount,
    bggFlag,
    templateID,
    category
  }, (data, status) => {
    if (status === 'success') {
      let newData = parseInt(data.replace(/[\n\r]+/g, ''))
      setDBListInfoType('result', {
        id: newData
      })
      console.log('Saved Result')
      console.log(dbListInfo.result.id)
      saveData(resultData)

      if (category === 2 && itemCount > 10) {
        dbUpdateRankings(dbListInfo.result.id)
      }
    }
  })
}

const dbSaveUserResultData = (saveDesc) => {
  const wpuid = getUserID()
  let resultData = getResultData()
  const itemCount = resultData.length
  const resultDataJSON = JSON.stringify(resultData)
  const category = getCategory()

  jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
    func: 'insertResultUser',
    currentProgressID: dbListInfo.progress.id,
    resultData: resultDataJSON,
    desc: saveDesc,
    itemCount: itemCount,
    category,
    wpuid
  }, (data, status) => {
    if (status === 'success') {
      let newData = parseInt(data.replace(/[\n\r]+/g, ''))
      setDBListInfoType('userResult', {
        id: newData,
        desc: saveDesc
      })
      console.log('Saved User Result')
      console.log(dbListInfo.userResult.id)
      document.querySelector('#save-results').classList.add('disabled')
      setDBListInfoType('progress', { id: 0, desc: '' })
      saveData(resultData)
    }
  })
}

const dbUpdateRankings = (listId) => {
  jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
    func: 'updateRankings',
    listId: listId
  }, (data, status) => {
    console.log('Updated re_boardgames')
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
  dbDeleteUserList
}

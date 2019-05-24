import { getListData } from './list'
import { getRankData } from './rank'
import { getResultData } from './result'
import { getCategory } from './category'
import { saveData } from './functions'

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

  if (dbListInfo.progress.id === 0) {
    // INSERT
    jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
      func: 'insertProgressList',
      wpuid,
      rankData: rankDataJSON,
      saveDesc,
      itemCount,
      percent
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
    }
  })
}

const dbUpdateResultData = (rankedItems) => {

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
      setDBListInfoType('progress', { id: 0, desc: '' })
      saveData(resultData)
    }
  })
}

export { dbSaveTemplateData,
  dbSaveProgressData,
  dbSaveResultData,
  setDBListInfo,
  setDBListInfoType,
  getDBListInfo,
  dbUpdateTemplateData,
  dbSaveUserResultData }

import { getListData } from './list'
import { getRankData } from './rank'
import { getResultData } from './result'
import { getCategory } from './category'

let currentListID = {
  template: 0,
  progress: 0,
  result: 0
}

const getcurrentListID = (type) => currentListID[type]

const setCurrentListID = (update) => {
  if (typeof update.template === 'number') {
    currentListID.template = update.template
  }

  if (typeof update.progress === 'number') {
    currentListID.progress = update.progress
  }

  if (typeof update.result === 'number') {
    currentListID.result = update.result
  }
}

// const resetCurrentListID = () => {
//   setCurrentListID({
//     template: 0,
//     progress: 0,
//     result: 0
//   })
// }

const saveResultData = (rankedItems) => {
  const itemCount = rankedItems.length
  const rankData = getRankData()
  const bggFlag = rankData.bggFlag
  const templateID = currentListID.template
  const category = getCategory()

  jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
    func: 'saveResultRanking',
    rankedItems,
    itemCount,
    bggFlag,
    templateID,
    category
  }, (data, status) => {
    if (status === 'success') {
      let newData = parseInt(data.replace(/[\n\r]+/g, ''))
      setCurrentListID({
        result: newData
      })
      console.log('Saved Result')
      console.log(currentListID.result)
    }
  })
}

const saveProgressData = (saveDesc) => {
  const wpuid = getUserID()
  let rankData = getRankData()
  const itemCount = rankData.masterList.length
  const percent = Math.floor(rankData.finishSize * 100 / rankData.totalSize)
  rankData = JSON.stringify(rankData)

  jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
    func: 'saveProgressList',
    currentProgressID: currentListID.progress,
    wpuid,
    rankData,
    saveDesc,
    itemCount,
    percent
  }, (data, status) => {
    if (status === 'success') {
      let newData = parseInt(data.replace(/[\n\r]+/g, ''))
      setCurrentListID({
        progress: newData
      })
      console.log('Saved Progress')
      console.log(currentListID.progress)
    }
  })
}

const saveTemplateData = (saveDesc) => {
  const wpuid = getUserID()
  let listData = getListData()
  const itemCount = listData.length
  listData = JSON.stringify(listData)
  const category = getCategory()

  jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
    func: 'saveTemplateList',
    currentTemplateID: currentListID.template,
    wpuid,
    listData,
    itemCount,
    saveDesc,
    category
  }, (data, status) => {
    let newData = parseInt(data.replace(/[\n\r]+/g, ''))
    if (status === 'success') {
      setCurrentListID({
        template: newData
      })
      console.log('Saved Template')
      console.log(currentListID.template)
    }
  })
}

const saveUserResultData = (saveDesc) => {

}

export { getcurrentListID, setCurrentListID, saveTemplateData, saveProgressData, saveResultData }

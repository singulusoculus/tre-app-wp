import { getListData } from './list'
import { getRankData } from './rank'

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

  jQuery.post('./wp-content/themes/Ranking-Engine/re-functions.php', {
    func: 'saveTemplateList',
    currentTemplateID: currentListID.template,
    wpuid,
    listData,
    itemCount,
    saveDesc
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

export { getcurrentListID, setCurrentListID, saveTemplateData, saveProgressData }

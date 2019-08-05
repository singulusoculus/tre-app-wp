
const dbGetTemplateListData = (uuid) => {
  return new Promise((resolve, reject) => {
    jQuery.post(getFilePath('/re-func/re-shared-rankings-functions.php'), {
      func: 'getTemplateListData',
      uuid: `"${uuid}"`
    }, (data, status) => {
      if (status === 'success') {
        const parsedData = JSON.parse(data)
        parsedData ? resolve(parsedData) : reject(new Error('No data returned'))
      }
    })
  })
}

const dbGetTimesRanked = (id) => {
  return new Promise((resolve, reject) => {
    jQuery.post(getFilePath('/re-func/re-shared-rankings-functions.php'), {
      func: 'getTimesRanked',
      id
    }, (data, status) => {
      if (status === 'success') {
        const parsedData = JSON.parse(data)
        parsedData ? resolve(parsedData) : reject(new Error('No data returned'))
      }
    })
  })
}

const dbGetSharedResults = (id) => {
  return new Promise((resolve, reject) => {
    jQuery.post(getFilePath('/re-func/re-shared-rankings-functions.php'), {
      func: 'getSharedResults',
      id
    }, (data, status) => {
      if (status === 'success') {
        const parsedData = JSON.parse(data)
        parsedData ? resolve(parsedData) : reject(new Error('No data returned'))
      }
    })
  })
}

const dbSetShareResultsFlag = (id, value) => {
  jQuery.post(getFilePath('/re-func/re-shared-rankings-functions.php'), {
    func: `setShareResultsFlag`,
    id: id,
    value: value
  }, (data, status) => {
  })
}

export { dbGetTemplateListData, dbGetSharedResults, dbGetTimesRanked, dbSetShareResultsFlag }

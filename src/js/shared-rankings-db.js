
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

export { dbGetTemplateListData }


export const getUserID = () => {
  return new Promise((resolve, reject) => {
    jQuery.post(getFilePath('/re-func/re-functions.php'), {
      func: 'getWPUserID'
    }, (data, status) => {
      if (status === 'success') {
        resolve(parseInt(data))
        // resolve(0)
      }
    })
  })
}

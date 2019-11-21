
export const getUserID = () => {
  return new Promise((resolve, reject) => {
    jQuery.post(getFilePath('/re-func/re-functions.php'), {
      func: 'getWPUserID'
    }, (data, status) => {
      if (status === 'success') {
        resolve(parseInt(data))
      }
    })
  })
}

// //////////////////////////////////////////////////////////////////////
// // MODALS / CUSTOM CONFIRMS
// //////////////////////////////////////////////////////////////////////

export const custConfirm = (message, resultCallback, source) => {
  const alertText = document.querySelector('.alert-text')
  alertText.innerText = message

  const instance = M.Modal.getInstance(document.querySelector('#alert-modal'))
  instance.open()

  const eventFunc = () => {
    resultCallback(source)
    clearAlertEventListeners()
  }

  const clearAlertEventListeners = () => {
    document.querySelector('#alert-ok-btn').removeEventListener('click', eventFunc)
  }

  document.querySelector('#alert-ok-btn').addEventListener('click', eventFunc)

  document.querySelector('#alert-cancel-btn').addEventListener('click', () => {
    clearAlertEventListeners()
    instance.close()
  })
}

export const custMessage = (message) => {
  document.querySelector('.message-text').textContent = message

  const instance = M.Modal.getInstance(document.querySelector('#message-modal'))
  instance.open()
}

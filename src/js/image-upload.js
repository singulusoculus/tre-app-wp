import { getListData } from './list'
import { renderListData } from './views'

const uploadFile = (file, id) => {
  const cloudName = 'du5uog7ql'
  const unsignedUploadPreset = 'tjnvqgbf'

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
  const xhr = new XMLHttpRequest()
  const fd = new FormData()
  xhr.open('POST', url, true)
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

  xhr.onreadystatechange = (e) => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      // File uploaded successfully
      const response = JSON.parse(xhr.responseText)
      const url = response.secure_url

      const listData = getListData()
      const objIndex = listData.findIndex(obj => obj.id === id)
      listData[objIndex].image = url

      renderListData()
    }
  }

  fd.append('upload_preset', unsignedUploadPreset)
  fd.append('file', file)
  xhr.send(fd)
}

const resizeImage = (settings) => {
  const file = settings.file
  const maxWidth = settings.maxWidth
  const maxHeight = settings.maxHeight
  const reader = new FileReader()
  const image = new Image()
  const canvas = document.createElement('canvas')

  // var dataURItoBlob = function (dataURI) {
  //   var bytes = dataURI.split(',')[0].indexOf('base64') >= 0 ? atob(dataURI.split(',')[1]) : unescape(dataURI.split(',')[1])
  //   var mime = dataURI.split(',')[0].split(':')[1].split(';')[0]
  //   var max = bytes.length
  //   var ia = new Uint8Array(max)
  //   for (var i = 0; i < max; i++) {
  //     ia[i] = bytes.charCodeAt(i)
  //     return new Blob([ia], { type: mime })
  //   }
  // }

  const resize = function () {
    let width = image.width
    let height = image.height
    if (width > height) {
      if (width > maxWidth) {
        height *= maxWidth / width
        width = maxWidth
      }
    } else {
      if (height > maxHeight) {
        width *= maxHeight / height
        height = maxHeight
      }
    }
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(image, 0, 0, width, height)
    const dataUrl = canvas.toDataURL('image/png')
    // return dataURItoBlob(dataUrl)
    return dataUrl
  }

  return new Promise((resolve, reject) => {
    if (!file.type.match(/image.*/)) {
      reject(new Error('Not an image'))
      return
    }
    reader.onload = function (readerEvent) {
      image.onload = function () { return resolve(resize()) }
      image.src = readerEvent.target.result
    }
    reader.readAsDataURL(file)
  })
}

export { uploadFile, resizeImage }

import { getListData } from './list'
import { renderListData } from './views'
import { saveData } from './functions'
import { getCategoryInfo } from './category'

const uploadFile = (file, id) => {
  const cloudName = 'du5uog7ql'
  const unsignedUploadPreset = 'tjnvqgbf'

  const listData = getListData()
  const objIndex = listData.findIndex(obj => obj.id === id)

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

      listData[objIndex].image = url

      saveData(listData)
      renderListData()
    }
  }

  // create folder name
  var d = new Date()
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const year = d.getFullYear()
  const month = months[d.getMonth()]
  const folder = year + '-' + month

  // get tags
  const category = getCategoryInfo().name
  const name = listData[objIndex].name
  const nameParts = name.split(' ')
  const tags = []
  tags.push(category)
  nameParts.forEach((i) => {
    tags.push(i)
  })

  fd.append('upload_preset', unsignedUploadPreset)
  fd.append('folder', folder)
  fd.append('tags', tags)
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

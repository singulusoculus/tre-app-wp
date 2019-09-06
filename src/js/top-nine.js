
const checkforImages = (data) => {
  const topNine = data.slice(0, 9)
  const images = []
  topNine.forEach(i => {
    if (i.imageOriginal !== '') {
      images.push(i.imageOriginal)
    }
  })

  if (images.length === 9) {
    return images
  } else {
    return false
  }
}

const renderTopNine = (images) => {
  jQuery('.ball-loading').fadeIn()
  const canvasEl = document.createElement('canvas')
  canvasEl.width = 1080
  canvasEl.height = 1080
  const canvasElctx = canvasEl.getContext('2d')

  renderBackground(canvasElctx)
    .then(() => renderImages(images, canvasElctx))
    .then(() => renderLogo(canvasElctx))
    .then(() => renderFinalImage(canvasEl, canvasElctx))
}

const renderBackground = (ctx) => {
  return new Promise((resolve, reject) => {
    const backgroundImage = new Image()
    backgroundImage.onload = () => {
      ctx.drawImage(backgroundImage, 0, 0)
      resolve()
    }
    backgroundImage.src = getFilePath(`/images/background.png`)
  })
}

const renderLogo = (ctx) => {
  return new Promise((resolve, reject) => {
    const logoImage = new Image()
    logoImage.onload = () => {
      ctx.drawImage(logoImage, 995, 995)
      resolve()
    }
    logoImage.src = getFilePath(`/images/pm-logo-md.png`)
  })
}

const renderImages = (images, ctx) => {
  return new Promise((resolve, reject) => {
    const promises = images.map((image, index) => new Promise((resolve, reject) => {
      const filename = `${index}.png`
      const mimeType = 'image/jpeg'
      const proxyURL = 'https://mighty-waters-78900.herokuapp.com/' // my implementation of cors-anywhere

      urlToFile(image, filename, mimeType, proxyURL)
        .then(file => resizeImage(file, index))
        .then(data => renderSingleCanvas(data, ctx))
        .then(() => {
          resolve()
        })
    }))
    resolve(Promise.all(promises))
  })
}

const renderFinalImage = (canvas, ctx) => {
  jQuery('.ball-loading').fadeOut('veryslow', () => {
    const finalImage = canvas.toDataURL('image/png')
    document.querySelector('.top-nine-image').src = finalImage
    jQuery('.top-nine-image').fadeIn('slow')
  })
}

const renderSingleCanvas = (data, canvasElctx) => {
  return new Promise((resolve, reject) => {
    const canvasSingle = document.createElement('canvas')
    canvasSingle.width = 352
    canvasSingle.height = 352
    const ctxSingle = canvasSingle.getContext('2d')
    ctxSingle.drawImage(data.newImageEl, 0 + data.xOffset, 0 + data.yOffset, data.coverWidth, data.coverHeight)
    canvasElctx.drawImage(canvasSingle, data.x, data.y)
    resolve()
  })
}

const urlToFile = (url, filename, mimeType, proxyURL = '') => {
  // const proxyURL = 'https://mighty-waters-78900.herokuapp.com/' // my implementation of cors-anywhere
  mimeType = mimeType || (url.match(/^data:([^;]+);/) || '')[1]
  return (fetch(proxyURL + url)
    .then(function (res) { return res.arrayBuffer() })
    .then(function (buf) { return new File([buf], filename, { type: mimeType }) })
  )
}

const resizeImage = (file, index) => {
  const maxWidth = 352
  const maxHeight = 352
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

    // Calculate cover dimensions
    const widthCalc = maxWidth - width
    const heightCalc = maxHeight - height
    let coverWidth = 0
    let coverHeight = 0
    let xOffset = 0
    let yOffset = 0

    if (widthCalc > heightCalc) {
      coverWidth = width + widthCalc
      coverHeight = height + widthCalc
    } else if (heightCalc > widthCalc) {
      coverWidth = width + heightCalc
      coverHeight = height + heightCalc
    } else {
      coverWidth = maxWidth
      coverHeight = maxHeight
    }

    // calculate offset - if widthe is longer than maxSize
    if (coverWidth > maxWidth) {
      xOffset = (maxWidth - coverWidth) / 2
    }

    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(image, 0, 0, width, height)
    const dataUrl = canvas.toDataURL('image/png')

    const newImageEl = new Image()
    newImageEl.src = dataUrl

    const baseCoordinates = [
      { x: 6, y: 6 },
      { x: 364, y: 6 },
      { x: 722, y: 6 },
      { x: 6, y: 364 },
      { x: 364, y: 364 },
      { x: 722, y: 364 },
      { x: 6, y: 722 },
      { x: 364, y: 722 },
      { x: 722, y: 722 }
    ]

    return {
      newImageEl,
      dataUrl,
      width,
      height,
      x: baseCoordinates[index].x,
      y: baseCoordinates[index].y,
      coverWidth,
      coverHeight,
      xOffset,
      yOffset,
      index
    }
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

export { renderTopNine, checkforImages }

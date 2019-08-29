
const baseCoordinates = [
  { x: 2.5, y: 2.5 },
  { x: 215, y: 2.5 },
  { x: 427.5, y: 2.5 },
  { x: 2.5, y: 215 },
  { x: 215, y: 215 },
  { x: 427.5, y: 215 },
  { x: 2.5, y: 427.5 },
  { x: 215, y: 427.5 },
  { x: 427.5, y: 427.5 }
]

const checkforImages = (data) => {
  const topNine = data.slice(0, 9)
  const images = []
  topNine.forEach(i => {
    if (i.image !== '') {
      images.push(i.image)
    }
  })

  if (images.length === 9) {
    return images
  } else {
    return false
  }
}

const createImg = (image) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve(img)
    }
    img.src = image
  })
}

const getImageWidthHeight = (image, index) => {
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.onload = () => resolve({
      image: image,
      imgEl: img,
      width: img.width,
      height: img.height,
      x: baseCoordinates[index].x,
      y: baseCoordinates[index].y,
      resizeWidth: 0,
      resizeHeight: 0,
      coverWidth: 0,
      coverHeight: 0,
      xOffset: 0,
      yOffset: 0,
      index: index
    })
    img.onerror = reject
    img.src = image
  })
}

const calcImageProperties = (obj) => {
  return new Promise((resolve, reject) => {
  // Calculate cover dimensions

    if (obj.width > obj.height) {
      if (obj.width > 210) {
        obj.resizeHeight = obj.height * (210 / obj.width)
        obj.resizeWidth = 210
      }
    } else if (obj.height > obj.width) {
      if (obj.height > 210) {
        obj.resizeWidth = obj.width * (210 / obj.height)
        obj.resizeHeight = 210
      }
    } else {
      obj.resizeWidth = 210
      obj.resizeHeight = 210
    }

    const widthCalc = 210 - obj.resizeWidth
    const heightCalc = 210 - obj.resizeHeight

    if (widthCalc > heightCalc) {
      obj.coverWidth = obj.resizeWidth + widthCalc
      obj.coverHeight = obj.resizeHeight + widthCalc
    } else if (heightCalc > widthCalc) {
      obj.coverWidth = obj.resizeWidth + heightCalc
      obj.coverHeight = obj.resizeHeight + heightCalc
    } else {
      obj.coverWidth = 210
      obj.coverHeight = 210
    }

    // calculate offset - if widthe is longer than 210
    if (obj.coverWidth > 210) {
      const xOffset = (210 - obj.coverWidth) / 2
      obj.xOffset = xOffset
    }

    console.log(obj)

    resolve(obj)
  })
}

const renderTempCanvas = (info) => {
  return new Promise((resolve, reject) => {
    let canvas = document.querySelector(`.tc-${info.index}`)
    let ctx = canvas.getContext('2d')
    ctx.drawImage(info.imgEl, 0 + info.xOffset, 0 + info.yOffset, info.coverWidth, info.coverHeight)
    info = { ...info, canvas: canvas }
    resolve(info)
  })
}

const renderImage = (info, ctx) => {
  ctx.drawImage(info.canvas, info.x, info.y)
}

const renderImages = (images, ctx) => {
  return new Promise((resolve, reject) => {
    const promises = images.map((image, index) => new Promise((resolve, reject) => {
      getImageWidthHeight(image, index)
        .then(obj => calcImageProperties(obj))
        .then(obj => renderTempCanvas(obj))
        .then(info => {
          renderImage(info, ctx)
          resolve()
        })
    }))
    resolve(Promise.all(promises))
  })
}

const renderBackground = (ctx) => {
  const image = getFilePath(`/images/background.png`)
  return createImg(image)
    .then(img => {
      ctx.drawImage(img, 0, 0)
    })
}

const renderLogo = (ctx) => {
  const image = getFilePath(`/images/pm-logo-sm.png`)
  return createImg(image).then(img => {
    ctx.drawImage(img, 590, 590)
  })
}

const renderTopNine = (images) => {
  const canvas = document.querySelector('.top-nine-canvas')
  const ctx = canvas.getContext('2d')

  renderBackground(ctx)
    .then(() => {
      return renderImages(images, ctx)
    })
    .then(() => {
      return renderLogo(ctx)
    })
    .catch(error => console.log(error))
}

export { renderTopNine, checkforImages }

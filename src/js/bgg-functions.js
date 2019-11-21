import { custMessage } from './common'
import { dbCaptureBGGData } from './database'

const getBGGData = (url) => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => handleErrors(response))
      .then(response => response.text())
      .then(str => (new window.DOMParser()).parseFromString(str, 'text/xml'))
      .then(data => {
        const dataJSON = xmlToJson(data)
        let bggJSONData

        if (dataJSON.items) {
          bggJSONData = dataJSON.items.item
        } else {
          bggJSONData = []
        }

        if (!Array.isArray(bggJSONData)) {
          if (bggJSONData) {
            bggJSONData = [bggJSONData]
          } else {
            bggJSONData = []
          }
        }
        // Always resolves an array
        resolve(bggJSONData)
      }).catch((error) => {
        console.log(error)
        jQuery('.ball-loading.collection').fadeOut()
        jQuery('.ball-loading.search-results').fadeOut()
        document.querySelector('#bgg-submit').classList.remove('disabled')
        document.querySelector('#bgg-search-submit').classList.remove('disabled')
        custMessage(`There was an error fetching data from BGG. Check the information you entered. BGG servers may also be busy or you have made too many requests. Please try again in a minute.`)
      })
  })
}

const handleErrors = (response) => {
  if (!response.ok) {
    throw Error(response.statusText)
  }
  return response
}

const getBGGGameDetailData = (bggIds, mode = 'search') => {
  return new Promise(async (resolve, reject) => {
    let dataURL = 'https://boardgamegeek.com/xmlapi2/thing?stats=1&id='
    bggIds.forEach((id) => {
      dataURL += id + ','
    })

    const results = await getBGGData(dataURL)
    let items = []

    results.forEach((i) => {
      items.push(i)
    })

    resolve(createBGGGameDataObjects(items, mode))
  })
}

const createBGGGameDataObjects = (items, mode) => {
  let bggGameData = []
  items.forEach((item) => {
    let gameDataDetails = {}
    gameDataDetails.bggId = item['@attributes'].id
    gameDataDetails.yearPublished = item.yearpublished ? item.yearpublished['@attributes'].value : 0
    gameDataDetails.type = item['@attributes'].type === 'boardgame' ? 'Base' : 'Expansion'
    gameDataDetails.minPlayers = item.minplayers['@attributes'].value
    gameDataDetails.maxPlayers = item.maxplayers['@attributes'].value
    gameDataDetails.minPlaytime = item.minplaytime['@attributes'].value
    gameDataDetails.maxPlaytime = item.maxplaytime['@attributes'].value
    gameDataDetails.playingtime = item.playingtime['@attributes'].value
    gameDataDetails.image = item.thumbnail ? item.thumbnail['#text'] : ''
    gameDataDetails.imageOriginal = item.image ? item.image['#text'] : ''
    gameDataDetails.minAge = item.minage ? item.minage['@attributes'].value : ''

    // Links
    let mechanisms = []
    let categories = []
    let artists = []
    let designers = []
    let publishers = []
    let family = []

    if (!Array.isArray(item.link)) {
      item.link = [item.link]
    }

    item.link.forEach((link) => {
      if (link['@attributes'].type === 'boardgamemechanic') {
        mechanisms.push(link['@attributes'].value)
      }
      if (link['@attributes'].type === 'boardgamecategory') {
        categories.push(link['@attributes'].value)
      }
      if (link['@attributes'].type === 'boardgameartist') {
        artists.push(link['@attributes'].value)
      }
      if (link['@attributes'].type === 'boardgamedesigner') {
        designers.push(link['@attributes'].value)
      }
      if (link['@attributes'].type === 'boardgamepublisher') {
        publishers.push(link['@attributes'].value)
      }
      if (link['@attributes'].type === 'boardgamefamily') {
        family.push(link['@attributes'].value)
      }
    })
    gameDataDetails.mechanisms = mechanisms
    gameDataDetails.categories = categories
    gameDataDetails.artists = artists
    gameDataDetails.designers = designers
    gameDataDetails.publishers = publishers
    gameDataDetails.family = family

    // Stats
    // .statistics.ratings.average["@attributes"].value
    const stats = item.statistics.ratings
    gameDataDetails.averageRating = stats.average['@attributes'].value
    gameDataDetails.numOwned = stats.owned['@attributes'].value

    // bggRank
    if (!Array.isArray(stats.ranks.rank)) {
      stats.ranks.rank = [stats.ranks.rank]
    }

    const rank = stats.ranks.rank.find((e) => e['@attributes'].name === 'boardgame')
    if (rank['@attributes'].value === 'Not Ranked') {
      gameDataDetails.bggRank = 1000000
    } else {
      gameDataDetails.bggRank = parseInt(rank['@attributes'].value)
    }

    // Names
    let altNames = []

    if (!Array.isArray(item.name)) {
      item.name = [item.name]
    }

    item.name.forEach((name) => {
      if (name['@attributes'].type === 'primary') {
        gameDataDetails.name = name['@attributes'].value
      }
      if (name['@attributes'].type === 'alternate') {
        altNames.push(name['@attributes'].value)
      }
    })

    gameDataDetails.altNames = altNames

    if (mode === 'search') {
      gameDataDetails.addedToList = false
      gameDataDetails.source = 'bgg'
      gameDataDetails.sourceType = 'search'
    }

    bggGameData.push(gameDataDetails)
  })
  return bggGameData
}

const captureBGGData = async (bggIds) => {
  // break bggIds into chunks for smaller queries to bgg
  const perChunk = 50

  let idArrays = bggIds.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk)

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [] // start a new chunk
    }

    resultArray[chunkIndex].push(item)

    return resultArray
  }, [])

  let bggGameData = []

  for (let i = 0; i < idArrays.length; i++) {
    let data = await getBGGGameDetailData(idArrays[i], 'db')
    bggGameData = bggGameData.concat(data)
  }

  const bggGameDataJSON = JSON.stringify(bggGameData)

  dbCaptureBGGData(bggGameDataJSON)
}

// Changes XML to JSON
const xmlToJson = (xml) => {
  // Create the return object
  let obj = {}

  if (xml.nodeType === 1) { // element
    // attributes
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {}
      for (let j = 0; j < xml.attributes.length; j++) {
        let attribute = xml.attributes.item(j)
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue
      }
    }
  } else if (xml.nodeType === 3) { // text
    obj = xml.nodeValue
  }

  // children
  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      let item = xml.childNodes.item(i)
      let nodeName = item.nodeName
      if (typeof (obj[nodeName]) === 'undefined') {
        obj[nodeName] = xmlToJson(item)
      } else {
        if (typeof (obj[nodeName].push) === 'undefined') {
          let old = obj[nodeName]
          obj[nodeName] = []
          obj[nodeName].push(old)
        }
        obj[nodeName].push(xmlToJson(item))
      }
    }
  }
  return obj
}

export { getBGGData, getBGGGameDetailData, xmlToJson, captureBGGData }

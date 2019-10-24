import { custMessage, renderCollectionEl } from './views'
import { addListItems, getListData, createList } from './list'
import { updateBGGFilters, filterBGGCollection } from './filters'
import { xmlToJson } from './bgg-functions'
import { dbCaptureBGGData } from './database'
import uuidv4 from 'uuid'

let bggCollectionData = []

const getBGGCollectionData = () => bggCollectionData

const setBGGCollectionData = (data) => {
  bggCollectionData = data
}

const saveBGGCollection = () => {
  const bggUsername = document.querySelector('#bgg-username').value

  const obj = {
    bggUsername,
    bggCollectionData
  }
  localStorage.setItem('bggCollection', JSON.stringify(obj))
}

const initPrevBGGCollection = () => {
  // Load previous BGG data if exists
  const bggData = JSON.parse(localStorage.getItem('bggCollection'))
  if (bggData !== null) {
    if (bggData.bggCollectionData.length > 0) {
      setBGGCollectionData(bggData.bggCollectionData)
      document.querySelector('#bgg-username').value = bggData.bggUsername
      showBGGCollectionSection()
      updateBGGFilters()
      renderCollectionEl('bgg-collection')
    }
  }
}

const handleBGGCollectionRequest = async () => {
  const user = document.querySelector('#bgg-username').value.trim().replace(/ /g, '%20')

  if (user === '') {
    custMessage('Please input your BGG user name')
  } else {
    const expansions = document.querySelector('#bgg-expansions').checked ? 1 : 0
    bggCollectionData = await getBGGCollection(user, expansions)
    // saveBGGCollection()

    jQuery('.ball-loading.collection').fadeOut(() => {
      document.querySelector('#bgg-submit').classList.remove('disabled')
      showBGGCollectionSection()
      renderCollectionEl('bgg-collection')
    })

    const bggGameData = []
    bggCollectionData.forEach((i) => {
      bggGameData.push({
        bggId: i.bggId,
        name: i.name,
        yearPublished: i.yearPublished
      })
    })

    console.log(bggGameData)

    dbCaptureBGGData(bggGameData)

    // Save new bgg games to database
    // let bggIds = []
    // bggCollectionData.forEach((item) => {
    //   bggIds.push(item.bggId)
    // })
    // const bggGameData = getBGGGameData(bggIds)
    // console.log(bggGameData)
    // dbCaptureNewBGGGames(bggGameData)
  }
}

const getBGGCollection = (user, expansions) => new Promise((resolve, reject) => {
  // fadeInSpinner()
  jQuery('.ball-loading.collection').fadeIn()
  document.querySelector('#bgg-submit').classList.add('disabled')
  // Get collection - this excludes played-only games
  jQuery.post(getFilePath('/re-func/re-functions.php'), {
    func: 'getBGGCollection',
    bggUsername: user,
    expansions: expansions
  }, (data, status) => {
    let newData = parseInt(data.replace(/[\n\r]+/g, ''))

    // 1 = invalid username; 2 = timed out, try again later; Too Many Requests; failed to open steam
    if (newData === 1) {
      // fadeOutSpinner()
      jQuery('.ball-loading.collection').fadeOut()
      document.querySelector('#bgg-submit').classList.remove('disabled')
      reject(new Error('Invalid username'))
      custMessage('Invalid username. Please try again.')
    } else if (newData === 2) {
      // fadeOutSpinner()
      jQuery('.ball-loading.collection').fadeOut()
      document.querySelector('#bgg-submit').classList.remove('disabled')
      reject(new Error('Timed Out. Try again later.'))
      custMessage('The request for you collection timed out. BGG servers may be busy. Please try again in a little bit.')
    } else if (data.indexOf('Too Many Requests') > 0) {
      // fadeOutSpinner()
      jQuery('.ball-loading.collection').fadeOut()
      document.querySelector('#bgg-submit').classList.remove('disabled')
      reject(new Error('Too Many Requests'))
      custMessage('BGG servers are busy at the moment. Please wait a minute and try again')
    } else if (data.indexOf('failed to open stream') > 0) {
      jQuery('.ball-loading.collection').fadeOut()
      document.querySelector('#bgg-submit').classList.remove('disabled')
      reject(new Error('Connection Problems'))
      custMessage('The Ranking Engine is having problems connecting to BGG. Please try again later.')
    } else if (data.indexOf('totalitems="0"') > 0) {
      jQuery('.ball-loading.collection').fadeOut()
      document.querySelector('#bgg-submit').classList.remove('disabled')
      reject(new Error('No items in collection'))
      custMessage('There are not items in your collection. Please navigate to BGG and add some before importing.')
    } else {
      let bggList = createBGGList(data)

      // Get all played games then merge the lists into one
      jQuery.post(getFilePath('/re-func/re-functions.php'), {
        func: 'getBGGPlayed',
        bggUsername: user,
        expansions: expansions
      }, (data, status) => {
        if (data.indexOf('totalitems="0"') === -1) {
          const played = createBGGList(data)
          played.forEach((item) => {
            bggList.push(item)
          })
        }
        bggList = bggList.filter((list, index, self) => self.findIndex(l => l.bggId === list.bggId) === index)
        resolve(bggList)
      })
    }
  })
})

const createBGGList = (data) => {
  const listData = getListData()
  const xmlDoc = data.replace(/[\n\r]+/g, '')
  const parser = new DOMParser()
  const xml = parser.parseFromString(xmlDoc, 'text/xml')
  const dataJSON = xmlToJson(xml)
  let items = dataJSON.items.item
  let bggList = []

  if (!Array.isArray(items)) {
    items = [items]
  }

  items.forEach((item) => {
    const statusAttributes = item.status['@attributes']

    const obj = {
      id: uuidv4(),
      name: item.name ? item.name['#text'] : 'No Title',
      source: 'bgg',
      sourceType: 'collection',
      imageOriginal: item.image ? item.image['#text'] : './wp-content/themes/Ranking-Engine/images/meeple-lime.png',
      image: item.thumbnail ? item.thumbnail['#text'] : './wp-content/themes/Ranking-Engine/images/meeple-lime.png',
      yearPublished: item.yearpublished ? parseInt(item.yearpublished['#text']) : 0,
      bggId: item['@attributes'].objectid,
      own: statusAttributes.own === '1',
      fortrade: statusAttributes.fortrade === '1',
      prevowned: statusAttributes.prevowned === '1',
      want: statusAttributes.want === '1',
      wanttobuy: statusAttributes.wanttobuy === '1',
      wanttoplay: statusAttributes.wanttoplay === '1',
      wishlist: statusAttributes.wishlist === '1',
      played: item.numplays['#text'] > 0,
      plays: item.numplays['#text'],
      rated: item.stats['rating']['@attributes'].value !== 'N/A',
      rating: item.stats['rating']['@attributes'].value === 'N/A' ? 0 : parseInt(item.stats['rating']['@attributes'].value),
      addedToList: false
    }

    if (listData.map(e => e.bggId).indexOf(obj.bggId) > -1) {
      obj.addedToList = true
    }

    bggList.push(obj)
  })

  return bggList
}

const showBGGCollectionSection = () => {
  document.querySelector('.bgg-list').classList.remove('hide')
  document.querySelector('.bgg-username-submit').classList.add('hide')
  const bggUsername = document.querySelector('#bgg-username').value
  document.querySelector('.bgg-username-header').textContent = `BGG Collection: ${bggUsername}`
  const bggUsernameSubmittedEl = document.querySelector('.bgg-collection__wrapper')
  bggUsernameSubmittedEl.classList.remove('hide')
}

const handleCollectionChangeClick = () => {
  bggCollectionData = []
  document.querySelector('.bgg-list').classList.add('hide')
  document.querySelector('.bgg-username-submit').classList.remove('hide')
  document.querySelector('.bgg-collection__wrapper').classList.add('hide')

  sessionStorage.removeItem('bggCollection')
}

const addBGGItemToList = (item, type) => {
  item.addedToList = true

  const list = createList([item])
  addListItems(list)

  if (type === 'bgg-collection') {
    renderCollectionEl('bgg-collection')
  } else if (type === 'bgg-search') {
    renderCollectionEl('bgg-search')
  }
}

const handleAddSelectedBGG = () => {
  const filteredList = filterBGGCollection(bggCollectionData)

  filteredList.forEach((item) => {
    item.addedToList = true
  })

  const list = createList(filteredList)
  addListItems(list)

  renderCollectionEl('bgg-collection')
}

export {
  handleBGGCollectionRequest,
  getBGGCollectionData,
  addBGGItemToList,
  handleAddSelectedBGG,
  handleCollectionChangeClick,
  saveBGGCollection,
  initPrevBGGCollection
}

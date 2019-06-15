import { renderBGGCollection, fadeInSpinner, fadeOutSpinner, custMessage } from './views'
import { addListItems, sortListData, getListData, createList } from './list'
import { getBGGFilters, updateBGGFilters } from './filters'
import { xmlToJson } from './functions'
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
      renderBGGCollection()
    }
  }
}

const handleBGGCollectionRequest = async () => {
  const user = document.querySelector('#bgg-username').value

  if (user === '') {
    custMessage('Please input your BGG user name')
  } else {
    const expansions = document.querySelector('#bgg-expansions').checked ? 1 : 0
    bggCollectionData = await getBGGCollection(user, expansions)

    // bggCollectionData = getBGGData()
    showBGGCollectionSection()
    renderBGGCollection()
    fadeOutSpinner()
  }
}

const getBGGCollection = (user, expansions) => new Promise((resolve, reject) => {
  fadeInSpinner()
  jQuery.post(getFilePath('/re-func/re-functions.php'), {
    func: 'getBGGCollection',
    bggUsername: user,
    expansions: expansions
  }, (data, status) => {
    let newData = parseInt(data.replace(/[\n\r]+/g, ''))

    // 1 = invalid username; 2 = timed out, try again later
    console.log(newData)

    if (newData === 1) {
      fadeOutSpinner()
      reject(new Error('Invalid username'))
      custMessage('Invalid username. Please try again.')
    } else if (newData === 2) {
      fadeOutSpinner()
      reject(new Error('Timed Out. Try again later.'))
      custMessage('The request for you collection timed out. BGG servers may be busy. Please try again in a little bit.')
    } else {
      console.log(newData)
      const listData = getListData()
      const xmlDoc = data.replace(/[\n\r]+/g, '')
      const parser = new DOMParser()
      const xml = parser.parseFromString(xmlDoc, 'text/xml')
      const dataJSON = xmlToJson(xml)

      const items = dataJSON.items.item

      let bggList = []

      items.forEach((item) => {
        const statusAttributes = item.status['@attributes']

        const obj = {
          id: uuidv4(),
          name: item.name ? item.name['#text'] : 'No Title',
          source: 'bgg',
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
          rated: item.stats['rating']['@attributes'].value !== 'N/A',
          rating: item.stats['rating']['@attributes'].value === 'N/A' ? 0 : parseInt(item.stats['rating']['@attributes'].value),
          addedToList: false
        }

        if (listData.map(e => e.bggId).indexOf(obj.bggId) > -1) {
          obj.addedToList = true
        }

        bggList.push(obj)
      })

      resolve(bggList)
    }
  })
})

const getBGGData = () => {
  const listData = getListData()

  let xhttp = ''

  if (window.XMLHttpRequest) {
    xhttp = new XMLHttpRequest()
  }

  xhttp.open('GET', './wp-content/themes/Ranking-Engine/RhodesPhoto.xml', false)
  // xhttp.open('GET', './collection-stats.xml', false)

  // xhttp.open('GET', 'https://www.boardgamegeek.com/xmlapi2/collection?username=singulusoculus&stats=1', false)
  xhttp.send()

  const xmlDoc = xhttp.responseText.replace(/[\n\r]+/g, '')

  const parser = new DOMParser()
  const xml = parser.parseFromString(xmlDoc, 'text/xml')
  const data = xmlToJson(xml)

  const items = data.items.item

  let bggList = []

  items.forEach((item) => {
    const statusAttributes = item.status['@attributes']

    const obj = {
      id: uuidv4(),
      name: item.name ? item.name['#text'] : 'No Title',
      source: 'bgg',
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
  const bggUsernameSubmittedEl = document.querySelector('.bgg-username-submitted')
  bggUsernameSubmittedEl.classList.remove('hide')
}

const handleCollectionChangeClick = () => {
  document.querySelector('.bgg-list').classList.add('hide')
  document.querySelector('.bgg-username-submit').classList.remove('hide')
  document.querySelector('.bgg-username-submitted').classList.add('hide')

  sessionStorage.removeItem('bggCollection')
}

const addBGGItemToList = (id) => {
  const itemID = bggCollectionData.findIndex((item) => item.id === id)
  const item = bggCollectionData[itemID]
  item.addedToList = true

  const list = createList([item])
  addListItems(list)

  renderBGGCollection()
}

const filterBGGCollection = () => {
  const filters = getBGGFilters()

  let filteredList = []

  // gets only true filters
  const listTypeFilters = Object.keys(filters).filter((key) => filters[key] === true)

  // filter the collection data for the filters marked as true
  listTypeFilters.forEach((filter) => {
    const list = bggCollectionData.filter((item) => item[filter])
    list.forEach((item) => {
      filteredList.push(item)
    })
  })

  // Filter duplicates out
  filteredList = filteredList.filter((list, index, self) => self.findIndex(l => l.id === list.id) === index)

  // Filter for Personal Rating
  filteredList = filteredList.filter((item) => item.rating >= filters.rating)

  // Filter out already added games
  filteredList = filteredList.filter((item) => item.addedToList === false)

  // Sort alphabetical
  filteredList = sortListData(filteredList, 'alphabetical')

  return filteredList
}

const handleAddSelectedBGG = () => {
  const filteredList = filterBGGCollection()

  filteredList.forEach((item) => {
    item.addedToList = true
  })

  const list = createList(filteredList)
  addListItems(list)

  renderBGGCollection()
}

export {
  handleBGGCollectionRequest,
  getBGGCollectionData,
  addBGGItemToList,
  filterBGGCollection,
  handleAddSelectedBGG,
  handleCollectionChangeClick,
  saveBGGCollection,
  setBGGCollectionData,
  showBGGCollectionSection,
  initPrevBGGCollection
}

import { xmlToJson } from './functions'
import { getBGGGameData } from './bgg-collection'

// https://boardgamegeek.com/xmlapi2/search?type=boardgame,boardgameexpansion&query=xia

let bggSearchData = []

const handleBGGSearch = (searchText) => {
  bggSearchData = []
  searchText = searchText.trim().replace(/ /g, '+')
  const searchUrl = `https://boardgamegeek.com/xmlapi2/search?type=boardgame&stats=1&query=${searchText}`

  fetch(searchUrl)
    .then(response => response.text())
    .then(str => (new window.DOMParser()).parseFromString(str, 'text/xml'))
    .then(data => {
      const dataJSON = xmlToJson(data)
      let bggSearchItems = dataJSON.items.item

      console.log(bggSearchItems)

      // Filter out duplicate bggIds
      bggSearchItems = bggSearchItems.filter((list, index, self) => self.findIndex(l => l['@attributes'].id === list['@attributes'].id) === index)

      // Filter for games with primary names only
      bggSearchItems = bggSearchItems.filter(item => item.name['@attributes'].type === 'primary')

      console.log(bggSearchItems)
      bggSearchItems = bggSearchItems.slice(0, 50)
      console.log(bggSearchItems)

      let bggIds = []
      bggSearchItems.forEach((item) => {
        if (item.name['@attributes'].type === 'primary') {
          bggIds.push(item['@attributes'].id)
        }
      })
      bggSearchData = getBGGGameData(bggIds)
      console.log(bggSearchData)
      bggSearchData.forEach((item) => {
        console.log(item.name, ' - ', item.id)
      })
    })
}

// In index.js
// handleBGGSearch('star wars')

export { handleBGGSearch }

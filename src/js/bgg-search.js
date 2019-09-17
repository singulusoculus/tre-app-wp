import { getBGGData, getBGGGameDetailData } from './bgg-functions'
import { renderCollection } from './views'

// https://boardgamegeek.com/xmlapi2/search?type=boardgame,boardgameexpansion&query=xia

let bggSearchData = []

const getBGGSearchData = () => bggSearchData

const handleBGGSearch = async (searchText, type) => {
  document.querySelector('.bgg-search__wrapper').classList.add('hide')
  jQuery('.ball-loading.search-results').fadeIn()
  bggSearchData = []
  searchText = searchText.trim().replace(/ /g, '+')

  let searchUrl = ''
  let results
  if (type === 'boardgames') {
    // when asking for type boardgame, bgg returns both boardgame and boardgameexpansion types but does not label the expansions properly.
    // I have to request expansions explicitly and then filter based on that list
    searchUrl = `https://boardgamegeek.com/xmlapi2/search?query=${searchText}&type=boardgame`
    let bgResults = await getBGGData(searchUrl)

    searchUrl = `https://boardgamegeek.com/xmlapi2/search?query=${searchText}&type=boardgameexpansion`
    let exResults = await getBGGData(searchUrl)
    console.log(exResults)

    if (exResults) {
      let expansionIds = []
      if (Array.isArray(exResults)) {
        exResults.forEach((item) => {
          expansionIds.push(item['@attributes'].id)
        })
      } else {
        expansionIds.push(exResults ? exResults['@attributes'].id : 0)
      }
  
      // filter for boardgame type only by comparing exResults to bgResults
      results = bgResults.filter((i) => expansionIds.indexOf(i['@attributes'].id) < 0, expansionIds)
    } else {
      results = bgResults
    }

  } else {
    searchUrl = `https://boardgamegeek.com/xmlapi2/search?query=${searchText}&type=boardgameexpansion`
    results = await getBGGData(searchUrl)
  }

  let bggSearchItems = []

  if (!Array.isArray(results)) {
    if (results) {
      bggSearchItems.push(results)
    }
  } else {
    results.forEach((i) => {
      bggSearchItems.push(i)
    })
  }

  if (results) {
    // Filter out duplicate bggIds
    bggSearchItems = bggSearchItems.filter((list, index, self) => self.findIndex(l => l['@attributes'].id === list['@attributes'].id) === index)

    // Filter for games with primary names only
    bggSearchItems = bggSearchItems.filter(item => item.name['@attributes'].type === 'primary')

    // Cut list down to 50
    bggSearchItems = bggSearchItems.slice(0, 50)
    console.log('Filtered Search Results', bggSearchItems)

    let bggIds = []
    bggSearchItems.forEach((item) => {
      if (item.name['@attributes'].type === 'primary') {
        bggIds.push(item['@attributes'].id)
      }
    })

    const gameDetails = await getBGGGameDetailData(bggIds)
    gameDetails.sort((a, b) => {
      if (a.bggRank > b.bggRank) {
        return 1
      } else if (a.bggRank < b.bggRank) {
        return -1
      } else {
        return 0
      }
    })
    console.log('Cleaned BGG Game Data Object', gameDetails)
    bggSearchData = gameDetails

    jQuery('.ball-loading.search-results').fadeOut(() => {
      renderCollection('bgg-search')
    })
  } else {
    bggSearchData = []
    jQuery('.ball-loading.search-results').fadeOut(() => {
      renderCollection('bgg-search')
    })
  }
}

export { handleBGGSearch, getBGGSearchData }

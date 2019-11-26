import { sortListData } from './list'

// ////////////////////////////////////////
// LIST FILTERS
// ////////////////////////////////////////

const listFilters = {
  searchText: '',
  sortBy: 'alphabetical'
}

const getListFilters = () => listFilters

const setListFilters = (updates) => {
  if (typeof updates.searchText === 'string') {
    listFilters.searchText = updates.searchText
  }

  if (typeof updates.sortBy === 'string') {
    listFilters.sortBy = updates.sortBy
  }
}

const filterListData = (data) => {
  const filters = getListFilters()
  let filteredList

  // filter based on text input
  filteredList = data.filter((item) => item.name.toLowerCase().includes(filters.searchText.toLowerCase()))
  // sort the list
  filteredList = sortListData(filteredList, 'alphabetical')

  return filteredList
}

// ////////////////////////////////////////
// BGG SEARCH FILTERS
// ////////////////////////////////////////

const bggSearchFilters = {
  sortBy: 'bgg-rating'
}

const getBGGSearchFilters = () => bggSearchFilters

const setBGGSearchFilters = (updates) => {
  if (typeof updates.sortBy === 'string') {
    bggSearchFilters.sortBy = updates.sortBy
  }
}

const filterBGGSearch = (data) => {
  let filteredList = data.filter((item) => item.addedToList === false)
  let sortBy = getBGGSearchFilters().sortBy
  filteredList = sortListData(filteredList, sortBy)
  return filteredList
}

// ////////////////////////////////////////
// BGG COLLECTION FILTERS
// ////////////////////////////////////////

const bggFilters = {
  own: true,
  fortrade: false,
  prevowned: false,
  want: false,
  wanttobuy: false,
  wanttoplay: false,
  wishlist: false,
  played: true,
  rated: true,
  minRating: 0,
  maxRating: 10
}

const getBGGFilters = () => bggFilters

const setBGGFilters = (updates) => {
  if (typeof updates.own === 'boolean') {
    bggFilters.own = updates.own
  }

  if (typeof updates.fortrade === 'boolean') {
    bggFilters.fortrade = updates.fortrade
  }

  if (typeof updates.prevowned === 'boolean') {
    bggFilters.prevowned = updates.prevowned
  }

  if (typeof updates.want === 'boolean') {
    bggFilters.want = updates.want
  }

  if (typeof updates.wanttobuy === 'boolean') {
    bggFilters.wanttobuy = updates.wanttobuy
  }

  if (typeof updates.wanttoplay === 'boolean') {
    bggFilters.wanttoplay = updates.wanttoplay
  }

  if (typeof updates.wishlist === 'boolean') {
    bggFilters.wishlist = updates.wishlist
  }

  if (typeof updates.played === 'boolean') {
    bggFilters.played = updates.played
  }

  if (typeof updates.rated === 'boolean') {
    bggFilters.rated = updates.rated
  }

  if (typeof updates.minRating === 'number') {
    bggFilters.minRating = updates.minRating
  }

  if (typeof updates.maxRating === 'number') {
    bggFilters.maxRating = updates.maxRating
  }
}

const updateBGGFilters = () => {
  // Get checked checkboxes
  const checkboxes = document.querySelectorAll('.bgg-cb')
  let checkboxesChecked = []
  checkboxes.forEach((cb) => {
    if (cb.children[0].checked) {
      checkboxesChecked.push(cb.children[0].className)
    }
  })
  // Update filters based on this
  checkboxesChecked.forEach((f) => {
    setBGGFilters({ [f]: true })
  })

  // Double slider values
  const slider = document.querySelector('#min-max-rating-slider')
  const values = slider.noUiSlider.get()
  const min = parseFloat(values[0])
  const max = parseFloat(values[1])
  setBGGFilters({
    minRating: min,
    maxRating: max
  })
}

const filterBGGCollection = (data) => {
  const filters = getBGGFilters()

  let filteredList = []

  // gets only true filters
  const listTypeFilters = Object.keys(filters).filter((key) => filters[key] === true)

  // filter the collection data for the filters marked as true
  listTypeFilters.forEach((filter) => {
    const list = data.filter((item) => item[filter])
    list.forEach((item) => {
      filteredList.push(item)
    })
  })

  // Filter duplicates out
  filteredList = filteredList.filter((list, index, self) => self.findIndex(l => l.id === list.id) === index)

  // Filter for Personal Rating
  const ratedCB = document.querySelector('.bgg-cb .rated').checked
  if (ratedCB) {
    filteredList = filteredList.filter((item) => item.rating >= filters.minRating && item.rating <= filters.maxRating)
  }

  // Filter out already added games
  filteredList = filteredList.filter((item) => item.addedToList === false)

  // Sort alphabetical
  filteredList = sortListData(filteredList, 'alphabetical')

  return filteredList
}

export { getListFilters,
  setListFilters,
  getBGGFilters,
  setBGGFilters,
  updateBGGFilters,
  getBGGSearchFilters,
  setBGGSearchFilters,
  filterListData,
  filterBGGCollection,
  filterBGGSearch
}

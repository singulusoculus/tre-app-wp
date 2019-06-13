const filters = {
  searchText: '',
  sortBy: 'alphabetical'
}

const getFilters = () => filters

const setFilters = (updates) => {
  if (typeof updates.searchText === 'string') {
    filters.searchText = updates.searchText
  }

  if (typeof updates.sortBy === 'string') {
    filters.sortBy = updates.sortBy
  }
}

const bggFilters = {
  own: true,
  fortrade: false,
  prevowned: false,
  want: false,
  wanttobuy: false,
  wanttoplay: false,
  wishlist: false,
  played: true,
  rated: false,
  rating: 0
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

  if (typeof updates.rating === 'number') {
    bggFilters.rating = updates.rating
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

  // Get rating slider value
  const pRating = document.querySelector('#personal-rating').value
  // Update rating filter
  setBGGFilters({
    rating: parseInt(pRating)
  })
}

export { getFilters, setFilters, getBGGFilters, setBGGFilters, updateBGGFilters }

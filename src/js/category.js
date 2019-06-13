let category = 0

const getCategory = () => category

const setCategory = (newCategory) => {
  category = newCategory
}

const getCategoryInfo = (id = category) => {
  switch (id) {
    case 1:
      return {
        name: 'beverages',
        niceName: 'Beverages'
      }
    case 2:
      return {
        name: 'board-games',
        niceName: 'Board Games'
      }
    case 3:
      return {
        name: 'books',
        niceName: 'Books'
      }
    case 4:
      return {
        name: 'brews',
        niceName: 'Brews'
      }
    case 5:
      return {
        name: 'characters',
        niceName: 'Characters'
      }
    case 6:
      return {
        name: 'comics',
        niceName: 'Comics'
      }
    case 7:
      return {
        name: 'food',
        niceName: 'Food'
      }
    case 8:
      return {
        name: 'movies',
        niceName: 'Movies'
      }
    case 9:
      return {
        name: 'music',
        niceName: 'Music'
      }
    case 10:
      return {
        name: 'people',
        niceName: 'People'
      }
    case 11:
      return {
        name: 'places',
        niceName: 'Places'
      }
    case 12:
      return {
        name: 'sports',
        niceName: 'Sports'
      }
    case 13:
      return {
        name: 'toys',
        niceName: 'Toys'
      }
    case 14:
      return {
        name: 'tv',
        niceName: 'TV Shows'
      }
    case 15:
      return {
        name: 'video-games',
        niceName: 'Video Games'
      }
    case 16:
      return {
        name: 'other',
        niceName: 'Other'
      }
  }
}

export { getCategory, setCategory, getCategoryInfo }

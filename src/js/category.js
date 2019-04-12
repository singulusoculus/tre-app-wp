let category = 0

const getCategory = () => category

const setCategory = (newCategory) => {
  category = newCategory

  // const categoryName = document.querySelector('#list-category-select').selectedOptions[0].innerHTML
  // document.querySelector('.current-list-category').innerHTML = `Category: ${categoryName}`
}

export { getCategory, setCategory }

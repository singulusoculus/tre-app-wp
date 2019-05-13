import { setCategory } from './category'
import { clearListData } from './list'
import { setCurrentStep } from './step'
import { renderListData, showListSection } from './views'

const handleCategoryChange = () => {
  const category = parseInt(document.querySelector('#list-category-select').value)
  setCategory(category)

  clearListData()
  setCurrentStep('List')
  renderListData()
  showListSection()
}

export { handleCategoryChange }

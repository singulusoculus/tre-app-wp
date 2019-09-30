import { setCategory } from './category'
import { clearListData } from './list'
import { setCurrentStep } from './step'
import { showListSection, renderCollectionEl } from './views'
import { setDBListInfoType } from './database'
import { handleCollectionChangeClick } from './bgg-collection'

const handleCategoryChange = () => {
  const category = parseInt(document.querySelector('#list-category-select').value)
  setCategory(category)

  setDBListInfoType('template', {
    id: 0,
    desc: ''
  })

  clearListData()
  handleCollectionChangeClick()
  setCurrentStep('List')
  renderCollectionEl('list')
  showListSection()
  M.Toast.dismissAll()
}

export { handleCategoryChange }

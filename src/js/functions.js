import { getCategory } from './category'
import { getCurrentStep } from './step'

const disableArrowKeyScroll = () => {
  // Disable arrow keys from scrolling
  window.addEventListener('keydown', (e) => {
    // space and arrow keys
    if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault()
    }
  }, false)
}

const saveData = (data) => {
  const category = getCategory()
  const step = getCurrentStep()

  const obj = {
    category,
    step,
    data
  }
  localStorage.setItem('saveData', JSON.stringify(obj))
}

export { disableArrowKeyScroll, saveData }

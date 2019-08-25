import { getCurrentStep } from './step'

const getStartHelpText = () => {
  return [
    {
      title: 'Start',
      listItems: [
        'Select a category to get started creating a list.',
        'You can also see the current top 10 games from the current year here. Click the button below the list to see all of the top games as ranked by users of the Ranking Engine.',
        'If you have a previous session available you will be prompted to resume or discard it. Resuming picks up where you left off. Discarding completely deletes the previous session data.'
      ]
    }
  ]
}

const getListHelpText = () => {
  return [
    {
      title: 'List',
      listItems: [
        'To add items to your list, type or paste them into the provided Text Entry area, each item on a separate line, then click Add.',
        'Keep adding and editing your list until you have the list you want to rank, then click the arrow button on the right or the Rank tab to start ranking.'
      ]
    },
    {
      title: 'Board Game Geek',
      listItems: [
        'If you selected Board Games as your category you will have the option to add games from a BGG collection',
        'Enter the BGG username for the list you would like to request, indicate if you would like expansions included or not, then click Submit.',
        'Give BGG some time to return your list to The Ranking Engine.',
        'You can then filter your list and either add games individually to your List or add a group of filtered games.'
      ]
    },
    {
      title: 'Saving a Template',
      listItems: [
        'If you create a list you would like access to at a later date you can save it as a template.',
        'Click the Save button in the Your List section, log in (if needed), give your list a description and click Save.',
        'If you are working with an already-saved template, you will have the option to edit it and then Update it.'
      ]
    }
  ]
}

const getRankHelpText = () => {
  return [
    {
      title: 'Rank',
      listItems: [
        'Two items will be presented at a time. Click on the one you prefer. Continue making selections until your results are presented.',
        'Delete an item from your ranking by clicking the <i class="material-icons small help__icon-inline">delete</i> icon.',
        'Undo a selection by clicking the Undo button',
        'If you are using a keyboard, you can use your left and right arrows to make your selections. The up arrow will trigger undo.',
        'Save your progress by clicking the Save button, logging in (if needed), giving it a description, and clicking Save.'
      ]
    }
  ]
}

const getResultHelpText = () => {
  return [
    {
      title: 'Result',
      listItems: [
        'Your results will be calculated and presented for you to peruse.',
        'Easily copy your results to your clipboard by clicking the Copy button.',
        'Download a csv file with your results by clicking the CSV button',
        'Save your results by clicking the Save button, logging in (if needed), giving is a description, and clicking Save.',
        'Rerank your results by clicking the Rank tab. You can either rerank the complete list or the top X items from it.'
      ]
    }
  ]
}

const getNavigationHelpText = () => {
  return [
    {
      title: 'Navigation',
      listItems: [
        'You can navigate to any previous step in the process by clicking the tab.'
      ]
    },
    {
      title: 'My Lists',
      listItems: [
        'If you are logged in, you have access to your saved lists at any time by clicking the <i class="material-icons small help__icon-inline">account_circle</i> in the menu. Just click on a list to load it.',
        'Sharing a template: after you save a template it can be shared. Click <i class="material-icons small help__icon-inline">share</i> to bring up the share modal. A gray icon means the list is not shared. A green icon means it is.',
        `If a shared template has been ranked it will be unavailable to edit until any results have been cleared`
      ]
    },
    {
      title: 'Share Modal',
      listItems: [
        'To share the selected template, flip the Sharing switch to On. This option must be turned on for the provided link to work.',
        'Copy the link and share it out with the people you want to share the template with. Going to the provided link will load the template into the ranking process.',
        'If the list has been ranked via the shared link, a Results button will be available. Clicking this will show you the aggregate results of all who have ranked it.'
      ]
    }
  ]
}

const handleQuickHelpClick = () => {
  const step = getCurrentStep()
  const checkbox = document.querySelector('#help-toggle')
  const helpTextEl = document.querySelector('.help__text')

  if (checkbox.checked) {
    // help open - close it then clear the text
    checkbox.checked = false

    const eventFunction = () => {
      helpTextEl.innerHTML = ''
      helpTextEl.removeEventListener('transitionend', () => eventFunction)
    }
    helpTextEl.addEventListener('transitionend', () => eventFunction)
  } else {
    // help not open - populate for correct step then open it
    helpTextEl.innerHTML = ''
    // heading
    const headingEl = document.createElement('h4')
    headingEl.textContent = 'Quick Help'
    headingEl.classList.add('center-align')
    console.log(headingEl)
    helpTextEl.appendChild(headingEl)
    let helpText = ''

    // step check
    if (step === 'Start') {
      helpText = renderHelpTextDOM(getStartHelpText())
    } else if (step === 'List') {
      helpText = renderHelpTextDOM(getListHelpText())
    } else if (step === 'Rank') {
      helpText = renderHelpTextDOM(getRankHelpText())
    } else if (step === 'Result') {
      helpText = renderHelpTextDOM(getResultHelpText())
    }

    helpTextEl.appendChild(helpText)

    const navigationText = renderHelpTextDOM(getNavigationHelpText())
    helpTextEl.appendChild(navigationText)

    checkbox.checked = true
  }
}

const renderHelpTextDOM = (helpInfo) => {
  const helpSectionWrapper = document.createElement('div')
  helpInfo.forEach((section) => {
    const titleEl = document.createElement('p')
    titleEl.classList.add('section-title')
    titleEl.textContent = section.title
    helpSectionWrapper.appendChild(titleEl)

    const ulEl = document.createElement('ul')
    ulEl.classList.add('help__list')
    section.listItems.forEach((item, index) => {
      const liEl = document.createElement('li')
      liEl.innerHTML = item
      ulEl.appendChild(liEl)
    })
    helpSectionWrapper.appendChild(ulEl)
    const hrEl = document.createElement('hr')
    helpSectionWrapper.appendChild(hrEl)
  })
  return helpSectionWrapper
}

export { handleQuickHelpClick }

import { dbGetTemplateListData } from './shared-rankings-db'

window.onload = () => {
  // get uuid param
  const urlParam = checkForURLParam()

  if (urlParam) {
    initSharedRankingURLParam(urlParam.id)
  }

  // if the shared_results_public flag is false then get the current user id and check it against the one that created the list

  // if the user ids match then go get the results data and render it
}

const checkForURLParam = () => {
  const url = new URL(window.location.href)
  if (url.search === '') {
    return false
  } else {
    return {
      url,
      search: url.search,
      type: url.search.substring(1, 2),
      id: url.search.substring(3)
    }
  }
}

const initSharedRankingURLParam = async (urlParam) => {
  try {
    const templateListData = await dbGetTemplateListData(urlParam)
    console.log(templateListData)
    const templateId = parseInt(templateListData[0].template_id)
    const templateDesc = templateListData[0].template_desc
    const wpuid = parseInt(templateListData[0].wpuid)
    const resultsPublic = parseInt(templateListData[0].results_public) === 1 ? true : false
    console.log(resultsPublic)

    // if the shared_results_public flag is false then get the current user id
    if (!resultsPublic) {
      // check template owner against current user
      const currentUser = getUserID()
      console.log(currentUser)
      console.log(wpuid)
      if (currentUser === wpuid) {
        // render results
        document.querySelector('#page-header').textContent = `Results for: ${templateDesc}`
      } else {
        console.log('You are not authorized to view these results')
      }
    } else {
      // render results
      document.querySelector('#page-header').textContent = `Results for: ${templateDesc}`
    }
  } catch (error) {
    // custMessage('The specified list does not exist or is not shared. Please check the id and try again')
    throw new Error('The specified list does not exist or is not shared')
  }
}

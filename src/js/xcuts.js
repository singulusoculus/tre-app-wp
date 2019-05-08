// rank-calcResult
// // Order the remaining items
// for (let i = 0; i < list.length; i++) {
//   let obj = rankData.masterList[list[i]]
//   obj = {...obj, rank: i + 1}

//   rankedList.push(obj)
// }

// rank
// Use this if I want to render the projected rank during the ranking process
// const sortMasterList = (list, sortBy) => {
//   if (sortBy === 'byProjected') {
//     return list.sort((a, b) => {
//       if (a.voteShowPct > b.voteShowPct) {
//         return -1
//       } else if (a.voteShowPct < b.voteShowPct) {
//         return 1
//       } else {
//         return 0
//       }
//     })
//   } else if (sortBy === 'alphabetical') {
//     return list.sort((a, b) => {
//       if (a.name.toLowerCase() < b.name.toLowerCase()) {
//         return -1
//       } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
//         return 1
//       } else {
//         return 0
//       }
//     })
//   } else {
//     return list
//   }
// }

// old welcome back
// const textEl = document.createElement('p')
// const buttonEl = document.createElement('button')

// textEl.textContent = `You have a ${step} session available. Want to continue?`
// buttonEl.textContent = 'Continue'

// buttonEl.addEventListener('click', () => {
//   if (step === 'List') {
//     initPrevList(category, data)
//     showListSection()
//   } else if (step === 'Rank') {
//     initPrevRanking(category, data)
//     showRankSection()
//   } else if (step === 'Result') {
//     initPrevResult(category, data)
//     showResultSection()
//   }
// })

// containerEl.appendChild(textEl)
// containerEl.appendChild(buttonEl)

// rankData.masterList.forEach((item, index) => {
//   rankData.sortList[n][index] = index
// })

// For requesting details on a users collection - from getBGGData

// // build string to send request for all collection items
// // should probably make this do a certain number at a time since I don't know the limits
// let bggItems = []
// items.forEach((item) => {
//   const bggId = item['@attributes'].objectid

//   bggItems.push(bggId)
// })

// let reqString = 'https://www.boardgamegeek.com/xmlapi2/thing?id='

// bggItems.forEach((id) => {
//   reqString += `${id},`
// })

// console.log(reqString)

// Determine which transition event a browser supports
// const whichTransitionEvent = () => {
//   const el = document.createElement('fakeelement')
//   const transitions = {
//     'transition': 'transitionend',
//     'OTransition': 'oTransitionEnd',
//     'MozTransition': 'transitionend',
//     'WebkitTransition': 'webkitTransitionEnd'
//   }

//   for (let t in transitions) {
//     if (el.style[t] !== undefined) {
//       return transitions[t]
//     }
//   }
// }

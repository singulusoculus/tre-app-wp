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

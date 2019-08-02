
console.log(`Here I am!`)

window.onload = () => {
  const data = localStorage.getItem('sharedRankingsList')
  const parsedData = JSON.parse(data)
  console.log(parsedData)
}

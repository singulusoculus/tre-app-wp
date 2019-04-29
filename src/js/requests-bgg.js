
import { createListObject } from './list'

const getBGGData = () => {
  let xhttp = ''

  if (window.XMLHttpRequest) {
    xhttp = new XMLHttpRequest()
  }

  xhttp.open('GET', './bggxml.xml', false)

  // xhttp.open('GET', 'https://www.boardgamegeek.com/xmlapi2/collection?username=singulusoculus&stats=1', false)
  xhttp.send()

  const xmlDoc = xhttp.responseText.replace(/[\n\r]+/g, '')
  const parser = new DOMParser()
  const xml = parser.parseFromString(xmlDoc, 'text/xml')
  const data = xmlToJson(xml)

  console.log(data)

  const items = data.items.item
  let bggList = []

  items.forEach((item) => {
    const name = item.name['#text']
    const image = item.thumbnail['#text']
    const yearPublished = item.yearpublished['#text']
    const bggId = item['@attributes'].objectid

    const obj = createListObject(name, 'bgg', image, undefined, 0, yearPublished, bggId)

    bggList.push(obj)
  })

  // build string to send request for all collection items
  // should probably make this do a certain number at a time since I don't know the limits
  let bggItems = []
  items.forEach((item) => {
    const bggId = item['@attributes'].objectid

    bggItems.push(bggId)
  })

  let reqString = 'https://www.boardgamegeek.com/xmlapi2/thing?id='

  bggItems.forEach((id) => {
    reqString += `${id},`
  })

  console.log(reqString)


  return bggList
}

// Changes XML to JSON
const xmlToJson = (xml) => {
  // Create the return object
  let obj = {}

  if (xml.nodeType === 1) { // element
    // do attributes
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {}
      for (let j = 0; j < xml.attributes.length; j++) {
        let attribute = xml.attributes.item(j)
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue
      }
    }
  } else if (xml.nodeType === 3) { // text
    obj = xml.nodeValue
  }

  // do children
  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      let item = xml.childNodes.item(i)
      let nodeName = item.nodeName
      if (typeof (obj[nodeName]) === 'undefined') {
        obj[nodeName] = xmlToJson(item)
      } else {
        if (typeof (obj[nodeName].push) === 'undefined') {
          let old = obj[nodeName]
          obj[nodeName] = []
          obj[nodeName].push(old)
        }
        obj[nodeName].push(xmlToJson(item))
      }
    }
  }
  return obj
}

export { getBGGData }

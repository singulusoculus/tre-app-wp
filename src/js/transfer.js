import uuidv4 from 'uuid'
import { createList } from './list'

const handleRankingResultsTransferClick = () => {
  jQuery.post(getFilePath('/re-func/re-transfer.php'), {
    func: 'transferRankingResultsH'
  }, (data, status) => {
    console.log('Ranking Header Transfer complete')
    jQuery.post(getFilePath('/re-func/re-transfer.php'), {
      func: 'transferRankingResultsD'
    }, (data, status) => {
      console.log('Ranking Detail Transfer complete')
    })
  })
}

const handleUserResultTransferClick = () => {
  // Get lists to transfer and list info from re_final_h
  jQuery.post(getFilePath('/re-func/re-transfer.php'), {
    func: 'getOldResultLists'
  }, (data, status) => {
    const parsedData = JSON.parse(data)
    // console.log(parsedData)

    parsedData.forEach((list) => {
      const listId = list.list_id
      const wpuid = list.wpuid
      const desc = list.list_desc
      const bggFlag = list.bgg_flag
      const finishDate = list.finish_date
      const itemCount = list.item_count
      const category = list.list_category

      jQuery.post(getFilePath('/re-func/re-transfer.php'), {
        func: 'getOldResultDetails',
        listId
      }, (data, status) => {
        const parsedDetails = JSON.parse(data)
        // console.log(parsedDetails)

        let resultData = []

        parsedDetails.forEach((item) => {
          resultData.push({
            name: item.item_name,
            source: bggFlag === 1 ? 'bgg' : 'text',
            rank: item.item_rank
          })
        })

        const result = createList(resultData)

        // strip out uuid before saving to database
        result.forEach((item) => {
          delete item.id
        })

        const resultJSON = JSON.stringify(result)
        // console.log(result)

        const resultUUID = uuidv4()

        jQuery.post(getFilePath('/re-func/re-transfer.php'), {
          func: 'insertResultList',
          resultJSON,
          wpuid,
          desc,
          finishDate,
          itemCount,
          category,
          resultUUID
        }, (data, status) => {
          let newData = parseInt(data.replace(/[\n\r]+/g, ''))
          console.log(`Transfered ${listId}. New ID: ${newData}`)
        })
      })
    })
  })
}

const handleProgressTransferClick = () => {
  let erroredLists = []

  jQuery.post(getFilePath('/re-func/re-transfer.php'), {
    func: 'getOldProgressListIDs'
  }, (data, status) => {
    const parsedData = JSON.parse(data)
    let progressLists = []
    // [83, 97, 103, 134, 138, 164, 170, 278, 342, 371, 545, 617, 626, 665, 691, 737, 792, 802, 808, 848, 933, 936, 942, 1030, 1079, 1083, 1101, 1118, 1120, 1284, 1376, 1396, 1420, 1434, 1452, 1480, 1539]

    parsedData.forEach((item) => {
      progressLists.push(parseInt(item.list_id))
    })

    console.log(progressLists)

    // let progressLists = [50, 80, 97, 103, 134, 138, 170, 202, 278, 292, 294, 297, 312, 332, 342, 362, 371, 381, 418, 434, 508, 545, 561, 617, 626, 628, 655, 656, 657, 665, 691, 737, 792, 802, 808, 839, 848, 903, 909, 933, 936, 942, 968, 1030, 1043, 1070, 1083, 1101, 1118, 1120, 1121, 1141, 1151, 1152, 1163, 1176, 1192, 1225, 1226, 1284, 1298, 1339, 1353, 1376, 1396, 1420, 1430, 1443, 1452, 1458, 1466, 1467, 1469, 1480, 1489, 1494, 1500, 1517, 1538, 1539, 1577, 1579, 1582, 1615, 1632, 1655, 1661, 1669, 1670]
    // [50, 97, 103, 134, 138, 170, 202, 278, 294, 312, 342, 362, 371, 418, 545, 617, 626, 655, 665, 691, 737, 792, 802, 808, 839, 848, 903, 933, 936, 942, 968, 1030, 1043, 1070, 1083, 1101, 1118, 1120, 1121, 1141, 1151, 1152, 1163, 1176, 1192, 1225, 1284, 1353, 1376, 1396, 1420, 1430, 1443, 1452, 1458, 1467, 1469, 1480, 1489, 1494, 1500, 1517, 1538, 1539, 1577, 1579, 1582, 1632, 1655, 1661]

    progressLists.forEach((listid) => {
      jQuery.post(getFilePath('/re-func/re-transfer.php'), {
        func: 'getOldProgressList',
        progressid: listid
      }, (data, status) => {
        console.log(listid)
        const parsedData = JSON.parse(data)
        const saveDesc = parsedData[0].list_desc || ''
        const itemCount = parsedData[0].num_of_items
        const percent = parsedData[0].percent_complete
        const saveDate = parsedData[0].save_date
        const wpuid = parsedData[0].wpuid

        let dirtySaveData = parsedData[0].save_data
        dirtySaveData = dirtySaveData.replace(/\u00A0/, '')
        let regex = /\s+"(?!,)(?!])/
        let regex2 = /(?!,)(?!])"\s/
        dirtySaveData = dirtySaveData.replace(regex, '').replace(regex2, '')
        const cleanSaveData = dirtySaveData.replace(' ","', '","').replace('"," ', '","').replace('""', '"').replace('." ', '')
        // var saveData = JSON.parse(cleanSaveData)
        try {
          var saveData = JSON.parse(cleanSaveData)
        } catch (e) {
          erroredLists.push(listid)
          console.log(erroredLists)
        }

        // Save Data
        const namMember = saveData[0]
        const lstMember = saveData[1]
        const parent = saveData[2]
        const rec = saveData[3]
        const cmp1 = saveData[4]
        const cmp2 = saveData[5]
        const head1 = saveData[6]
        const head2 = saveData[7]
        const nrec = saveData[8]
        const numQuestion = saveData[9]
        const totalSize = saveData[10]
        const finishSize = saveData[11]
        const bggFlag = saveData[12]
        const bggGamesThumbs = saveData[13]
        const category = saveData[14] || 0
        const deletedItems = saveData[15]

        // create list out of nameMember and bggGamesThumbs
        const listData = []

        if (bggGamesThumbs) {
          var games = Object.keys(bggGamesThumbs)
          var thumbs = Object.values(bggGamesThumbs)
        }

        // create array of objects to send to createList
        namMember.forEach((name) => {
          if (bggGamesThumbs) {
            var thumbIndex = games.findIndex((game) => game === name)
          }
          listData.push({
            name,
            source: bggFlag === 1 ? 'bgg' : 'text',
            image: bggGamesThumbs ? thumbs[thumbIndex] : ''
          })
        })

        const list = createList(listData)

        // strip out uuid before saving to database
        list.forEach((item) => {
          delete item.id
        })

        const rankData = {
          masterList: list,
          sortList: lstMember,
          parent,
          rec,
          deletedItems: deletedItems || [],
          cmp1,
          cmp2,
          head1,
          head2,
          nrec,
          numQuestion,
          totalSize,
          finishSize,
          finishFlag: 0,
          bggFlag
        }

        const rankDataJSON = JSON.stringify(rankData)

        // Save the list to re_rank_progress
        jQuery.post(getFilePath('/re-func/re-transfer.php'), {
          func: 'insertProgressList',
          wpuid,
          rankData: rankDataJSON,
          saveDesc,
          itemCount,
          percent,
          category,
          saveDate
        }, (data, status) => {
          if (status === 'success') {
            let newData = parseInt(data.replace(/[\n\r]+/g, ''))
            console.log(`Transfered ${listid}. New ID: ${newData}`)

            jQuery.post(getFilePath('/re-func/re-transfer.php'), {
              func: 'deleteOldProgressList',
              listid: listid
            }, (data, status) => {
              console.log(`Deleted ${listid} from re_progress_transfer.`)
            })
          }
        })
      })
    })
  })
}

export { handleProgressTransferClick, handleUserResultTransferClick, handleRankingResultsTransferClick }

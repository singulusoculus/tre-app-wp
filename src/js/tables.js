
// columns is an array of column names for the table
// expects a wrapper div to exist with an id of tableName'-table-wrapper'
const renderTableHeader = (columns, tableName) => {
  const tableWrapperEl = document.querySelector(`#${tableName}-table-wrapper`)

  tableWrapperEl.innerHTML = ''

  const tableEl = document.createElement('table')
  tableEl.setAttribute('id', `${tableName}__table`)
  tableEl.classList.add('table-responsive', 'striped')

  const theadEl = document.createElement('thead')
  theadEl.setAttribute('id', `${tableName}__header`)
  const trEl = document.createElement('tr')

  columns.forEach((col) => {
    const thEl = document.createElement('th')
    thEl.setAttribute('scope', 'col')
    thEl.textContent = col
    trEl.appendChild(thEl)
  })

  theadEl.appendChild(trEl)
  tableEl.appendChild(theadEl)

  const tbodyEl = document.createElement('tbody')
  tbodyEl.setAttribute('id', `${tableName}__rows`)

  tableEl.appendChild(tbodyEl)

  tableWrapperEl.appendChild(tableEl)
}

// data is an array of objects with the correct number of items as there are columns in the table
const renderTableRows = (data, tableName) => {
  const rowsEl = document.querySelector(`#${tableName}__rows`)

  data.forEach((row) => {
    const trEl = document.createElement('tr')
    const items = Object.values(row)

    items.forEach((item) => {
      const tdEl = document.createElement('td')
      tdEl.textContent = item
      trEl.appendChild(tdEl)
    })
    rowsEl.appendChild(trEl)
  })
}

const renderTable = (tableName, columns, rows) => {
  renderTableHeader(columns, tableName)
  renderTableRows(rows, tableName)
}

const initDataTable = (table) => {
  jQuery(`#${table}__table`).DataTable({
    'destroy': true,
    dom: 'lfBtip',
    buttons: [
      'copyHtml5',
      'excelHtml5',
      'csvHtml5'
    ]
  })

  // DataTables fixes
  var el = document.querySelector('select:not(.complete)')
  M.FormSelect.init(el)
  el.classList.add('complete')

  const dtWrapper = document.querySelector(`#${table}__table_wrapper`)

  const lengthEl = jQuery(`#${table}__table_length`).detach()
  const filterEl = jQuery(`#${table}__table_filter`).detach()

  document.querySelector('.dt-buttons:not(.complete)').setAttribute('id', `${table}__table_buttons`)
  const buttonEl = jQuery(`#${table}__table_buttons`).detach()

  const div = document.createElement('div')
  div.classList.add(`${table}-dt-elements-wrapper`, 'dt-elements-wrapper')

  dtWrapper.prepend(div)

  const specDiv = jQuery(`.${table}-dt-elements-wrapper`)

  lengthEl.appendTo(specDiv)
  buttonEl.appendTo(specDiv)
  filterEl.appendTo(specDiv)

  document.querySelector(`#${table}__table_buttons`).classList.add('complete')

  // Fix select

  document.querySelector('.select-wrapper:not(.complete)').setAttribute('id', `${table}-select-wrapper`)

  const selectEl = jQuery(`#${table}-select-wrapper`).detach()
  jQuery(`#${table}__table_length.dataTables_length > label`).remove()

  const newLengthEl = jQuery(`#${table}__table_length`)
  selectEl.appendTo(newLengthEl)

  document.querySelector(`#${table}-select-wrapper`).classList.add('complete')

  // Fix search

  document.querySelector(`#${table}__table_filter > label > input`).setAttribute('placeholder', 'Search')
  const searchEl = jQuery(`#${table}__table_filter > label > input`).detach()
  jQuery(`#${table}__table_filter > label`).remove()

  const newFilterEl = jQuery(`#${table}__table_filter`)

  searchEl.appendTo(newFilterEl)
}

const numWithCommas = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export { renderTable, initDataTable, numWithCommas }

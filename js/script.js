let defaultRowCount = 20; // No of rows
let defaultColCount = 40; // No of cols
const SPREADSHEET_DB = "spreadsheet_db";



initializeData = () => {
  // console.log("initializeData");
  const data = [];
  for (let i = 0; i <= defaultRowCount; i++) {
    const child = [];
    for (let j = 0; j <= defaultColCount; j++) {
      child.push("");
    }
    data.push(child);
  }
  return data;
};

getData = () => {
  let data = localStorage.getItem(SPREADSHEET_DB);
  if (data === undefined || data === null) {
    return initializeData();
  }
  return JSON.parse(data);
};

saveData = data => {
  localStorage.setItem(SPREADSHEET_DB, JSON.stringify(data));
};
  
resetData = data => {
  localStorage.removeItem(SPREADSHEET_DB);
  this.createSpreadsheet();
};

// Row Head
createHeaderRow = () => {
  const tr = document.createElement("tr");
  tr.setAttribute("id", "h-0");
  for (let i = 0; i <= defaultColCount; i++) {
    const th = document.createElement("th");
    th.setAttribute("id", `h-0-${i}`);
    th.setAttribute("class", `${i === 0 ? "" : "column-header"}`);
    // th.innerHTML = i === 0 ? `` : `Col ${i}`;
    if (i !== 0) {
      const span = document.createElement("span");
      span.innerHTML = `x-${i}`;
      span.setAttribute("class", "column-header-span");
      const dropDownDiv = document.createElement("div");
      dropDownDiv.setAttribute("class", "dropdown");
      dropDownDiv.innerHTML = `<button class="dropbtn" id="col-dropbtn-${i}">+</button>
        <div id="col-dropdown-${i}" class="dropdown-content">
          <p class="col-insert-left">좌측 열 추가</p>
          <p class="col-insert-right">우측 열 추가</p>
          <p class="col-delete">열 삭제</p>
        </div>`;
      th.appendChild(span);
      th.appendChild(dropDownDiv);
    }
    tr.appendChild(th);
  }
  return tr;
};

createTableBodyRow = rowNum => {
  const tr = document.createElement("tr");
  tr.setAttribute("id", `r-${rowNum}`);
  for (let i = 0; i <= defaultColCount; i++) {
    const cell = document.createElement(`${i === 0 ? "th" : "td"}`);
    const span = document.createElement("span");
    const dropDownDiv = document.createElement("div");
    const dropDownUl = document.createElement("ul");
    if (i === 0) {
      // cell.contentEditable = false;
      span.innerHTML = `y-${rowNum}`;
      dropDownDiv.setAttribute("class", "dropdown");
      dropDownDiv.innerHTML = `<button class="dropbtn" id="row-dropbtn-${rowNum}">+</button>
        <div id="row-dropdown-${rowNum}" class="dropdown-content">
          <p class="row-insert-top">상단 행 추가</p>
          <p class="row-insert-bottom">하단 행 추가</p>
          <p class="row-delete">행 삭제</p>
        </div>`;
      cell.appendChild(span);
      cell.appendChild(dropDownDiv);
      cell.setAttribute("class", "row-header");
    } else {
      // cell.contentEditable = true;
      const cellBtn = document.createElement("button");
      cellBtn.setAttribute("id", "cell-dropbtn-x" + i + "-y" + rowNum);
      cellBtn.setAttribute("class", "add-on");
      cell.appendChild(cellBtn);
      dropDownUl.setAttribute("id", "cell-dropMenu-x" + i + "-y" + rowNum);
      dropDownUl.setAttribute("class", "cellMenu");
      dropDownUl.innerHTML = `
        <li>
          <label for="tagNm-x${i}-y${rowNum}" class="label">태그번호 :</label>
          <input type="number" name="tagNumber" id="tagNm-x${i}-y${rowNum}" class="tagNm" min="1" maxlength="3" oninput="maxLengthCheck(this)">
        </li>
        <li>
          <span class="label">과실유무</span>
          <input type="checkbox" name="" id="fruitYN-x${i}-y${rowNum}" class="toggleCheckBox">
          <label for="fruitYN-x${i}-y${rowNum}" class="toggleBtn">
            <span></span>
          </label>
        </li>
        <li>
          <button type="button" class="submitBtn">저장</button>
        </li>
        <li>
          <button type="button" class="cancelBtn">취소</button>
          <button type="button" class="resetBtn">초기화</button>
        </li>`;
      cell.appendChild(dropDownUl);
      cell.setAttribute("class", "row-cell");
    }
    cell.setAttribute("id", `r-x${i}-y${rowNum}`);
    // cell.id = `${rowNum}-${i}`;
    tr.appendChild(cell);
  }
  return tr;
};

createTableBody = tableBody => {
  for (let rowNum = 1; rowNum <= defaultRowCount; rowNum++) {
    tableBody.appendChild(this.createTableBodyRow(rowNum));
  }
};

// Fill Data in created table from localstorage
populateTable = () => {
  const data = this.getData();
  if (data === undefined || data === null) return;

  for (let i = 1; i < data.length; i++) {
    for (let j = 1; j < data[i].length; j++) {
      const cell = document.getElementById(`r-${i}-${j}`);
      cell.innerHTML = data[i][j];
    }
  }
};

// Utility function to add row
addRow = (currentRow, direction) => {
  let data = this.getData();
  const colCount = data[0].length;
  const newRow = new Array(colCount).fill("");
  if (direction === "top") {
    data.splice(currentRow, 0, newRow);
  } else if (direction === "bottom") {
    data.splice(currentRow + 1, 0, newRow);
  }
  defaultRowCount++;
  saveData(data);
  this.createSpreadsheet();
};

// Utility function to delete row
deleteRow = currentRow => {
  let data = this.getData();
  data.splice(currentRow, 1);
  defaultRowCount++;
  saveData(data);
  this.createSpreadsheet();
};

// Utility function to add columns
addColumn = (currentCol, direction) => {
  let data = this.getData();
  for (let i = 0; i <= defaultRowCount; i++) {
    if (direction === "left") {
      data[i].splice(currentCol, 0, "");
    } else if (direction === "right") {
      data[i].splice(currentCol + 1, 0, "");
    }
  }
  defaultColCount++;
  saveData(data);
  this.createSpreadsheet();
};

// Utility function to delete column
deleteColumn = currentCol => {
  let data = this.getData();
  for (let i = 0; i <= defaultRowCount; i++) {
    data[i].splice(currentCol, 1);
  }
  defaultColCount++;
  saveData(data);
  this.createSpreadsheet();
};

// Map for storing the sorting history of every column;
const sortingHistory = new Map();

// Utility function to sort columns
sortColumn = currentCol => {
  let spreadSheetData = this.getData();
  let data = spreadSheetData.slice(1);
  if (!data.some(a => a[currentCol] !== "")) return;
  if (sortingHistory.has(currentCol)) {
    const sortOrder = sortingHistory.get(currentCol);
    switch (sortOrder) {
      case "desc":
        data.sort(ascSort.bind(this, currentCol));
        sortingHistory.set(currentCol, "asc");
        break;
      case "asc":
        data.sort(dscSort.bind(this, currentCol));
        sortingHistory.set(currentCol, "desc");
        break;
    }
  } else {
    data.sort(ascSort.bind(this, currentCol));
    sortingHistory.set(currentCol, "asc");
  }
  data.splice(0, 0, new Array(data[0].length).fill(""));
  saveData(data);
  this.createSpreadsheet();
};

// Compare Functions for sorting - ascending
const ascSort = (currentCol, a, b) => {
  let _a = a[currentCol];
  let _b = b[currentCol];
  if (_a === "") return 1;
  if (_b === "") return -1;

  // Check for strings and numbers
  if (isNaN(_a) || isNaN(_b)) {
    _a = _a.toUpperCase();
    _b = _b.toUpperCase();
    if (_a < _b) return -1;
    if (_a > _b) return 1;
    return 0;
  }
  return _a - _b;
};

// Descending compare function
const dscSort = (currentCol, a, b) => {
  let _a = a[currentCol];
  let _b = b[currentCol];
  if (_a === "") return 1;
  if (_b === "") return -1;

  // Check for strings and numbers
  if (isNaN(_a) || isNaN(_b)) {
    _a = _a.toUpperCase();
    _b = _b.toUpperCase();
    if (_a < _b) return 1;
    if (_a > _b) return -1;
    return 0;
  }
  return _b - _a;
};

createSpreadsheet = () => {
  const spreadsheetData = this.getData();
  defaultRowCount = spreadsheetData.length - 1 || defaultRowCount;
  defaultColCount = spreadsheetData[0].length - 1 || defaultColCount;

  const tableHeaderElement = document.getElementById("table-headers");
  const tableBodyElement = document.getElementById("table-body");

  const tableBody = tableBodyElement.cloneNode(true);
  tableBodyElement.parentNode.replaceChild(tableBody, tableBodyElement);
  const tableHeaders = tableHeaderElement.cloneNode(true);
  tableHeaderElement.parentNode.replaceChild(tableHeaders, tableHeaderElement);

  tableHeaders.innerHTML = "";
  tableBody.innerHTML = "";

  tableHeaders.appendChild(createHeaderRow(defaultColCount));
  createTableBody(tableBody, defaultRowCount, defaultColCount);

  // populateTable();

  // attach focusout event listener to whole table body container
  // tableBody.addEventListener("focusout", function(e) {
  //   if (e.target && e.target.nodeName === "TD") {
  //     let item = e.target;
  //     const indices = item.id.split("-");
  //     let spreadsheetData = getData();
  //     spreadsheetData[indices[1]][indices[2]] = item.innerHTML;
  //     saveData(spreadsheetData);
  //   }
  // });

  // Attach click event listener to table body
  tableBody.addEventListener("click", function(e) {
    if (e.target) {
      if (e.target.className === "dropbtn") {
        const idArr = e.target.id.split("-");
        document
          .getElementById(`row-dropdown-${idArr[2]}`)
          .classList.toggle("show");
      }
      if (e.target.className === "row-insert-top") {
        const indices = e.target.parentNode.id.split("-");
        addRow(parseInt(indices[2]), "top");
      }
      if (e.target.className === "row-insert-bottom") {
        const indices = e.target.parentNode.id.split("-");
        addRow(parseInt(indices[2]), "bottom");
      }
      if (e.target.className === "row-delete") {
        const indices = e.target.parentNode.id.split("-");
        deleteRow(parseInt(indices[2]));
      }
      if (e.target.className === "add-on") {
        const idMenu = e.target.id.split("-");
        let cellMenu = document.getElementsByClassName("cellMenu")
        // console.log(cellMenu);
        // cellMenu.classList.remove("on");
        document
          .getElementById(`cell-dropMenu-${idMenu[2]}-${idMenu[3]}`)
          .classList.toggle("on");
      }
    }
  });

  // Attach click event listener to table headers
  tableHeaders.addEventListener("click", function(e) {
    if (e.target) {
      if (e.target.className === "column-header-span") {
        sortColumn(parseInt(e.target.parentNode.id.split("-")[2]));
      }
      if (e.target.className === "dropbtn") {
        const idArr = e.target.id.split("-");
        document
          .getElementById(`col-dropdown-${idArr[2]}`)
          .classList.toggle("show");
      }
      if (e.target.className === "col-insert-left") {
        const indices = e.target.parentNode.id.split("-");
        addColumn(parseInt(indices[2]), "left");
      }
      if (e.target.className === "col-insert-right") {
        const indices = e.target.parentNode.id.split("-");
        addColumn(parseInt(indices[2]), "right");
      }
      if (e.target.className === "col-delete") {
        const indices = e.target.parentNode.id.split("-");
        deleteColumn(parseInt(indices[2]));
      }
    }
  });
};

createSpreadsheet();

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches(".dropbtn")) {
    let dropdowns = document.getElementsByClassName("dropdown-content");
    let i;
    for (i = 0; i < dropdowns.length; i++) {
      let openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  } else if (!event.target.matches(".add-on")) {
    let dropdowns = document.getElementsByClassName("cellMenu");
    let i;
    for (i = 0; i < dropdowns.length; i++) {
      let openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("on")) {
        openDropdown.classList.remove("on");
      }
    }
  }
};


function maxLengthCheck(object){
  if (object.value.length > object.maxLength){
      object.value = object.value.slice(0, object.maxLength);
  }    
}

// document.getElementById("reset").addEventListener("click", e => {
//   if (
//     confirm("This will erase all data and set default configs. Are you sure?")
//   ) {
//     this.resetData();
//   }
// });

document.getElementById("reset").addEventListener("click", e => {
  if (
    confirm("기록된 모든 데이터를 삭제하시겠습니까?")
  ) {
    let thisCell = $('.row-cell');
    console.log(thisCell);
    thisCell.removeClass('fruit_y fruit_n');
    thisCell.find('.add-on').html('');
    thisCell.find('.toggleCheckBox').prop('checked', false);
    thisCell.find('.tagNm').val(null);
  }
});





$(document).ready(function(){
  let xNumber, // 선택한 셀의 x좌표
      yNumber; // 선택한 셀의 y좌표
  
  $('.functionBtnWrap .view').click(function(){
    let viewBtnIndex = $(this).index() + 1;
    let btnId = $(this).attr('id');

    console.log(viewBtnIndex);
    console.log(btnId);
    $('.spreadsheet__table').attr('class', 'spreadsheet__table');
    if(btnId === 'view'+viewBtnIndex+'x') {      
      $('.spreadsheet__table').addClass('view'+viewBtnIndex+'x');
    }
  });

  $('.add-on').click(function(){
    

    const cellIndex = $(this).parent().index() + 1; // 선택한 셀이 x축으로 몇번쨰인지.
    let tableTd = $('.spreadsheet__table--body tr td');
    let xAxisTd = $('.spreadsheet__table--body td:nth-child(' + cellIndex + ')');
    let yAxisTr = $(this).parent().parent().find('td');

    tableTd.removeClass('cross')
    xAxisTd.addClass('cross');
    yAxisTr.addClass('cross');

    $('.row-cell').removeClass('selected');
    $('.cellMenu').removeClass('on')
    $(this).parent('.row-cell').toggleClass('selected');
    let cellId = $(this).attr('id').split('-');
    xNumber = cellId[2].substr(1);
    yNumber = cellId[3].substr(1);
    $('#xAxis').val(xNumber);
    $('#yAxis').val(yNumber);
  });


  $('input.tagNm[type=number]').on('propertychange change keyup paste input', function(){
    let thisCell = $(this).parent().parent().parent('.row-cell');
    let tagValue = $(this).val().length;
    if(tagValue === 0) {
      thisCell.find('.toggleCheckBox').prop('checked', false);
      thisCell.find('.add-on').html('');
    } else {
      thisCell.find('.toggleCheckBox').prop('checked', true);
    }
  });


  $('.submitBtn').click(function(){
    let thisCell = $(this).parent().parent().parent('.row-cell');
    let tag_no = thisCell.find('#tagNm-x'+ xNumber +'-y'+ yNumber +'').val();
    let fruit_yn = thisCell.find('#fruitYN-x'+ xNumber +'-y'+ yNumber +'').is(':checked');
    console.log('tag_no : '+ tag_no + ', fruitYN : '+ fruit_yn);

    if(tag_no != false){ // 태그번호가 존재하는경우
      thisCell.find('.add-on').html(tag_no);
      thisCell.removeClass('fruit_n');
      thisCell.addClass('fruit_y');
      thisCell.find('.toggleCheckBox').prop('checked', true);

    } else if(tag_no == false && fruit_yn == true) { // 태그번호는 없고 과실만 있는 경우
      thisCell.removeClass('fruit_n');
      thisCell.addClass('fruit_y');

    } else if(tag_no == false && fruit_yn == false) { // 무과실 식재의 경우
      thisCell.addClass('fruit_n');
      thisCell.removeClass('fruit_y');

    }
    thisCell.find('.cellMenu').removeClass('on');
    $('.spreadsheet__table--body tr td').removeClass('selected');
    $('.spreadsheet__table--body tr td').removeClass('cross');
  });

  $('.cancelBtn').click(function(){
    $('.spreadsheet__table--body tr td').removeClass('selected');
    $('.spreadsheet__table--body tr td').removeClass('cross');
    $('.cellMenu').removeClass('on');
  });

  $('.resetBtn').click(function(){
    let thisCell = $(this).parent().parent().parent('.row-cell');
    console.log(thisCell);
    thisCell.removeClass('fruit_y fruit_n');
    thisCell.find('.add-on').html('');
    thisCell.find('.toggleCheckBox').prop('checked', false);
    thisCell.find('.tagNm').val(null);

    console.log(thisCell.find('.toggleCheckBox').is(':checked'))
  });

});

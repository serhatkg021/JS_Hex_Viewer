var inputElement = document.getElementById('fileInput');
var darkMode = document.getElementById('darkSwitch');
var hexModelContent = document.getElementById('hexModelContent');
var hexModalContainer = document.getElementById('modalBodyContainer');
var hexAdressArea = document.getElementById('hexAdressArea');
var hexDataArea = document.getElementById('hexDataArea');
var hexASCIIArea = document.getElementById('hexASCIIArea');
var searchTextInput = document.getElementById('searchTextInput');
var searchHexInput = document.getElementById('searchHexInput');

let reader = new FileReader();
let fileHexData = '';

inputElement.onchange = function (event) {
    let file = inputElement.files[0];
    end = file.size;
    document.getElementById('hexModalLongTitle').innerHTML = file.name;
    reader.onload = function (event) {
        createTable();
        loadTable(event.target.result);
        for (let i = 0; i < event.target.result.length; i++) {
            fileHexData += toHex(event.target.result[i]);
        }
    };
    reader.readAsBinaryString(file);
    $('#hexModal').modal();
}

darkMode.onclick = function () {
    if (darkMode.checked) {
        hexModelContent.style.backgroundColor = 'black';
        hexModelContent.style.color = 'white';
    }
    else {
        hexModelContent.style.backgroundColor = 'white';
        hexModelContent.style.color = 'black';
    }
}

hexModalContainer.onwheel = function (e) {
    if (e.wheelDelta / 120 > 0) { //UP
        if (offset < 0) {
            offset = 0;
            offsetEnd = 16 * 16;
        }
        else {
            offsetEnd = offset;
            offset -= 16 * 16;
        }
        loadTable(reader.result);
    }
    else {                        // DOWN
        if (offsetEnd > reader.result.length) {
            // console.log(offset, offsetEnd, reader.result.length);

        }
        else {
            offset = offsetEnd;
            offsetEnd += 16 * 16;
            // console.log(offset, offsetEnd, reader.result.length);

        }
        loadTable(reader.result);
    }
};


var offset = 0
var offsetEnd = 16 * 16;
var end;
var _file;
var tempHexDataLineDiv, tempHexASCIILineDiv;

function createTable() {
    clear();
    for (let i = 0; i < 16 * 16; i++) {
        if (!(i % 16)) {
            hexAdressArea.innerHTML += `<div id="hexAdressLine${i}" style="padding: 5px 5px; text-align: center;"></div>`;
            hexDataArea.innerHTML += `<div id="hexDataLine${i}" style="width: 100%; display: table; padding: 5px 5px; "></div>`;
            hexASCIIArea.innerHTML += `<div id="hexASCIILine${i}" style="width: 100%; display: table; padding: 5px 5px; "></div>`;

            document.getElementById('hexAdressLine' + i).innerHTML += `<span class="hex-text"></span>`;
            tempHexDataLineDiv = document.getElementById('hexDataLine' + i);
            tempHexASCIILineDiv = document.getElementById('hexASCIILine' + i);
        }
        tempHexDataLineDiv.innerHTML += `<span style="width: 37px; display: table-cell;"></span>`;
        tempHexASCIILineDiv.innerHTML += `<span style="width: 5px; display: table-cell;"></span >`;
    }
}

function loadTable(file) {
    _file = file.slice(offset, offsetEnd);
    var lastIndex;
    for (let i = 0; i < _file.length; i++) {
        if (!(i % 16)) {
            document.getElementById('hexAdressLine' + i).children[0].innerHTML = toHexAdress(i + offset);
            tempHexDataLineDiv = document.getElementById('hexDataLine' + i).children;
            tempHexASCIILineDiv = document.getElementById('hexASCIILine' + i).children;
        }

        tempHexDataLineDiv[i % 16].innerHTML = toHex(_file[i]).toUpperCase();
        tempHexASCIILineDiv[i % 16].innerHTML = toASCII(_file[i]);
        lastIndex = i;

        // tempHexDataLineDiv[i % 16].onclick = function () {
        //     console.log(i);
        //     tempHexASCIILineDiv[i % 16].style.backgroundColor = "red";
        // }

        // tempHexASCIILineDiv[i % 16].onclick = function () {
        //     console.log(tempHexASCIILineDiv);

        //     tempHexDataLineDiv[i % 16].style.backgroundColor = "red";
        // }
    }
    if (lastIndex < 16 * 16) {
        for (let i = lastIndex + 1; i < 16 * 16; i++) {
            if (!(i % 16)) {
                document.getElementById('hexAdressLine' + i).children[0].innerHTML = '';
                tempHexDataLineDiv = document.getElementById('hexDataLine' + i).children;
                tempHexASCIILineDiv = document.getElementById('hexASCIILine' + i).children;
            }
            tempHexDataLineDiv[i % 16].innerHTML = '&nbsp&nbsp';
            tempHexASCIILineDiv[i % 16].innerHTML = '&nbsp&nbsp';
        }
    }
}


function toHex(str) {
    return str.charCodeAt(0).toString(16).padStart(2, '0');
}

function toHexAdress(adress) {
    return adress.toString(16).padStart(8, '0');
}

function toASCII(str) {
    return (str.charCodeAt(0) < 32 || str.charCodeAt(0) === 127) ? '.' : String.fromCharCode(str.charCodeAt(0));
}

function clear() {
    hexAdressArea.innerHTML = '';
    hexDataArea.innerHTML = '';
    hexASCIIArea.innerHTML = '';
    offset = 0
    offsetEnd = 16 * 16;
}

function changeSearchText() {
    var searchHexValue = '';
    for (let index = 0; index < searchTextInput.value.length; index++) {
        searchHexValue += toHex(searchTextInput.value[index]) + " ";
    }
    searchHexInput.value = searchHexValue;
}

var searchFindOffset = [];
var searchClickCount = 0;
var tempOffsetArrayFirst;
var searchHexValue;
function search() {
    if (searchClickCount == 0) {
        var searchIndex = 0;
        searchHexValue = searchHexInput.value.split(" ");
        searchHexValue = searchHexValue.join("");
        for (let i = 0; i < fileHexData.length; i++) {
            if (searchHexValue[searchIndex] == fileHexData[i]) {
                searchIndex++;
                if (searchIndex == searchHexValue.length) {
                    searchFindOffset.push(i / 2 - (searchIndex / 2 - 1) - 0.5);
                    searchIndex = 0;
                }
            }
            else {
                searchIndex = 0;
            }
        }
        document.getElementById('searchCount').innerHTML = searchFindOffset.length;

        tempOffsetArrayFirst = searchFindOffset.shift();
        offset = tempOffsetArrayFirst - (tempOffsetArrayFirst % 16);
        offsetEnd = offset + 16 * 16;
        loadTable(reader.result);

        var tempLinePad = 0;
        var tempFindHexDataLine = hexDataArea.children[tempLinePad];
        var tempFindHexAsciiLine = hexASCIIArea.children[tempLinePad];

        for (let i = tempOffsetArrayFirst % 16; i < tempOffsetArrayFirst % 16 + (searchHexValue.length / 2); i++) {
            tempFindHexDataLine.children[i % 16].style.backgroundColor = "green";
            tempFindHexAsciiLine.children[i % 16].style.backgroundColor = "green";
            if (!(i % 15)) {
                tempLinePad++;
                tempFindHexDataLine = hexDataArea.children[tempLinePad]
                tempFindHexAsciiLine = hexASCIIArea.children[tempLinePad]
            }
        }
        searchClickCount++;
    }
    else {
        if (searchClickCount < searchFindOffset.length + searchClickCount) {
            console.log(searchClickCount, searchFindOffset.length);
            tempOffsetArrayFirst = searchFindOffset.shift();
            offset = tempOffsetArrayFirst - (tempOffsetArrayFirst % 16);
            offsetEnd = offset + 16 * 16;

            loadTable(reader.result);
            var tempLinePad = 0;
            var tempFindHexDataLine = hexDataArea.children[tempLinePad];
            var tempFindHexAsciiLine = hexASCIIArea.children[tempLinePad];

            for (let i = tempOffsetArrayFirst % 16; i < tempOffsetArrayFirst % 16 + (searchHexValue.length / 2); i++) {
                tempFindHexDataLine.children[i % 16].style.backgroundColor = "green";
                tempFindHexAsciiLine.children[i % 16].style.backgroundColor = "green";
                if (!(i % 15)) {
                    tempLinePad++;
                    tempFindHexDataLine = hexDataArea.children[tempLinePad]
                    tempFindHexAsciiLine = hexASCIIArea.children[tempLinePad]
                }
            }
            searchClickCount++;
        }
    }
    console.log(searchFindOffset);
}
let fileList, itemsNumber, fullSize;

const generateButton = document.querySelector('#generatejson');
const dlButton = document.querySelector('#downloadjson');
const openLinkButton = document.querySelector('#openlink');
const urlInput = document.querySelector('#url-input');
const jsonPlaceholder = document.querySelector('#json');
jsonPlaceholder.value = "";

const itemListContainer = document.querySelector(".item-list-container");
const itemList = itemListContainer.querySelector(".item-list");
const hideItemListButton = itemListContainer.querySelector(".hide-button");
const showItemListButton = itemListContainer.querySelector(".show-button");

function bytesToSize(bytes) {
    var sizes = ["Bytes", "Kb", "Mb", "Gb", "Tb"];
    if (bytes == 0) return "0 Byte";
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

function createItems(fileList) {
    var newRequest = false;
    fileList.forEach(function (item, index) {
        var itemTemplate = document.createElement("li");
        itemTemplate.classList.add("item");
        itemTemplate.innerHTML =
            `<a class="item-container" data-type="${item.extension}" href="${item.url}">
                <div class="info-bar">
                    <span class="small-info extension">${item.extension}</span><span class="small-info size">${item.size}</span>
                </div>
                <div class="item-content">
                    <div class="image" data-type="${item.extension}"></div>
                    <div class="info">
                        <span>${item.name}</span>
                    </div>
                </div>
            </a>`;
        setTimeout(function () {
            if (itemList.classList.contains("processing") && !newRequest) {
                itemList.appendChild(itemTemplate);
            } else {
                newRequest = true;
            }
        }, 100 * index);
    });
}

function getFileList() {
    const url = new URL(urlInput.value);
    const request = new XMLHttpRequest();
    const params = JSON.stringify({ url: url.href, origin: url.origin, path: url.pathname + url.search });
    request.open('POST', 'http://localhost:1337/parser/filelist', true);
    request.setRequestHeader("Content-type", "application/json; charset=utf-8");
    request.onload = function () {
        fileList = JSON.parse(this.response);
        if (fileList.error) {
            jsonPlaceholder.classList.add("error");
            jsonPlaceholder.value = fileList.message;
            generateButton.classList.remove("loading");
            return
        }
        itemsNumber = fileList.length;
        fullSize = bytesToSize(fileList.reduce((a, b) => ({ bytes: a.bytes + b.bytes })).bytes);
        jsonPlaceholder.classList.remove("error");
        jsonPlaceholder.value = JSON.stringify(fileList, undefined, 1);
        generateButton.classList.remove("loading");
        itemList.classList.add("processing");
        dlButton.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fileList)));
        dlButton.setAttribute("download", "fileList.json");
        dlButton.classList.remove("disabled");
        itemListContainer.classList.add("visible");
        hideItemListButton.classList.remove("disabled");
        showItemListButton.classList.add("disabled");
        createItems(fileList);
    }
    request.onerror = function (response) {
        jsonPlaceholder.classList.add("error");
        jsonPlaceholder.value = response.type + ": " + response.target.status;
        generateButton.classList.remove("loading");
    }
    request.send(params);
}

generateButton.onclick = function () { getFileList(); this.classList.add("loading"); itemList.classList.remove("processing"); itemList.innerHTML = ""; }
openLinkButton.onclick = function () { window.open(urlInput.value); }
hideItemListButton.onclick = function () { itemListContainer.classList.remove("visible"); hideItemListButton.classList.add("disabled"); showItemListButton.classList.remove("disabled"); }
showItemListButton.onclick = function () { itemListContainer.classList.add("visible"); hideItemListButton.classList.remove("disabled"); showItemListButton.classList.add("disabled"); }
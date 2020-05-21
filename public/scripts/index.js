let playlist, itemsNumber, fullSize;

const generateButton = document.querySelector('#generatejson');
const dlButton = document.querySelector('#downloadjson');
const openLinkButton = document.querySelector('#openlink');
const urlInput = document.querySelector('#url-input');
const jsonPlaceholder = document.querySelector('#json');
jsonPlaceholder.value = "";

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'Kb', 'Mb', 'Gb', 'Tb'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

function getPlaylist() {
    const url = new URL(urlInput.value);
    const request = new XMLHttpRequest();
    const params = JSON.stringify({ url: url.href, origin: url.origin, path: url.pathname + url.search });
    request.open('POST', 'http://localhost:1337/parser/filelist', true);
    request.setRequestHeader("Content-type", "application/json; charset=utf-8");
    request.onload = function () {
        playlist = JSON.parse(this.response);
        itemsNumber = playlist.length;
        fullSize = bytesToSize(playlist.reduce((a, b) => ({ bytes: a.bytes + b.bytes })).bytes);
        jsonPlaceholder.classList.remove("error");
        jsonPlaceholder.value = JSON.stringify(playlist, undefined, 1);
        generateButton.classList.remove("loading");
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(playlist));
        dlButton.setAttribute("href", dataStr);
        dlButton.setAttribute("download", "playlist.json");
        dlButton.classList.remove("disabled");
    }
    request.onerror = function (response) {
        jsonPlaceholder.classList.add("error");
        jsonPlaceholder.value = response.type + ": " + response.target.status;
        generateButton.classList.remove("loading");
    }
    request.send(params);
}

generateButton.onclick = function () { getPlaylist(); this.classList.add("loading"); }
openLinkButton.onclick = function () { window.open(urlInput.value); }
const path = require("path");
const fs = require('fs');
const URL = require('url').URL;
const phantom = require("phantom");
const Hapi = require('hapi');
const inquirer = require('inquirer');
const open = require('open');
const globalFunctions = require('./global-functions');
const config = require('./config.json');
const host = config.serverSettings.host;
const port = config.serverSettings.port;
const defaultUrl = config.userSettings.defaultUrl;
const saveJsonPath = config.userSettings.saveJsonPath;
const thumbnailPath = config.userSettings.thumbnail.path;
const thumbnailExtension = config.userSettings.thumbnail.extension;
const server = Hapi.Server({
    host: host,
    port: port
});

function writeJson(newFileList) {
    fs.writeFile(saveJsonPath, JSON.stringify(newFileList), function (error) {
        if (error) {
            console.error("\nError:  " + error.message);
        } else {
            console.log("\nFile writed on " + path.resolve(saveJsonPath));
        }
    });
}

function checkFiles(newFileList) {
    let fileExist;
    try {
        fileExist = fs.existsSync(saveJsonPath);
    } catch (err) {
        fileExist = false;
    }
    if (fileExist && saveJsonPath != "") {
        console.group("\File list already exist, check files:");
        console.time("Time");
        var newFiles = 0;
        var oldFiles = 0;
        oldFileList = JSON.parse(fs.readFileSync(saveJsonPath, 'utf8'));
        newFileList.forEach(function (item, index) {
            if (oldFileList.map(function (items) { return items['id']; }).indexOf(item.id) === -1) {
                console.log("New file : " + item.fileName);
                ++newFiles;
            }
        });
        oldFileList.forEach(function (item, index) {
            if (newFileList.map(function (items) { return items['id']; }).indexOf(item.id) === -1) {
                console.log("Removed file : " + item.fileName);
                ++oldFiles;
            }
        });
        console.log("New file(s) : " + newFiles);
        console.log("Removed file(s) : " + oldFiles);
        console.timeEnd("Time");
        console.groupEnd();
        if (newFiles != 0 || oldFiles != 0) {
            writeJson(newFileList);
        }
    } else if (saveJsonPath != "") {
        writeJson(newFileList);
    } else {
        console.log("No path in config.json to save the json, the file was not saved.");
    }
}

function buildJson(filelist) {
    console.time('Json build');
    var newList = [];
    filelist.forEach(function (item) {
        let name, cleanName, extension, artist, title, filter, url, bytes;
        name = item.name.replace(/ +/g, ' ').replace(/\n/g, '').trim();
        cleanName = name.lastIndexOf(".") != -1 ? name.substr(0, name.lastIndexOf(".")).trim() : name;
        filter = cleanName.replace(/[-.()]/g, "").replace(/ +/g, ' ').toLowerCase();
        extension = name.lastIndexOf(".") != -1 ? name.substr(name.lastIndexOf(".") + 1).trim() : item.mimetype.match(/^(httpd\/unix-directory)$/) ? "zip" : "";
        url = item.url;
        bytes = item.size;
        if (extension.match(/^(mp3|wav|ogg|flac|wma|mid)$/)) {
            if (/[-]+/.test(cleanName)) {
                artist = cleanName.match(/[^-]*/i)[0].trim();
                title = cleanName.match(/-([\s\S]*)$/)[1].trim();
            } else {
                title = cleanName;
            }
        }
        itemDatas = {
            "id": item.id,
            "fileName": name,
            "name": cleanName,
            "filter": filter,
            "extension": extension,
            "mimetype": item.mimetype,
            "url": url,
            "bytes": bytes,
            "size": globalFunctions.bytesToSize(bytes),
            "thumbnail": (thumbnailPath != "" && thumbnailExtension != "" ? thumbnailPath + cleanName + thumbnailExtension : undefined),
            "artist": (artist ? artist : undefined),
            "title": (title ? title : undefined),
        }
        newList.push(itemDatas);
    });
    console.timeEnd("Json build");
    console.timeEnd("Time");
    console.groupEnd();
    return newList;
}

async function getFileList(url) {
    console.group("\nRequest: " + globalFunctions.dateDisplay());
    console.time("Time")
    var fileList = {};
    var timeout = 0;
    const thisUrl = new URL(url.url);
    console.time('Page loading');
    const instance = await phantom.create();
    const page = await instance.createPage();
    await page.open(url.url);
    console.timeEnd('Page loading');
    console.time('Files list request');
    while (Object.keys(fileList).length === 0) {
        fileList = await page.evaluateJavaScript('function(){return FileList.files;}');
        ++timeout
        if (fileList === undefined || fileList === null) {
            const errorMessage = "File list is not available"
            console.log(errorMessage);
            return {
                error: true,
                message: errorMessage
            }
        } else if (timeout === 100) {
            const timeoutMessage = "There is no files or the file list is unreachable"
            console.log(timeoutMessage);
            return {
                error: true,
                message: timeoutMessage
            }
        }
    }
    console.timeEnd('Files list request');
    console.time('Attach download urls');
    fileList.forEach(function (item) {
        item.url = thisUrl.origin + thisUrl.pathname + '/download' + thisUrl.search + '&files=' + encodeURIComponent(item.name);
    });
    console.timeEnd('Attach download urls');
    await instance.exit();
    return buildJson(fileList);
}

server.route({
    config: {
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    },
    method: 'POST',
    path: '/parser/filelist',
    handler: function (request, h) {
        return getFileList(request.payload).then((result) => { return result });
    }
});

const init = async (initOptions) => {
    if (initOptions.runServer) {
        await server.start();
        console.log("Server up and running at port: " + port);
        if (initOptions.openBui) {
            open(path.resolve("./public/index.html"), { "wait": false });
        }
    }
    if (initOptions.checkFiles) {
        if (defaultUrl.url != "") {
            getFileList(defaultUrl).then((result) => {
                checkFiles(result);
            });
        } else if (initOptions.runServer) {
            console.log("No default url set in config.json, please use browser user interface.");
        } else {
            console.log("No default url set in config.json, please set an url in config.json or use browser user interface.");
        }
    }
}


inquirer.prompt([
    {
        type: "input",
        name: "runServer",
        message: "Run server (Y/N)",
        default: "y"
    },
    {
        type: "input",
        name: "openBui",
        message: "Open browser user interface (Y/N)",
        default: "y",
        when: function (answers) { return (answers.runServer.toLowerCase() === "y" || answers.runServer.toLowerCase() === "yes"); }
    },
    {
        type: "input",
        name: "checkFiles",
        message: "Check from default url (configured in config.json) (Y/N)",
        default: "y"
    }
]).then(answers => {
    const initOptions = {
        runServer: (answers.runServer.toLowerCase() === "y" || answers.runServer.toLowerCase() === "yes" ? true : false),
        openBui: (answers.openBui ? (answers.openBui.toLowerCase() === "y" || answers.openBui.toLowerCase() === "yes" ? true : false) : false),
        checkFiles: (answers.checkFiles.toLowerCase() === "y" || answers.checkFiles.toLowerCase() === "yes" ? true : false),
    };
    init(initOptions);
}).catch(error => {
    console.log(error)
});
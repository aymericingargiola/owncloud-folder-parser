const fs = require('fs');
module.exports = {
    IntTwoChars: function (i) {
        return (`0${i}`).slice(-2);
    },
    dateDisplay: function () {
        const date_ob = new Date();
        const date = this.IntTwoChars(date_ob.getDate());
        const month = this.IntTwoChars(date_ob.getMonth() + 1);
        const year = date_ob.getFullYear();
        const hours = this.IntTwoChars(date_ob.getHours());
        const minutes = this.IntTwoChars(date_ob.getMinutes());
        const seconds = this.IntTwoChars(date_ob.getSeconds());
        return `${date}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    },
    bytesToSize: function (bytes) {
        const sizes = ['Bytes', 'Kb', 'Mb', 'Gb', 'Tb'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    },
    errorRequest: function (code, message) {
        console.warn("\x1b[31m", message, "\x1b[0m");
        return {
            error: true,
            status: code,
            message: message
        }
    },
    initOptions: function (runServerParam = true, openBuiParam = false, checkFilesParam = false) {
        return {
            runServer: runServerParam,
            openBui: openBuiParam,
            checkFiles: checkFilesParam,
        }
    },
    fileExist: function (filePath) {
        if (filePath != "" && filePath.lastIndexOf(".") != -1 && filePath.lastIndexOf(".") != 0) {
            try {
                fs.existsSync(filePath);
                return true
            } catch (err) {
                return false
            }
        } else {
            return false
        }
    }
};
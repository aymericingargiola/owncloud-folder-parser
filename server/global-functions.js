module.exports = {
    sleep: function (ms) {
        return new Promise(r => setTimeout(r, ms))
    },
    asyncForEach: async function (array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    },
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
        var sizes = ['Bytes', 'Kb', 'Mb', 'Gb', 'Tb'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    }
};
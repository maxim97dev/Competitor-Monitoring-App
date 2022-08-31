module.exports = function(value) {
    let timestamp = +value,
        date = new Date(timestamp);

    return `${date.getDate()}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;

};
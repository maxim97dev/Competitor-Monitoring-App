module.exports = function(rate) {
    return (rate.num === 0) ? 0 + ' %' : Math.abs(Math.round(((rate.parent.task.scan[rate.num].length - rate.parent.task.scan[rate.num - 1].length) / rate.parent.task.scan[rate.num - 1].length) * 100 * 100) / 100) + ' %';

};
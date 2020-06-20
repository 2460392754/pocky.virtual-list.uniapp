/**
 * 防抖
 * @param {Function} func
 * @param {number} wait [16.7] 60帧屏幕刷新率刷新屏幕的时间
 */
export const debounce = function (func, wait = 1000 / 60) {
    let timer = null;

    // 返回一个闭包，并修改`func`的this引用指向
    return function () {
        if (timer) clearTimeout(timer);

        timer = setTimeout(func.bind(this), wait, ...arguments);
    };
};

/**
 * 节流
 * @param {Function} func
 * @param {number} wati [16.7] 60帧屏幕刷新率m每次刷新屏幕所需的时间
 */
export const throttle = function (func, wati = 1000 / 60) {
    let timer = null;

    return function () {
        if (!timer) {
            timer = setTimeout(() => {
                func.apply(this, arguments);
                timer = null;
            }, wati);
        }
    };
};

/**
 * 二分法查找
 * @param {*} list
 * @param {*} value
 */
export const binarySearch = function (list, value) {
    let start = 0;
    let end = list.length - 1;
    let tempIndex = null;

    while (start <= end) {
        let midIndex = parseInt((start + end) / 2);
        let midValue = list[midIndex].bottom;

        if (midValue === value) {
            return midIndex + 1;
        } else if (midValue < value) {
            start = midIndex + 1;
        } else if (midValue > value) {
            if (tempIndex === null || tempIndex > midIndex) {
                tempIndex = midIndex;
            }

            end = end - 1;
        }
    }

    return tempIndex;
};

/**
 * 获取 指定随机值
 * @param {number} min 最小值
 * @param {number} max 最大值
 */
export const random = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

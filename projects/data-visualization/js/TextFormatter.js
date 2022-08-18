function makeNumber(item) {
    if (item != item - 0) {
        return NaN;
    }
    return item - 0;
}

function makeDate(item) {
    // Parse date string
    const numberList = item.split("/");
    if (numberList.length != 3) {
        return NaN;
    }
    let date = new Date(numberList[1] + "/" + numberList[0] + "/" + numberList[2]);
    if (isNaN(date.getTime())) {
        return NaN;
    }

    // Return date object
    return date;
}

function makeTime(item) {
    // Parse time string
    const numberList = item.split(":");
    if (numberList.length < 2 || numberList.length > 3) {
        return NaN;
    }
    const hours = parseInt(numberList[0]);
    if (isNaN(hours) || numberList[0].length != 2 || hours < 0 || hours > 23) {
        return NaN;
    }
    const minutes = parseInt(numberList[1]);
    if (isNaN(minutes) || numberList[1].length != 2 || minutes < 0 || minutes > 59) {
        return NaN;
    }

    // Seconds are optional
    let seconds = 0;
    if (numberList.length == 3) {
        seconds = parseInt(numberList[2]);
        if (isNaN(seconds) || numberList[2].length != 2 || seconds < 0 || seconds > 59) {
            return NaN;
        }
    }

    // It is the time, make date object to store it
    return new Date(0, 0, 0, hours, minutes, seconds);
}

function combineDatetime(date, time) {
    date.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
}

function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    return day + "/" + (month + 1) + "/" + year;
}

function formatTime(time) {
    const hours = ("00" + time.getHours()).slice(-2);
    const minutes = ("00" + time.getMinutes()).slice(-2);
    const seconds = ("00" + time.getSeconds()).slice(-2);

    return hours + ":" + minutes + ":" + seconds;
}

function formatDateTime(datetime) {
    return formatDate(datetime) + " " + formatTime(datetime);
}

function getNaNTextNode() {
    return document.createTextNode(NaN.toString());
}

function getAverageTextNode(terrainObjects, index) {
    let average = 0;
    let count = 0;
    for (let terrainObject of terrainObjects) {
        for (let dataObject of terrainObject.dataRow.visibleData) {
            average += dataObject.getItem(index);
            count++;
        }
    }
    if (count == 0) {
        return getNaNTextNode();
    }
    return document.createTextNode((average / count).toFixed(2).toString());
}

function getAverageHeightTextNode(terrainObjects) {
    let average = 0;
    let count = 0;
    for (let terrainObject of terrainObjects) {
        average += terrainObject.numY;
        count++;
    }
    if (count == 0) {
        return getNaNTextNode();
    }
    return document.createTextNode((average / count).toFixed(2).toString());
}

function getTimeRangeTextNode(terrainObjects, index, formatFunction) {
    // Get min and max values
    let min = -1;
    let max = -1;
    for (let terrainObject of terrainObjects) {
        for (let dataObject of terrainObject.dataRow.visibleData) {
            let item = dataObject.getItem(index);
            if (min == -1) {
                min = item;
            } else {
                min = min.getTime() > item.getTime() ? item : min;
            }
            if (max == -1) {
                max = item;
            } else {
                max = max.getTime() > item.getTime() ? max : item;
            }
        }
    }
    let docFragment = document.createDocumentFragment();

    // Check if min and max are the same objects, simplify the range
    if (min == max) {
        if (min == -1) {
            docFragment.appendChild(getNaNTextNode());
        } else {
            let textMinNode = document.createTextNode(formatFunction(min));
            docFragment.appendChild(textMinNode);
        }
    } else {
        // Add min
        if (min == -1) {
            docFragment.appendChild(getNaNTextNode());
        } else {
            let textMinNode = document.createTextNode(formatFunction(min));
            docFragment.appendChild(textMinNode);
        }

        // Add break
        let brNode = document.createElement("br");
        docFragment.appendChild(brNode);

        // Add max
        if (max == -1) {
            docFragment.appendChild(getNaNTextNode());
        } else {
            let textMaxNode = document.createTextNode(formatFunction(max));
            docFragment.appendChild(textMaxNode);
        }
    }

    return docFragment;
}

function getListTextNode(terrainObjects, index) {
    const count = terrainObjects.length;

    if (count == 0) {
        return getNaNTextNode();
    } else if (count > 1) {
        let text = "More than one object was selected";
        return document.createTextNode(text);
    } else {
        let text = "";
        for (let terrainObject of terrainObjects) {
            for (let dataObject of terrainObject.dataRow.visibleData) {
                // Add ", " before every element except the first
                if (text != "") {
                    text += ", "
                }
                text += dataObject.getItem(index);
            }
        }
        return document.createTextNode(text);
    }
}
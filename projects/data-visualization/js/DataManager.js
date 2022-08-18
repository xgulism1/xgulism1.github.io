function DataManager() {
    // List of operators for filter conditions
    evoAPI = {
        sEqual: 'eq',
        sNotEqual: 'ne',
        sStart: 'sw',
        sFinish: 'fw',
        sContain: 'ct',
        sNotContain: 'nct',
        sGreater: 'gt',
        sSmaller: 'lt',
        sBetween: 'bw',
        sNotBetween: 'nbw'
    };

    this.headers = [];
    this.allDataObjects = [];

    this.parseHeaders = function (line) {
        let headerLabels = line.split(';');
        this.headers = [];
        this.allDataObjects = [];
        for (let headerLabel of headerLabels) {
            let headerObject = {label: headerLabel};
            this.headers.push(headerObject);
        }
    };

    this.parseFirstRecord = function (line) {
        let lineItems = line.split(';');
        // First record determines the type
        if (lineItems.length == this.headers.length && this.allDataObjects.length == 0) {
            let dataLine = [];
            for (let i = 0; i < lineItems.length; i++) {
                let item = lineItems[i];
                let header = this.headers[i];

                // Test for number
                let number = makeNumber(item);
                if (!isNaN(number)) {
                    header.type = "number";
                    header.min = number;
                    header.max = number;
                    dataLine.push(number);
                } else {
                    // Test for date
                    let date = makeDate(item);
                    if (!isNaN(date)) {
                        header.type = "date";
                        header.min = date;
                        header.max = date;
                        dataLine.push(date);
                    } else {
                        // Test for time
                        let time = makeTime(item);
                        if (!isNaN(time)) {
                            header.type = "time";
                            header.min = time;
                            header.max = time;
                            dataLine.push(time);
                        } else {
                            // Default to text
                            header.type = "text";
                            header.min = item;
                            header.max = item;
                            dataLine.push(item);
                        }
                    }
                }
            }

            // Ignore the record if it is not complete
            if (dataLine.length == this.headers.length) {
                let dataObject = new DataObject(dataLine);
                let dataRow = {visibleData: [dataObject], invisibleData: []};
                this.allDataObjects.push(dataRow);
                return true;
            }
        }
        return false;
    };

    this.parseRecord = function (line) {
        let lineItems = line.split(';');

        // Another record does not determine the type
        if (lineItems.length == this.headers.length) {
            let dataLine = [];
            for (let i = 0; i < lineItems.length; i++) {
                let item = lineItems[i];
                let header = this.headers[i];

                // Check if the item should be a number
                if (header.type == "number") {
                    let number = makeNumber(item);
                    // Check if the item is really a number
                    if (isNaN(number)) {
                        break;
                    }
                    header.min = Math.min(number, header.min);
                    header.max = Math.max(number, header.max);
                    dataLine.push(number);

                    // Check if the item should be a date
                } else if (header.type == "date") {
                    // Check if the item is really a date
                    let date = makeDate(item);
                    if (isNaN(date)) {
                        break;
                    }
                    header.min = header.min.getTime() > date.getTime() ? date : header.min;
                    header.max = header.max.getTime() > date.getTime() ? header.max : date;
                    dataLine.push(date);

                    // Check if the item should be a time
                } else if (header.type == "time") {
                    // Check if the item is really a time
                    let time = makeTime(item);
                    if (isNaN(time)) {
                        break;
                    }
                    header.min = header.min.getTime() > time.getTime() ? time : header.min;
                    header.max = header.max.getTime() > time.getTime() ? header.max : time;
                    dataLine.push(time);

                    // Default to text
                } else {
                    header.min = header.min > item ? item : header.min;
                    header.max = header.max > item ? header.max : item;
                    dataLine.push(item);
                }
            }

            // Ignore the record if it is not complete
            if (dataLine.length == this.headers.length) {
                let dataObject = new DataObject(dataLine);
                let dataRow = {visibleData: [dataObject], invisibleData: []};
                this.allDataObjects.push(dataRow);
                return true;
            }
        }
        return false;
    };

    this.mergeDateColumns = function (dateIndex, timeIndex) {
        if (this.headers.length > Math.max(dateIndex, timeIndex)) {
            // Merge headers
            let headerDate = this.headers[dateIndex];
            let headerTime = this.headers[timeIndex];
            headerDate.label = [headerDate.label, headerTime.label];
            headerDate.type = "datetime";
            // Remove previous date
            this.headers.splice(timeIndex, 1);

            // Merge data
            if (this.allDataObjects.length > 0 && this.allDataObjects[0].visibleData.length > 0) {
                // Initial
                let dataObj = this.allDataObjects[0].visibleData[0];
                let oldDate = dataObj.getItem(dateIndex);
                let oldTime = dataObj.getItem(timeIndex);

                // Modify new date
                combineDatetime(oldDate, oldTime);

                // Compute new min, max
                headerDate.min = oldDate;
                headerDate.max = oldDate;

                // Remove previous date
                dataObj.line.splice(timeIndex, 1);
                dataObj.count--;

                // The rest
                for (let i = 1; i < this.allDataObjects.length; i++) {
                    let dataObj = this.allDataObjects[i].visibleData[0];
                    let oldDate = dataObj.getItem(dateIndex);
                    let oldTime = dataObj.getItem(timeIndex);

                    // Add new date
                    oldDate.setHours(oldTime.getHours(), oldTime.getMinutes(), oldTime.getSeconds());

                    // Compute new min, max
                    headerDate.min = headerDate.min.getTime() > oldDate.getTime() ? oldDate : headerDate.min;
                    headerDate.max = headerDate.max.getTime() > oldDate.getTime() ? headerDate.max : oldDate;

                    // Remove previous date
                    dataObj.line.splice(timeIndex, 1);
                    dataObj.count--;
                }
            }
        }
    };

    function filterOperation(operator, item, value, value2) {
        // Test if filter fails
        if ((operator == evoAPI.sEqual && item != value)
            || ((operator == evoAPI.sNotEqual && item == value))
            || ((operator == evoAPI.sGreater && item < value))
            || ((operator == evoAPI.sSmaller && item > value))
            || ((operator == evoAPI.sStart && item.startsWith(value)))
            || ((operator == evoAPI.sFinish && item.endsWith(value)))
            || ((operator == evoAPI.sContain && item.includes(value)))
            || ((operator == evoAPI.sNotContain && !item.includes(value)))) {
            return false;
        }
        if (((operator == evoAPI.sBetween && (item < value || item > value2)))
            || ((operator == evoAPI.sNotBetween && (item >= value && item <= value2)))) {
            return false;
        }
        // Default passes
        return true;
    }

    this.includeData = function (dataObject, filterValues) {
        for (let filterVal of filterValues) {
            const index = filterVal.field.value.split(",")[1];
            let item = dataObject.getItem(index);
            const type = filterVal.type;
            const operator = filterVal.operator.value;
            const value = filterVal.value.value;
            const value2 = filterVal.value.value2;
            const valuebw = filterVal.value.valuebw;
            const valuebw2 = filterVal.value.valuebw2;
            if (type == "number") {
                if (!filterOperation(operator, item, value, valuebw)) {
                    return false;
                }
            } else if (type == "datetime") {
                // Parse datetime
                let datetimeValue = makeDate(value);
                if (isNaN(datetimeValue)) {
                    return false;
                }
                let timeValue = makeTime(value2);
                if (isNaN(timeValue)) {
                    return false;
                }
                combineDatetime(datetimeValue, timeValue);
                if (isNaN(datetimeValue)) {
                    return false;
                }

                if (valuebw != undefined && valuebw2 != undefined) {
                    // Parse second datetime (if present)
                    let datetimeValuebw = makeDate(valuebw);
                    if (isNaN(datetimeValuebw)) {
                        return false;
                    }
                    let timeValuebw = makeTime(valuebw2);
                    if (isNaN(timeValuebw)) {
                        return false;
                    }
                    combineDatetime(datetimeValuebw, timeValuebw);
                    if (isNaN(datetimeValuebw)) {
                        return false;
                    }

                    if (!filterOperation(operator, item.getTime(),
                        datetimeValue.getTime(), datetimeValuebw.getTime())) {
                        return false;
                    }
                } else {
                    if (!filterOperation(operator, item.getTime(),
                        datetimeValue.getTime())) {
                        return false;
                    }
                }
            } else if (type == "date") {
                // Parse date
                let dateValue = makeDate(value);
                if (isNaN(dateValue)) {
                    return false;
                }
                // Get item date
                let dateItem = new Date(item.getTime());
                dateItem.setHours(0, 0, 0, 0);

                if (valuebw != undefined) {
                    // Parse second date (if present)
                    let dateValuebw = makeDate(valuebw);
                    if (isNaN(dateValuebw)) {
                        return false;
                    }

                    if (!filterOperation(operator, dateItem.getTime(),
                        dateValue.getTime(), dateValuebw.getTime())) {
                        return false;
                    }
                } else {
                    if (!filterOperation(operator, dateItem.getTime(),
                        dateValue.getTime())) {
                        return false;
                    }
                }
            } else if (type == "time") {
                // Parse time
                let timeValue = makeTime(value);
                if (isNaN(timeValue)) {
                    return false;
                }
                // Get item time
                let timeItem = new Date(0, 0, 0, item.getHours(), item.getMinutes(), item.getSeconds());

                if (valuebw != undefined) {
                    // Parse second time (if present)
                    let timeValuebw = makeTime(valuebw);
                    if (isNaN(timeValuebw)) {
                        return false;
                    }

                    if (!filterOperation(operator, timeItem.getTime(),
                        timeValue.getTime(), timeValuebw.getTime())) {
                        return false;
                    }
                } else {
                    if (!filterOperation(operator, timeItem.getTime(),
                        timeValue.getTime())) {
                        return false;
                    }
                }
            } else {
                if (!filterOperation(operator, item, value, valuebw)) {
                    return false;
                }
            }
        }
        return true;
    };

    this.filterData = function (filterValues) {
        for (let dataRow of this.allDataObjects) {

            // Prepare new data
            var newVisibleData = [];
            var newInvisibleData = [];

            // Traverse visible data
            for (let dataObj of dataRow.visibleData) {
                if (this.includeData(dataObj, filterValues)) {
                    newVisibleData.push(dataObj);
                } else {
                    newInvisibleData.push(dataObj);
                }
            }

            // Traverse invisible data
            for (let dataObj of dataRow.invisibleData) {
                if (this.includeData(dataObj, filterValues)) {
                    newVisibleData.push(dataObj);
                } else {
                    newInvisibleData.push(dataObj);
                }
            }

            // Set new arrays
            dataRow.visibleData = newVisibleData;
            dataRow.invisibleData = newInvisibleData;
        }
    };

    this.mergeDataRecords = function (dataVariables) {
        // Convert to 1D array, store information about visibility
        let allDataObjects1D = [];
        for (let dataRow of this.allDataObjects) {
            for (let dataObject of dataRow.visibleData) {
                let obj = {object: dataObject, visible: true};
                allDataObjects1D.push(obj);
            }
            for (let dataObject of dataRow.invisibleData) {
                let obj = {object: dataObject, visible: false};
                allDataObjects1D.push(obj);
            }
        }

        this.allDataObjects = [];
        if (dataVariables.mergeSegmentX != 0 && dataVariables.mergeSegmentZ != 0) {
            // Merge similar data objects by X axis
            allDataObjects1D.sort(function (a, b) {
                return a.object.getItem(dataVariables.indexAxisX) - b.object.getItem(dataVariables.indexAxisX);
            });
            let sortedXDataObjects = [];
            for (let dataObj of allDataObjects1D) {
                let lastDataObj = sortedXDataObjects[sortedXDataObjects.length - 1];
                if (lastDataObj != undefined
                    && Math.floor(lastDataObj[0].object.getItem(dataVariables.indexAxisX) / dataVariables.mergeSegmentX)
                    == Math.floor(dataObj.object.getItem(dataVariables.indexAxisX) / dataVariables.mergeSegmentX)) {
                    lastDataObj.push(dataObj);
                } else {
                    sortedXDataObjects.push([dataObj]);
                }
            }

            // Merge similar data objects by Z axis
            for (let sortedXDataObj of sortedXDataObjects) {
                sortedXDataObj.sort(function (a, b) {
                    return a.object.getItem(dataVariables.indexAxisZ) - b.object.getItem(dataVariables.indexAxisZ);
                });
                for (let dataObj of sortedXDataObj) {
                    let lastDataObj = this.allDataObjects[this.allDataObjects.length - 1];
                    if (lastDataObj != undefined
                        && ((lastDataObj.visibleData.length > 0
                            && Math.floor(lastDataObj.visibleData[0].getItem(dataVariables.indexAxisX) / dataVariables.mergeSegmentX)
                            == Math.floor(dataObj.object.getItem(dataVariables.indexAxisX) / dataVariables.mergeSegmentX)
                            && Math.floor(lastDataObj.visibleData[0].getItem(dataVariables.indexAxisZ) / dataVariables.mergeSegmentZ)
                            == Math.floor(dataObj.object.getItem(dataVariables.indexAxisZ) / dataVariables.mergeSegmentZ))
                            || (lastDataObj.invisibleData.length > 0
                                && Math.floor(lastDataObj.invisibleData[0].getItem(dataVariables.indexAxisX) / dataVariables.mergeSegmentX)
                                == Math.floor(dataObj.object.getItem(dataVariables.indexAxisX) / dataVariables.mergeSegmentX)
                                && Math.floor(lastDataObj.invisibleData[0].getItem(dataVariables.indexAxisZ) / dataVariables.mergeSegmentZ)
                                == Math.floor(dataObj.object.getItem(dataVariables.indexAxisZ) / dataVariables.mergeSegmentZ)))) {
                        if (dataObj.visible) {
                            lastDataObj.visibleData.push(dataObj.object);
                        } else {
                            lastDataObj.invisibleData.push(dataObj.object);
                        }
                    } else {
                        if (dataObj.visible) {
                            let dataRow = {visibleData: [dataObj.object], invisibleData: []};
                            this.allDataObjects.push(dataRow);
                        } else {
                            let dataRow = {visibleData: [], invisibleData: [dataObj.object]};
                            this.allDataObjects.push(dataRow);
                        }
                    }
                }
            }
        } else {
            for (let dataObj of allDataObjects1D) {
                if (dataObj.visible) {
                    let dataRow = {visibleData: [dataObj.object], invisibleData: []};
                    this.allDataObjects.push(dataRow);
                } else {
                    let dataRow = {visibleData: [], invisibleData: [dataObj.object]};
                    this.allDataObjects.push(dataRow);
                }
            }
        }
    };

    this.getTerrainData = function (terrainPlaneVariables, terrainGaussVariables, dataVariables) {
        let terrainData = new Float32Array(terrainPlaneVariables.terrainSegmentsX * terrainPlaneVariables.terrainSegmentsZ);

        if (terrainGaussVariables.varianceGauss != 0 && terrainPlaneVariables.numX != 0 && terrainPlaneVariables.numZ != 0) {
            const m = Math.sqrt(terrainGaussVariables.varianceGauss) * Math.sqrt(2 * Math.PI) * 2 * terrainGaussVariables.varianceGauss;

            for (let dataRow of this.allDataObjects) {
                for (let dataObj of dataRow.visibleData) {
                    let valueX = dataObj.getItem(dataVariables.indexAxisX);
                    let valueY = dataObj.getItem(dataVariables.indexAxisY);
                    let valueZ = dataObj.getItem(dataVariables.indexAxisZ);
                    const sizeValueX = valueX / terrainPlaneVariables.numX * terrainPlaneVariables.terrainSizeX;
                    const sizeValueZ = valueZ / terrainPlaneVariables.numZ * terrainPlaneVariables.terrainSizeZ;
                    const segmentsValueX = valueX / terrainPlaneVariables.numX * (terrainPlaneVariables.terrainSegmentsX - 1);
                    const segmentsValueZ = valueZ / terrainPlaneVariables.numZ * (terrainPlaneVariables.terrainSegmentsZ - 1);

                    // Reverse gaussian
                    let startX = 0;
                    let endX = terrainPlaneVariables.terrainSegmentsX - 1;
                    let startZ = 0;
                    let endZ = terrainPlaneVariables.terrainSegmentsZ - 1;
                    if (terrainGaussVariables.scaleGauss != 0) {
                        const x = Math.sqrt(-Math.log(terrainGaussVariables.thresholdGauss / valueY * m)) / terrainGaussVariables.scaleGauss;
                        const segmentsX = x / terrainPlaneVariables.terrainSizeX * (terrainPlaneVariables.terrainSegmentsX - 1);
                        const segmentsZ = x / terrainPlaneVariables.terrainSizeZ * (terrainPlaneVariables.terrainSegmentsZ - 1);
                        startX = Math.floor(segmentsValueX - segmentsX);
                        startX = Math.max(startX, 0);
                        endX = Math.ceil(segmentsValueX + segmentsX);
                        endX = Math.min(endX, terrainPlaneVariables.terrainSegmentsX - 1);
                        startZ = Math.floor(segmentsValueZ - segmentsZ);
                        startZ = Math.max(startZ, 0);
                        endZ = Math.ceil(segmentsValueZ + segmentsZ);
                        endZ = Math.min(endZ, terrainPlaneVariables.terrainSegmentsZ - 1);
                    }

                    // Update only affected segments
                    for (let k = startZ; k <= endZ; k++) {
                        // Calculate Z distance from segment to size coordinates
                        let distanceZ;
                        if (terrainPlaneVariables.terrainSegmentsZ != 1) {
                            distanceZ = Math.abs(k / (terrainPlaneVariables.terrainSegmentsZ - 1) * terrainPlaneVariables.terrainSizeZ - sizeValueZ);
                        } else {
                            distanceZ = sizeValueZ;
                        }
                        for (let l = startX; l <= endX; l++) {
                            // Calculate X distance from segment to size coordinates
                            let distanceX;
                            if (terrainPlaneVariables.terrainSegmentsX != 1) {
                                distanceX = Math.abs(l / (terrainPlaneVariables.terrainSegmentsX - 1) * terrainPlaneVariables.terrainSizeX - sizeValueX);
                            } else {
                                distanceX = sizeValueX;
                            }

                            // Calculate Gaussian
                            const x = Math.sqrt(distanceX * distanceX + distanceZ * distanceZ);
                            const e = Math.exp(-Math.pow(x * terrainGaussVariables.scaleGauss, 2));
                            terrainData[k * terrainPlaneVariables.terrainSegmentsX + l] += e * valueY / m;
                        }
                    }
                }
            }
        }
        return terrainData;
    };

    this.getTerrainHeight = function (terrainVertices, terrainPlaneVariables, pointX, pointZ) {
        // Find segment points around the pointX and pointZ
        const segmentX = pointX / terrainPlaneVariables.terrainSizeX * (terrainPlaneVariables.terrainSegmentsX - 1);
        const segmentZ = pointZ / terrainPlaneVariables.terrainSizeZ * (terrainPlaneVariables.terrainSegmentsZ - 1);
        const floorSegmentX = Math.floor(segmentX);
        const floorSegmentZ = Math.floor(segmentZ);

        // Determine which triangle (2 triangles form a square) and find points for interpolation
        const point1 = terrainVertices[(floorSegmentZ + 1) * terrainPlaneVariables.terrainSegmentsX + floorSegmentX];
        const point2 = terrainVertices[floorSegmentZ * terrainPlaneVariables.terrainSegmentsX + (floorSegmentX + 1)];
        let point3 = terrainVertices[floorSegmentZ * terrainPlaneVariables.terrainSegmentsX + floorSegmentX];
        if (segmentX - floorSegmentX > 1 - (segmentZ - floorSegmentZ)) {
            point3 = terrainVertices[(floorSegmentZ + 1) * terrainPlaneVariables.terrainSegmentsX + (floorSegmentX + 1)];
        }

        // Change original points because terrain geometry has different axes
        const terrainPointX = pointX - terrainPlaneVariables.terrainSizeX / 2;
        const terrainPointZ = -(pointZ - terrainPlaneVariables.terrainSizeZ / 2);

        // Compute barycentric weights
        const v0 = new THREE.Vector2(point2.x - point1.x, point2.y - point1.y);
        const v1 = new THREE.Vector2(point3.x - point1.x, point3.y - point1.y);
        const v2 = new THREE.Vector2(terrainPointX - point1.x, terrainPointZ - point1.y);
        const d00 = v0.dot(v0);
        const d01 = v0.dot(v1);
        const d11 = v1.dot(v1);
        const d20 = v2.dot(v0);
        const d21 = v2.dot(v1);
        const invDenom = 1.0 / (d00 * d11 - d01 * d01);
        const v = (d11 * d20 - d01 * d21) * invDenom;
        const w = (d00 * d21 - d01 * d20) * invDenom;
        const u = 1.0 - v - w;

        return u * point1.z + v * point2.z + w * point3.z;
    };

    this.calcMinMax = function (terrainData) {
        // Default to 0
        let minMaxValues = {
            max: 0,
            min: 0
        };

        // Traverse all data
        if (terrainData.length > 0) {
            minMaxValues.max = terrainData[0];
            minMaxValues.min = terrainData[0];
            for (let i = 1; i < terrainData.length; i++) {
                let dataValue = terrainData[i];
                minMaxValues.max = Math.max(dataValue, minMaxValues.max);
                minMaxValues.min = Math.min(dataValue, minMaxValues.min);
            }
        }

        return minMaxValues
    };
}
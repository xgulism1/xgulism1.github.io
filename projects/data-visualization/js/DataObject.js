function DataObject(line) {
    this.line = line;
    this.count = line.length;

    this.getItem = function (index) {
        // Substitute item if out of range
        return index >= 0 && index < this.count ? this.line[index] : 1;
    }
}

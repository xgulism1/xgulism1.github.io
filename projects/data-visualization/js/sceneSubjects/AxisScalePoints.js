function AxisScalePoints(sceneMeshes, camera) {
    let lines = [];
    let axisDir;

    function createLine(points) {
        // Create material
        let material = new THREE.LineBasicMaterial();

        let geometry = new THREE.Geometry();
        geometry.vertices.push(
            ...points
        );

        // Create line
        return new THREE.Line(geometry, material);
    }

    this.updatePoints = function (point1, point2, segmentSize) {
        // Remove existing lines
        while (lines.length > 0) {
            sceneMeshes.remove(lines[0]);
            lines.splice(0, 1);
        }

        // Find axis direction
        if (Math.abs(point2.x - point1.x) > Math.abs(point2.y - point1.y)
            && Math.abs(point2.x - point1.x) > Math.abs(point2.z - point1.z)) {
            axisDir = "X";
        } else if (Math.abs(point2.y - point1.y) > Math.abs(point2.z - point1.z)) {
            axisDir = "Y";
        } else {
            axisDir = "Z";
        }

        // Add the lines
        const direction = new THREE.Vector3(point2.x - point1.x, point2.y - point1.y, point2.z - point1.z).normalize();
        const segmentCount = point1.distanceTo(point2) / segmentSize;
        for (let i = 0; i < segmentCount; i++) {
            // Create line
            let line;
            if (axisDir == "X" || axisDir == "Z") {
                line = createLine([new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0)]);
            } else if (axisDir == "Y") {
                line = createLine([new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0)]);
            }

            // Position the line
            line.position.x = point1.x + direction.x * i * segmentSize;
            line.position.y = point1.y + direction.y * i * segmentSize;
            line.position.z = point1.z + direction.z * i * segmentSize;

            // Add mesh to array - to be able to update them
            lines.push(line);
            sceneMeshes.add(line);
        }
    };

    this.updateColor = function (color) {
        for (let line of lines) {
            line.material.color = new THREE.Color(color);
        }
    };

    this.render = function () {
        for (let line of lines) {
            line.lookAt(camera.position);
        }
    }
}
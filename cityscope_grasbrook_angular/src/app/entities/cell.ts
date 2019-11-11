export class GridCell {

    type = BuildingType.building;

    str_speed = 50;
    str_numLanes = 0;
    str_bike = true;
    str_stairs = false;
    str_ramp = false;
    str_elevator = false;

    os_type = OpenSpaceType.green_space;

    bld_numLevels = 1;
    bld_useGround = BuildingUse.commercial;
    bld_useUpper = BuildingUse.residential;

    public static fillGridCellByFeature(gridCell, feature) {
        const properties = feature['properties'];
        for (let property of Object.keys(properties)) {
            if (property !== 'id') {
                if (property == 'height') {
                    gridCell.bld_numLevels = properties['height']
                } else {
                    gridCell[property] = properties[property];
                }
            }
        }
    }

    public static fillFeatureByGridCell(feature, gridCell: GridCell) {
        for (let key of Object.keys(gridCell)) {
            if (key === 'bld_numLevels') {
                feature.properties['height'] = gridCell[key];
            } else if (key === 'type') {
                feature.properties[key] = gridCell[key];
                let color = "";
                if (gridCell[key] === 0) {
                    color = BuildingUse[Object.keys(BuildingUse)[gridCell.bld_useUpper]];
                } else {
                    if (gridCell[key] === 1) {
                        color = '#333333';
                    } else if (gridCell[key] === 2) {
                        color = OpenSpaceType[Object.keys(OpenSpaceType)[gridCell.os_type]];
                    }
                    delete feature.properties["height"];
                }
                feature.properties['changedTypeColor'] = color;
            } else {
                feature.properties[key] = gridCell[key];
            }
        }
    }
}

enum BuildingType {
    building,
    street,
    open_space,
    empty,
}

enum BuildingUse {
    residential = "#FF6E40",
    commercial = "#FF5252",
    office = "#FF4081",
    educational = "#40C4FF",
    culture = "#7C4DFF",
}

enum OpenSpaceType {
    green_space = "#69F0AE",
    promenade = "#48A377",
    athletic_field = "#AFF7D3",
    playground = "#AFF7D3",
    daycare_playground = "#AFF7D3",
    schoolyard = "#AFF7D3",
    exhibition_space = "#A3A5FF",
    recycling_center = "#4D4D4D",
    water = "#9FE1FF"
}
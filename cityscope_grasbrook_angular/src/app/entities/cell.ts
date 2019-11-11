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
        const featureProps = feature['properties'];
        for (let property of Object.keys(featureProps)) {
            if (property !== 'id') {
                if (property == 'height') {
                    gridCell.bld_numLevels = featureProps['height']
                } else {
                    gridCell[property] = featureProps[property];
                }
            }
        }
    }

    public static fillFeatureByGridCell(feature, gridCell: GridCell) {
        for (let gridCellKey of Object.keys(gridCell)) {
            if (gridCellKey === 'bld_numLevels') {
                feature.properties['height'] = gridCell[gridCellKey];
            } else if (gridCellKey === 'type') {
                feature.properties[gridCellKey] = gridCell[gridCellKey];
                let color = "";
                if (gridCell[gridCellKey] === 0) {
                    color = BuildingUse[Object.keys(BuildingUse)[gridCell.bld_useUpper]];
                } else {
                    if (gridCell[gridCellKey] === 1) {
                        color = '#333333';
                    } else if (gridCell[gridCellKey] === 2) {
                        color = OpenSpaceType[Object.keys(OpenSpaceType)[gridCell.os_type]];
                    }
                    delete feature.properties["height"];
                }
                feature.properties['changedTypeColor'] = color;
            } else {
                feature.properties[gridCellKey] = gridCell[gridCellKey];
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
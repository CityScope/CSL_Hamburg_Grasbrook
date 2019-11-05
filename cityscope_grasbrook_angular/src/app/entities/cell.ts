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
        const props = feature['properties'];
        gridCell.bld_numLevels = props['height']
    }

    public static fillFeatureByGridCell(feature, gridCell: GridCell) {
        // TODO: hier müssen auch die farben gesetzt werden
        for (let key of Object.keys(gridCell)) {
            if (key === 'bld_numLevels') {
                feature.properties['height'] = gridCell[key];
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

enum OpenSpaceType {
    green_space,
    promenade,
    athletic_field,
    playground,
    daycare_playground,
    schoolyard,
    exhibition_space,
    recycling_center,
    water
}

enum BuildingUse {
    residential,
    commercial,
    office,
    educational,
    culture
}
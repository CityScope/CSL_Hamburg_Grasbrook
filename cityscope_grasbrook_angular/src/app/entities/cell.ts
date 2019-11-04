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

    public fillGridCellByFeature(feature) {
        const props = feature["properties"];
        this.bld_numLevels = props["height"]
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
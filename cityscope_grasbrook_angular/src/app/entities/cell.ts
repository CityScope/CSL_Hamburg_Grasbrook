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

    static int_of_enum(objn, value)
    {
        let it = 0
        for (var k in objn)
        {
            if(k == value) {
                return it
            }
            it+=1
        }
        return null;
    } 

    public static fillFeatureByCityIOType(feature, typeDict) {
        for (let gridCellKey of Object.keys(typeDict)) {
            if (gridCellKey === 'bld_numLevels') {
                feature.properties['height'] = typeDict[gridCellKey];
            } else if (gridCellKey === 'type') {
                feature.properties[gridCellKey] = BuildingType[typeDict[gridCellKey]];
                if(typeDict[gridCellKey]=="empty"){
                    feature.properties['changedTypeColor'] = "#aaaaaa"
                } else if(typeDict[gridCellKey]=="street") {
                    feature.properties['changedTypeColor'] = "#333333"
                } 
            } else if (gridCellKey === "bld_useUpper") {
                if (typeDict[gridCellKey] != null) {
                    feature.properties['bld_useUpper'] = GridCell.int_of_enum(BuildingUse, typeDict[gridCellKey]);
                    let color = BuildingUse[typeDict[gridCellKey]];
                    feature.properties['changedTypeColor'] = color;
                } else if(typeDict['bld_useGround'] == null) { 
                    console.warn("no bld_useGround and no bld_useUpper -> this should not happen! in cell", feature.properties["id"])
                    feature.properties['changedTypeColor'] = "#aaaaaa"
                } else {
                    // might be a 1-storey building
                    feature.properties['changedTypeColor'] = BuildingUse[typeDict['bld_useGround']];
                }
            } else if (gridCellKey === "bld_useGround") {
                if (typeDict[gridCellKey] != null) {
                    feature.properties['bld_useGround'] = GridCell.int_of_enum(BuildingUse, typeDict[gridCellKey]);
                } else {
                    console.warn("user should not be allowed to set bld_useGround to null! in cell", feature.properties["id"])
                    feature.properties['changedTypeColor'] = "#aaaaaa"
                }
            } else if (gridCellKey === "os_type") {
                feature.properties['os_type'] = GridCell.int_of_enum(OpenSpaceType, typeDict[gridCellKey])
                let color = OpenSpaceType[typeDict[gridCellKey]];
                feature.properties['changedTypeColor'] = color;
            } else {
                feature.properties[gridCellKey] = typeDict[gridCellKey];
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
export enum StationMessages {
    Created = 'station created',
    Update = 'station updated',
    Remove = 'station removed',
    NotFound = 'station NotFound',
    UpdateDesc = 'update station',
    CreatedDesc = 'create new station',
    RemoveDesc = 'remove station by id',
    GetOne = 'get one station by id',
    GetAll = 'get All stations',
    ExistsLocation ="this location is already in use by another station",
    ParentExists = 'just main users can own station'
 }
export enum InventoryMessages {
    Created = 'inventory created',
    Update = 'updated',
    Remove = 'inventory removed',
    NotFound = 'inventory NotFound',
    UpdateDesc = 'update inventory',
    CreatedDesc = 'create new inventory',
    RemoveDesc = 'remove inventory by id',
    GetOne = 'get one inventory by id',
    GetAll = 'get All inventories',
    NoStationId = 'only station users can create new inventory'
}
export enum CapacityMessages {
    Created = 'Capacity created',
    Update = 'updated',
    Remove = 'Capacity removed',
    NotFound = 'Capacity NotFound',
    UpdateDesc = 'update Capacity',
    CreatedDesc = 'create new Capacity',
    RemoveDesc = 'remove Capacity by id',
    GetOne = 'get one Capacity by id',
    GetAll = 'get All Capacity',
    NoStationId = 'only station users can create new Capacity'
}
export enum SaleMessages {
    Created = 'average sale created',
    Update = 'updated',
    Remove = 'average sale removed',
    NotFound = 'average sale NotFound',
    AlreadyExists = 'average sale for this station is already exists use update',
    GetOne = 'get one average sale by id',
    GetAll = 'get All average sales',
    NoStationId = 'only station users can create new average sale'
}
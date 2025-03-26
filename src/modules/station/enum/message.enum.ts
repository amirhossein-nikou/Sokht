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
    ExistsLocation ="this location is already in use by another station"
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
export enum SaleMessages {
    Created = 'average sale created',
    Update = 'updated',
    Remove = 'average sale removed',
    NotFound = 'average sale NotFound',
    GetOne = 'get one average sale by id',
    GetAll = 'get All average sales',
    NoStationId = 'only station users can create new average sale'
}
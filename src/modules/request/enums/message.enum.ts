export enum RequestMessages{
    Create = 'new Request created',
    Notfound = 'Request not found',
    Update =  'Request updated',
    UpdateFailed =  'Request update failed',
    Remove = 'Request removed',
    Approved = 'this request is already approved',
    ApprovedSuccess = 'request approved successfully',
    Received = 'status change to received successfully',
    Licensed = 'this Request already have license',
    AlreadyReceived = 'this Request already have received',
    LicenseSuccess = 'licensed successfully',
    ApprovedFirst = 'please approved your request first',
    LicenseFirst = 'please License your request first'
}
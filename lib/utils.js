"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Status;
(function (Status) {
    Status[Status["Failure"] = 0] = "Failure";
    Status[Status["Success"] = 1] = "Success";
})(Status = exports.Status || (exports.Status = {}));
function getStatus(type) {
    const lowercase_type = type.toLowerCase();
    if (lowercase_type.includes('success')) {
        return Status.Success;
    }
    else if (lowercase_type.includes('fail')) {
        return Status.Failure;
    }
    else {
        throw new Error('Allow words that contain "success" or "fail"');
    }
}
exports.getStatus = getStatus;

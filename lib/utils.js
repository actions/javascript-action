"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Convert status string to number
 * Return 1 (Status.Success) if argument word contains "success"
 * Return 0 (Status.Failure) if argument word contains "fail"
 * @param status {string}
 */
function getStatus(status) {
    const lowercase_status = status.toLowerCase();
    if (lowercase_status.includes('success')) {
        return Status.Success;
    }
    else if (lowercase_status.includes('fail')) {
        return Status.Failure;
    }
    else if (lowercase_status.includes('cancel')) {
        return Status.Cancel;
    }
    else {
        throw new Error('Allow words that contain "success", "fail" or "cancel"');
    }
}
exports.getStatus = getStatus;
/**
 * Job status
 */
var Status;
(function (Status) {
    Status[Status["Failure"] = 0] = "Failure";
    Status[Status["Success"] = 1] = "Success";
    Status[Status["Cancel"] = 2] = "Cancel";
})(Status = exports.Status || (exports.Status = {}));

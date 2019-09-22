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
    else if (lowercase_status === 'always') {
        return Status.Always;
    }
    else {
        throw new Error(`
      The argument includes an unacceptable word.
      "type" parameter allows to include "success", "fail" or "cancel".
      "mention_if" parameter can include "always" in addition to the above.
    `);
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
    Status[Status["Always"] = 3] = "Always";
})(Status = exports.Status || (exports.Status = {}));

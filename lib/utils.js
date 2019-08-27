"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getStatus(status) {
    const lowercase_type = status.toLowerCase();
    if (lowercase_type.includes('success')) {
        return 1;
    }
    else if (lowercase_type.includes('fail')) {
        return 0;
    }
    else {
        throw new Error('Allow words that contain "success" or "fail"');
    }
}
exports.getStatus = getStatus;

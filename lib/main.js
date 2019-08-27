"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const slack_1 = require("./slack");
const utils_1 = require("./utils");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const type = core.getInput('type', { required: true });
            const message = core.getInput('message') || '*The Result of Github Actions*';
            const channel = core.getInput('channel') || '#general';
            const icon_emoji = core.getInput('icon_emoji') || 'github';
            const username = core.getInput('username') || 'Github Actions';
            core.debug('Input variables:\n');
            core.debug(`\tmessage: ${type}`);
            core.debug(`\tmessage: ${message}`);
            core.debug(`\tchannel: ${channel}`);
            core.debug(`\ticon_emoji: ${icon_emoji}`);
            core.debug(`\tusername: ${username}`);
            const slack = new slack_1.Slack(icon_emoji, username, channel);
            const status = utils_1.getStatus(type);
            const result = yield slack.notify(status, message);
            core.debug(`Response from Slack: ${result}`);
        }
        catch (err) {
            core.setFailed(err);
        }
    });
}
run();

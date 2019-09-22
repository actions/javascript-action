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
            const status = utils_1.getStatus(core.getInput('type', { required: true }));
            const job_name = core.getInput('job_name', { required: true });
            const mention = core.getInput('mention');
            const tmp_mention_if = core.getInput('mention_if');
            const username = core.getInput('username');
            const icon_emoji = core.getInput('icon_emoji');
            const channel = core.getInput('channel');
            const url = core.getInput('url') || process.env.SLACK_WEBHOOK || '';
            if (url === '') {
                throw new Error(`
        ERROR: Missing Slack Incoming Webhooks URL.
        Please configure "SLACK_WEBHOOK" as environment variable or
        specify the key called "url" in "with" section.
      `);
            }
            let mention_if;
            if (tmp_mention_if === '') {
                mention_if = utils_1.Status.None;
            }
            else {
                mention_if = utils_1.getStatus(tmp_mention_if);
            }
            const slack = new slack_1.Slack(url, username, icon_emoji, channel);
            const payload = slack.generatePayload(job_name, mention, mention_if, status);
            const result = yield slack.notify(payload);
            core.debug(`Response from Slack: ${JSON.stringify(result)}`);
        }
        catch (err) {
            console.log(err);
            core.setFailed(err.message);
        }
    });
}
run();

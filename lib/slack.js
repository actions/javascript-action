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
const github = __importStar(require("@actions/github"));
const core = __importStar(require("@actions/core"));
const utils_1 = require("./utils");
const webhook_1 = require("@slack/webhook");
class Slack extends webhook_1.IncomingWebhook {
    constructor(url, username, icon_emoji, channel) {
        super(url, { username, icon_emoji, channel });
    }
    /**
     * Get slack blocks UI
     */
    get blocks() {
        const context = github.context;
        const { sha, eventName, workflow, ref } = context;
        const { owner, repo } = context.repo;
        const { number } = context.issue;
        const repo_url = `https://github.com/${owner}/${repo}`;
        let action_url = repo_url;
        if (eventName === 'pull_request') {
            action_url += `/pull/${number}/checks`;
        }
        else {
            action_url += `/commit/${sha}/checks`;
        }
        const blocks = {
            type: 'section',
            fields: [
                { type: 'mrkdwn', text: `*repository*\n<${repo_url}|${owner}/${repo}>` },
                { type: 'mrkdwn', text: `*ref*\n${ref}` },
                { type: 'mrkdwn', text: `*event name*\n${eventName}` },
                { type: 'mrkdwn', text: `*workflow*\n<${action_url}|${workflow}>` },
            ]
        };
        return blocks;
    }
    /**
     * Create mention for slack message
     */
    createMention(mention, mention_if, status) {
        if (mention_if === utils_1.Status.Always || mention_if === status) {
            return mention;
        }
        else {
            return '';
        }
    }
    /**
     * Generate slack payload
     */
    generatePayload(job_name, mention, mention_if, status) {
        if (status === utils_1.Status.Always) {
            throw new Error('"always" cannot be specified with "type" parameter');
        }
        const color = Slack.accessory[status]['color'];
        const mark = Slack.accessory[status]['mark'];
        const result = Slack.accessory[status]['result'];
        const mention_text = this.createMention(mention, mention_if, status);
        let text = `${mark} ${job_name} ${result}`;
        if (mention_text !== '') {
            text += ` <!${mention_text}>`;
        }
        const attachments = {
            color,
            blocks: [this.blocks]
        };
        const payload = {
            text,
            attachments: [attachments],
            unfurl_links: true
        };
        core.debug(`Generated payload for slack: ${JSON.stringify(payload)}`);
        return payload;
    }
    /**
     * Notify information about github actions to Slack
     */
    notify(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.send(payload);
                core.debug('Sent message to Slack');
                return result;
            }
            catch (err) {
                throw err;
            }
        });
    }
}
Slack.accessory = [
    {
        // failure
        color: '#cb2431',
        mark: ':x:',
        result: 'Failed',
    },
    {
        // success
        color: '#2cbe4e',
        mark: ':white_check_mark:',
        result: 'Succeeded',
    },
    {
        // cancel
        color: '#ffc107',
        mark: ':warning:',
        result: 'Canceled',
    }
];
exports.Slack = Slack;

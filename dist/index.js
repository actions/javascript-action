"use strict";

var core = _interopRequireWildcard(require("@actions/core"));

var _utils = require("./utils");

var _MSTeams = require("./MSTeams");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

async function run() {
  try {
    const status = (0, _utils.validateStatus)(core.getInput('type', {
      required: true
    }).toLowerCase());
    const jobName = core.getInput('job_name', {
      required: true
    });
    const url = process.env.MSTEAMS_WEBHOOK || core.getInput('url');
    let mention = core.getInput('mention');
    let mentionCondition = core.getInput('mention_if').toLowerCase();
    const msteamsOptions = {
      username: core.getInput('username'),
      channel: core.getInput('channel'),
      icon_emoji: core.getInput('icon_emoji')
    };
    const commitFlag = core.getInput('commit') === 'true';
    const token = core.getInput('token');

    if (mention && !(0, _utils.isValidCondition)(mentionCondition)) {
      mention = '';
      mentionCondition = '';
      console.warn(`
      Ignore msteams message metion:
      mention_if: ${mentionCondition} is invalid
      `);
    }

    if (url === '') {
      throw new Error(`[Error] Missing MSTeams Incoming Webhooks URL.
      Please configure "MSTEAMS_WEBHOOK" as environment variable or
      specify the key called "url" in "with" section.
      `);
    }

    const msteams = new _MSTeams.MSTeams();
    const payload = await msteams.generatePayload(jobName, status, mention, mentionCondition, commitFlag, token);
    console.info(`Generated payload for msteams: ${JSON.stringify(payload)}`);
    await msteams.notify(url, msteamsOptions, payload);
    console.info('Sent message to MSTeams');
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
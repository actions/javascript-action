import * as core from '@actions/core';
import { Slack } from './slack';
import { getStatus } from './utils';

async function run() {
  try {
    const type: string = core.getInput('type', { required: true });
    const text: string = core.getInput('text') || '*The Result of Github Actions*';
    const channel: string = core.getInput('channel') || '#general';
    const icon_emoji: string = core.getInput('icon_emoji') || 'github';
    const username: string = core.getInput('username') || 'Github Actions';

    core.debug(`Input variables:\n`);
    core.debug(`\ttype: ${type}`);
    core.debug(`\ttext: ${text}`);
    core.debug(`\tchannel: ${channel}`);
    core.debug(`\ticon_emoji: ${icon_emoji}`);
    core.debug(`\tusername: ${username}`);

    const slack = new Slack(icon_emoji, username, channel);
    const status = getStatus(type);
    const result = await slack.notify(status, text);

    core.debug(`Response from Slack: ${result}`);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

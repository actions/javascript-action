import * as core from '@actions/core';
import { Slack } from './slack';

async function run() {
  try {
    const type: string = core.getInput('type', { required: true });
    const message: string = core.getInput('message') || '*The Result of Github Actions*';
    const channel: string = core.getInput('channel') || '#general';
    const icon_emoji: string = core.getInput('icon_emoji') || 'github';
    const username: string = core.getInput('username') || 'Github Actions';

    core.debug('Input variables:\n');
    core.debug(`\tmessage: ${type}`);
    core.debug(`\tmessage: ${message}`);
    core.debug(`\tchannel: ${channel}`);
    core.debug(`\ticon_emoji: ${icon_emoji}`);
    core.debug(`\tusername: ${username}`);

    const slack = new Slack(icon_emoji, username, channel);
    const result = await slack.notify(type, message);

    core.debug(`Response from Slack: ${result}`);

  } catch (err) {
    core.setFailed(err);
  }
}

run();

import * as core from '@actions/core';
import {IncomingWebhookDefaultArguments} from '@slack/webhook';

import {validateStatus, validateMentionCondition} from './utils';
import {Slack} from './slack';

async function run() {
  try {
    const status: string = validateStatus(
      core.getInput('type', {required: true})
    );
    const jobName: string = core.getInput('job_name', {required: true});
    const url: string = process.env.SLACK_WEBHOOK || core.getInput('url');
    let mention: string = core.getInput('mention');
    let mentionCondition: string = core.getInput('mention_if');
    const slackOptions: IncomingWebhookDefaultArguments = {
      username: core.getInput('username'),
      channel: core.getInput('channel'),
      icon_emoji: core.getInput('icon_emoji')
    };

    try {
      mentionCondition = validateMentionCondition(mentionCondition);
    } catch (err) {
      mentionCondition = '';
      console.warn(`Ignore slack message metion: ${err.message}`);
    }

    if (url === '') {
      throw new Error(`[Error] Missing Slack Incoming Webhooks URL.
      Please configure "SLACK_WEBHOOK" as environment variable or
      specify the key called "url" in "with" section.
      `);
    }

    const slack = new Slack();
    const payload = slack.generatePayload(
      jobName,
      status,
      mention,
      mentionCondition
    );
    console.info(`Generated payload for slack: ${JSON.stringify(payload)}`);

    await slack.notify(url, slackOptions, payload);
    console.info('Sent message to Slack');
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();

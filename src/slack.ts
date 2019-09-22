import * as github from '@actions/github';
import * as core from '@actions/core';
import { Status } from './utils';
import { SectionBlock, MessageAttachment } from '@slack/types';
import {
  IncomingWebhook, IncomingWebhookSendArguments,
  IncomingWebhookResult
} from '@slack/webhook';

export class Slack extends IncomingWebhook {
  static readonly accessory: object[] = [
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

  constructor(
    url: string,
    username: string,
    icon_emoji: string,
    channel: string
  ) {
    super(url, {username, icon_emoji, channel});
  }

  /**
   * Get slack blocks UI
   */
  protected get blocks(): SectionBlock {
    const context = github.context;
    const { sha, eventName, workflow, ref } = context;
    const { owner, repo } = context.repo;
    const { number } = context.issue;
    const repo_url: string = `https://github.com/${owner}/${repo}`;
    let action_url: string = repo_url;

    if (eventName === 'pull_request') {
      action_url += `/pull/${number}/checks`
    } else {
      action_url += `/commit/${sha}/checks`;
    }

    const blocks: SectionBlock = {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*repository*\n<${repo_url}|${owner}/${repo}>` },
        { type: 'mrkdwn', text: `*ref*\n${ref}` },
        { type: 'mrkdwn', text: `*event name*\n${eventName}` },
        { type: 'mrkdwn', text: `*workflow*\n<${action_url}|${workflow}>` },
      ]
    }

    return blocks;
  }

  /**
   * Create mention for slack message
   */
  protected createMention(mention: string, mention_if: Status, status: Status): string {
    if (mention_if === Status.Always || mention_if === status) {
      return mention;
    } else {
      return '';
    }
  }

  /**
   * Generate slack payload
   */
  public generatePayload(
    job_name: string,
    mention: string,
    mention_if: Status,
    status: Status
  ): IncomingWebhookSendArguments {

    if (status === Status.Always) {
      throw new Error('"always" cannot be specified with "type" parameter')
    }

    const color: string = Slack.accessory[status]['color'];
    const mark: string = Slack.accessory[status]['mark'];
    const result: string = Slack.accessory[status]['result'];
    const mention_text: string = this.createMention(mention, mention_if, status);
    let text: string = `${mark} ${job_name} ${result}`;

    if (mention_text !== '') {
      text += ` <!${mention_text}>`;
    }

    const attachments: MessageAttachment = {
      color,
      blocks: [this.blocks]
    }

    const payload: IncomingWebhookSendArguments = {
      text,
      attachments: [attachments],
      unfurl_links: true
    }

    core.debug(`Generated payload for slack: ${JSON.stringify(payload)}`);

    return payload;
  }

  /**
   * Notify information about github actions to Slack
   */
  public async notify(payload: IncomingWebhookSendArguments): Promise<IncomingWebhookResult> {
    try {
      const result = await this.send(payload);

      core.debug('Sent message to Slack');

      return result;
    } catch (err) {
      throw err;
    }
  }
}
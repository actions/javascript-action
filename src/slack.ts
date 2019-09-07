import * as github from '@actions/github';
import * as core from '@actions/core';
import { Status } from './utils';
import { SectionBlock, MessageAttachment, MrkdwnElement } from '@slack/types';
import {
  IncomingWebhook, IncomingWebhookSendArguments,
  IncomingWebhookResult
} from '@slack/webhook';

export class Slack extends IncomingWebhook {
  // 0: failure, 1: success
  static readonly color: string[] = ['#cb2431', '#2cbe4e'];
  static readonly mark: string[] = [':x:', ':white_check_mark:']
  static readonly msg: string[] = ['Failure', 'Success']

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
    const repo_url: string = `https://github.com/${owner}/${repo}`;
    const action_url: string = `${repo_url}/commit/${sha}/checks`;

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
   * Generate slack payload
   */
  protected generatePayload(status: Status, msg: string): IncomingWebhookSendArguments {
    const text: string = `${Slack.mark[status]} GitHub Actions ${Slack.msg[status]}`;
    const text_for_blocks: MrkdwnElement = { type: 'mrkdwn', text: msg };
    const blocks: SectionBlock = { ...this.blocks, text: text_for_blocks };
    const attachments: MessageAttachment = {
      color: Slack.color[status],
      blocks: [blocks]
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
  public async notify(status: Status, msg: string): Promise<IncomingWebhookResult> {
    try {
      const payload: IncomingWebhookSendArguments = this.generatePayload(status, msg);
      const result = await this.send(payload);

      core.debug('Sent message to Slack');

      return result;
    } catch (err) {
      throw err;
    }
  }
}
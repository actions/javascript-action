import * as github from '@actions/github';
import Octokit from '@octokit/rest';
import {MessageAttachment, MrkdwnElement} from '@slack/types';
import {
  IncomingWebhook,
  IncomingWebhookSendArguments,
  IncomingWebhookResult,
  IncomingWebhookDefaultArguments
} from '@slack/webhook';
import {Context} from '@actions/github/lib/context';

interface Accessory {
  color: string;
  result: string;
}

class Block {
  readonly context: Context = github.context;

  public get success(): Accessory {
    return {
      color: '#2cbe4e',
      result: 'Succeeded'
    };
  }

  public get failure(): Accessory {
    return {
      color: '#cb2431',
      result: 'Failed'
    };
  }

  public get cancelled(): Accessory {
    return {
      color: '#ffc107',
      result: 'Cancelled'
    };
  }

  public get isPullRequest(): boolean {
    const {eventName} = this.context;
    return eventName === 'pull_request';
  }

  /**
   * Get slack blocks UI
   * @returns {MrkdwnElement[]} blocks
   */
  public get baseFields(): MrkdwnElement[] {
    const {sha, eventName, workflow, ref} = this.context;
    const {owner, repo} = this.context.repo;
    const {number} = this.context.issue;
    const repoUrl: string = `https://github.com/${owner}/${repo}`;
    let actionUrl: string = repoUrl;
    let eventUrl: string = eventName;

    if (this.isPullRequest) {
      eventUrl = `<${repoUrl}/pull/${number}|${eventName}>`;
      actionUrl += `/pull/${number}/checks`;
    } else {
      actionUrl += `/commit/${sha}/checks`;
    }

    const fields: MrkdwnElement[] = [
      {
        type: 'mrkdwn',
        text: `*repository*\n<${repoUrl}|${owner}/${repo}>`
      },
      {
        type: 'mrkdwn',
        text: `*ref*\n${ref}`
      },
      {
        type: 'mrkdwn',
        text: `*event name*\n${eventUrl}`
      },
      {
        type: 'mrkdwn',
        text: `*workflow*\n<${actionUrl}|${workflow}>`
      }
    ];
    return fields;
  }

  /**
   * Get MrkdwnElement fields including git commit data
   * @param {string} token
   * @returns {Promise<MrkdwnElement[]>}
   */
  public async getCommitField(token: string): Promise<MrkdwnElement[]> {
    const {owner, repo} = this.context.repo;
    const {sha} = this.context;
    const options: Octokit.GitGetCommitParams = {
      owner,
      repo,
      commit_sha: sha
    };
    const client: github.GitHub = new github.GitHub(token);
    const {
      data: commit
    }: Octokit.Response<Octokit.ReposGetCommitResponse> = await client.repos.getCommit(
      options
    );
    const authorName: string = commit.author.login;
    const authorUrl: string = commit.author.html_url;
    const commitMsg: string = commit.commit.message;
    const commitUrl: string = commit.html_url;
    const fields: MrkdwnElement[] = [
      {
        type: 'mrkdwn',
        text: `*commit*\n<${commitUrl}|${commitMsg}>`
      },
      {
        type: 'mrkdwn',
        text: `*author*\n<${authorUrl}|${authorName}>`
      }
    ];
    return fields;
  }
}

export class Slack {
  /**
   * Check if message mention is needed
   * @param {string} mentionCondition mention condition
   * @param {string} status job status
   * @returns {boolean}
   */
  private isMention(condition: string, status: string): boolean {
    return condition === 'always' || condition === status;
  }

  /**
   * Generate slack payload
   * @param {string} jobName
   * @param {string} status
   * @param {string} mention
   * @param {string} mentionCondition
   * @returns {IncomingWebhookSendArguments}
   */
  public async generatePayload(
    jobName: string,
    status: string,
    mention: string,
    mentionCondition: string,
    commitFlag: boolean,
    token?: string
  ): Promise<IncomingWebhookSendArguments> {
    const slackBlockUI = new Block();
    const notificationType: Accessory = slackBlockUI[status];
    const tmpText: string = `${jobName} ${notificationType.result}`;
    const text =
      mention && this.isMention(mentionCondition, status)
        ? `<!${mention}> ${tmpText}`
        : tmpText;
    let baseBlock = {
      type: 'section',
      fields: slackBlockUI.baseFields
    };

    if (commitFlag && token) {
      const commitFields: MrkdwnElement[] = await slackBlockUI.getCommitField(
        token
      );
      baseBlock.fields = baseBlock.fields.concat(commitFields);
    }

    const attachments: MessageAttachment = {
      color: notificationType.color,
      blocks: [baseBlock]
    };

    const payload: IncomingWebhookSendArguments = {
      text,
      attachments: [attachments],
      unfurl_links: true
    };

    return payload;
  }

  /**
   * Notify information about github actions to Slack
   * @param {IncomingWebhookSendArguments} payload
   * @returns {Promise<IncomingWebhookResult>} result
   */
  public async notify(
    url: string,
    options: IncomingWebhookDefaultArguments,
    payload: IncomingWebhookSendArguments
  ): Promise<void> {
    const client: IncomingWebhook = new IncomingWebhook(url, options);
    const response: IncomingWebhookResult = await client.send(payload);

    if (response.text !== 'ok') {
      throw new Error(`
      Failed to send notification to Slack
      Response: ${response.text}
      `);
    }
  }
}

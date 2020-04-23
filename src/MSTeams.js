import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import { IncomingWebhook } from 'ms-teams-webhook';

class Block {
	constructor() {
		this.context = github.context;
	}

	get success() {
		return {
			color: '#2cbe4e',
			result: 'Succeeded'
		};
	}

	get failure() {
		return {
			color: '#cb2431',
			result: 'Failed'
		};
	}

	get cancelled() {
		return {
			color: '#ffc107',
			result: 'Cancelled'
		};
	}

	get isPullRequest() {
		const { eventName } = this.context;
		return eventName === 'pull_request';
	}

	/**
	 * Get msteams blocks UI
	 * @returns {MrkdwnElement[]} blocks
	 */
	get baseFields() {
		const { sha, eventName, workflow, ref } = this.context;
		const { owner, repo } = this.context.repo;
		const { number } = this.context.issue;
		const repoUrl = `https://github.com/${owner}/${repo}`;
		let actionUrl = repoUrl;
		let eventUrl = eventName;

		if (this.isPullRequest) {
			eventUrl = `<${repoUrl}/pull/${number}|${eventName}>`;
			actionUrl += `/pull/${number}/checks`;
		} else {
			actionUrl += `/commit/${sha}/checks`;
		}

		return [
			{
				"name": `*repository*`,
				"value": `<${repoUrl}|${owner}/${repo}>`
			}, {
				"name": `*ref*`,
				"value": `${ref}`
			}, {
				"name": `*event name*`,
				"value": `${eventUrl}`
			},{
				"name": `*workflow*`,
				"value": `<${actionUrl}|${workflow}>`
			}
		];
	}

	/**
	 * Get MrkdwnElement fields including git commit data
	 * @param {string} token
	 * @returns {Promise<MrkdwnElement[]>}
	 */
	async getCommitFields(token) {
		const { owner, repo } = this.context.repo;
		const head_ref = process.env.GITHUB_HEAD_REF;
		const ref = this.isPullRequest
			? head_ref.replace(/refs\/heads\//, '')
			: this.context.sha;
		const client = new Octokit({ auth: token });
		const { data: commit } = await client.repos.getCommit({ owner, repo, ref });

		const commitMsg = commit.commit.message.split('\n')[0];
		const commitUrl = commit.html_url;
		const fields = [
			{
				type: 'mrkdwn',
				text: `*commit*\n<${commitUrl}|${commitMsg}>`
			}
		];

		if (commit.author) {
			const authorName = commit.author.login;
			const authorUrl = commit.author.html_url;
			fields.push({
				type: 'mrkdwn',
				text: `*author*\n<${authorUrl}|${authorName}>`
			});
		}
		return fields;
	}
}

export class MSTeams {
	/**
	 * Check if message mention is needed
	 * @param condition
	 * @param {string} status job status
	 * @returns {boolean}
	 */
	isMention(condition, status) {
		return condition === 'always' || condition === status;
	}

	/**
	 * Generate msteams payload
	 * @param {string} jobName
	 * @param {string} status
	 * @param {string} mention
	 * @param {string} mentionCondition
	 * @param commitFlag
	 * @param token
	 * @returns
	 */
	async generatePayload(
		jobName,
		status,
		mention,
		mentionCondition,
		commitFlag,
		token
	) {
		const msteamsBlockUI = new Block();
		const notificationType = msteamsBlockUI[status];
		const tmpText = `${jobName} ${notificationType.result}`;
		const text =
			mention && this.isMention(mentionCondition, status)
				? `<!${mention}> ${tmpText}`
				: tmpText;
		let baseBlock = {
			type: 'section',
			fields: msteamsBlockUI.baseFields,
			"activityTitle": "![TestImage](https://47a92947.ngrok.io/Content/Images/default.png)Larry Bryant created a new task",
			"activitySubtitle": "On Project Tango",
			"activityImage": "https://teamsnodesample.azurewebsites.net/static/img/image5.png",
			"facts": msteamsBlockUI.baseFields,
			"markdown": true
		};

		if (commitFlag && token) {
			const commitFields = await msteamsBlockUI.getCommitFields(
				token
			);
			Array.prototype.push.apply(baseBlock.fields, commitFields);
		}

		const attachments = {
			color: notificationType.color,
			blocks: [baseBlock]
		};

		return {
			"@type": "MessageCard",
			"@context": "http://schema.org/extensions",
			// text,
			// attachments: [attachments],
			// unfurl_links: true,
			"themeColor": notificationType.color,
			"summary": text,
			"sections": [baseBlock],
			"potentialAction": [{
				"@type": "ActionCard",
				"name": "Add a comment",
				"inputs": [{
					"@type": "TextInput",
					"id": "comment",
					"isMultiline": false,
					"title": "Add a comment here for this task"
				}],
				"actions": [{
					"@type": "HttpPOST",
					"name": "Add comment",
					"target": "http://..."
				}]
			}, {
				"@type": "ActionCard",
				"name": "Set due date",
				"inputs": [{
					"@type": "DateInput",
					"id": "dueDate",
					"title": "Enter a due date for this task"
				}],
				"actions": [{
					"@type": "HttpPOST",
					"name": "Save",
					"target": "http://..."
				}]
			}, {
				"@type": "ActionCard",
				"name": "Change status",
				"inputs": [{
					"@type": "MultichoiceInput",
					"id": "list",
					"title": "Select a status",
					"isMultiSelect": "false",
					"choices": [{
						"display": "In Progress",
						"value": "1"
					}, {
						"display": "Active",
						"value": "2"
					}, {
						"display": "Closed",
						"value": "3"
					}]
				}],
				"actions": [{
					"@type": "HttpPOST",
					"name": "Save",
					"target": "http://..."
				}]
			}]
		}
	}

	/**
	 * Notify information about github actions to MSTeams
	 * @param url
	 * @param options
	 * @param  payload
	 * @returns {Promise} result
	 */
	async notify(
		url,
		options,
		payload
	) {
		const client = new IncomingWebhook(url, options);
		const response = await client.send(payload);

		if (response.text !== 'ok') {
			throw new Error(`
      Failed to send notification to MSTeams
      Response: ${response.text}
      `);
		}
	}
}

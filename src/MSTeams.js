import {context as github} from '@actions/github';
import { Octokit } from '@octokit/rest';
import { IncomingWebhook } from 'ms-teams-webhook';
import * as core from '@actions/core';


class Block {
	constructor() {
		this.context = github;
	}

	get success() {
		return {
			icon:  '✓',
			color: '#2cbe4e',
			result: 'Succeeded!'
		};
	}

	get failure() {
		return {
			icon:  '✗',
			color: '#cb2431',
			result: 'Failed'
		};
	}

	get cancelled() {
		return {
			icon: 'o',
			color: '#ffc107',
			result: 'Cancelled'
		};
	}

	get skipped() {
		return {
			icon: '⤼',
			color: '#1a6aff',
			result: 'Skipped'
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
				"name": `Repository*`,
				"value": `<${repoUrl}|${owner}/${repo}>`
			}, {
				"name": `ref*`,
				"value": `${ref}`
			}, {
				"name": `*event name*`,
				"value": `${eventUrl}`
			}, {
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
		token,
		{
			job,
			steps,
			needs
		}
	) {
		const msteamsBlockUI = new Block();
		const notificationType = msteamsBlockUI[status];
		// const tmpText = `${jobName} ${notificationType.result}`;
		// const text =
		// 	mention && this.isMention(mentionCondition, status)
		// 		? `<!${mention}> ${tmpText}`
		// 		: tmpText;
		// let baseBlock = {
		// 	type: 'section',
			// fields: msteamsBlockUI.baseFields,
			// "activityTitle": `${github.sender.login} ${github.event.name} initialised workflow ${github.event.workflow}`,
			// "activitySubtitle": github.repository,
			// "activityImage": github.sender.avatar_url,
			// "facts": msteamsBlockUI.baseFields,
			// "markdown": true
		// };

		// if (commitFlag && token) {
		// 	const commitFields = await msteamsBlockUI.getCommitFields(
		// 		token
		// 	);
		// 	Array.prototype.push.apply(baseBlock.fields, commitFields);
		// }

		// const attachments = {
		// 	color: notificationType.color,
		// 	blocks: [baseBlock]
		// };

		const get_result_mark = result => result === 'success' ? '✓' : result === 'failure' ? '✗' : result === 'skipped' ? '⤼' : 'o';

		const steps_sections = Object.keys(steps).map(step_id => {
			const r = {
				title: `${get_result_mark(steps[step_id].outcome)} ${step_id}`,
			};
			if (steps[step_id].result === 'failure') {
				const outputs = steps[step_id].outputs;
				r.text = Object.keys(outputs).reduce(output_name => `+ ${output_name}:${'\n'}\`\`\`${outputs[output_name]}\`\`\``, '')
			}
		});
		if (steps_sections.length) {
			steps_sections[0].startGroup = true;
		}

		const needs_sections = Object.keys(needs).map(job_id => {
			const r = {
				title: `${get_result_mark(needs[job_id].result)} ${job_id}`,
			};
			if (needs[job_id].result === 'failure') {
				const outputs = needs[job_id].outputs;
				r.text = Object.keys(outputs).reduce(output_name => `+ ${output_name}:${'\n'}\`\`\`${outputs[output_name]}\`\`\``, '')
			}
		});
		if (needs_sections.length) {
			needs_sections[0].startGroup = true;
		}

		let bold_result;
		switch (job.status) {
			case 'success':
				bold_result = {
					"activityTitle": "Success!",
					"activitySubtitle": github.event.head_commit.timestamp,
					"activityImage": "https://www.iconninja.com/yes-circle-mark-check-correct-tick-success-icon-459"
				};
				break;
			case 'failure':
				bold_result = {
					"activityTitle": "Failure",
					"activitySubtitle": github.event.head_commit.timestamp,
					"activityImage": "https://www.iconninja.com/files/306/928/885/invalid-circle-close-delete-cross-x-incorrect-icon.png"
				};
				break;
			case 'cancelled':
				bold_result = {
					"activityTitle": "Cancelled",
					"activitySubtitle": github.event.head_commit.timestamp,
					"activityImage": "https://www.iconninja.com/files/453/139/634/cancel-icon.png"
				};
				break;
		}

		core.info(github);
		return {
			"@type": "MessageCard",
			"@context": "http://schema.org/extensions",
			"themeColor": notificationType.color,
			"title": `[${github.sender.login}](${github.sender.url}) [${github.event.name}](${github.event.compare}) initialised workflow [${github.event.workflow}](${github.event.repository.html_url}/actions?query=workflow%3A${github.event.workflow}})`,
			"summary": `[${github.repository}](${github.event.repository.html_url})`,
			"text": `Changelog:${github.event.commits.reduce(c => '\n+ ' + c.message, '')}`,
			"sections": [
				...steps_sections,
				...needs_sections,
				bold_result
			],
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

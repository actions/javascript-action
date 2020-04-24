const { IncomingWebhook } = require('ms-teams-webhook');
const { context: github } = require('@actions/github');
const { merge } = require('lodash.merge');

class Status {
	constructor(status) {
		return this[status]
	}
	get success() {
		return {
			icon: '✓',
			color: '#2cbe4e',
			"activityTitle": "Success!",
			"activitySubtitle": github.event.head_commit.timestamp,
			"activityImage": "https://www.iconninja.com/yes-circle-mark-check-correct-tick-success-icon-459"
		};
	}
	get failure() {
		return {
			icon: '✗',
			color: '#cb2431',
			"activityTitle": "Failure",
			"activitySubtitle": github.event.head_commit.timestamp,
			"activityImage": "https://www.iconninja.com/files/306/928/885/invalid-circle-close-delete-cross-x-incorrect-icon.png"
		};
	}
	get cancelled() {
		return {
			icon: 'o',
			color: '#ffc107',
			"activityTitle": "Cancelled",
			"activitySubtitle": github.event.head_commit.timestamp,
			"activityImage": "https://www.iconninja.com/files/453/139/634/cancel-icon.png"
		};
	}
	get skipped() {
		return {
			icon: '⤼',
			color: '#1a6aff',
			activityTitle: 'Skipped'
		};
	}
	get unknown() {
		return {
			icon: '?',
			color: '#1a6aff',
			activityTitle: 'No job context has been provided'
		};
	}
}

const workflow_link = `[${github.payload.workflow}](${github.payload.repository.html_url}/actions?query=workflow%3A${github.payload.workflow}})`;
const payload_link = `[${github.payload.name}](${github.payload.compare})`;
const sender_link = `[${github.payload.sender.login}](${github.payload.sender.url})`;
const repository_link = `[${github.payload.repository}](${github.payload.repository.html_url})`;
const changelog = `Changelog:${github.payload.commits.reduce(c => '\n+ ' + c.message, '')}`;
const summary_generator = (obj, status_key) => {
		const obj_sections = Object.keys(obj).map(step_id => {
			const status = obj[step_id][status_key];
			const r = {
				title: `${Status[status].icon} ${step_id}`,
			};
			if (status === 'failure') {
				r.text = this.outputs2markdown(obj[step_id].outputs)
			}
		});
		if (obj_sections.length) {
			obj_sections[0].startGroup = true;
		}
		return obj_sections
};

class MSTeams {
	outputs2markdown(outputs) {
		return Object.keys(outputs).reduce(output_name => `+ ${output_name}:${'\n'}\`\`\`${outputs[output_name]}\`\`\``, '')
	}

	/**
	 * Generate msteams payload
	 * @param {string} jobName
	 * @returns
	 */
	async generatePayload(
		{
			job = { status: 'unknown'},
			steps = {},
			needs = {},
			overwrite = ''
		}
	) {
		const steps_summary = summary_generator(steps,'outcome');
		const needs_summary = summary_generator(needs,'result');
		const status_summary = Status[job.status];

		return merge(
			{
				"@type": "MessageCard",
				"@context": "http://schema.org/extensions",
				themeColor: status_summary.color,
				title: `${sender_link} ${payload_link} initialised workflow ${workflow_link}`,
				summary: repository_link,
				text: changelog,
				sections: [
					...steps_summary,
					...needs_summary,
					status_summary
				]
			},
			eval(overwrite)
		)
	}

	/**
	 * Notify information about github actions to MSTeams
	 * @param url
	 * @param  payload
	 * @returns {Promise} result
	 */
	async notify(
		url,
		payload
	) {
		const client = new IncomingWebhook(url);
		const response = await client.send(payload);

		if (response.text !== 'ok') {
			throw new Error(`Failed to send notification to MSTeams.\nResponse: ${response}`);
		}
	}
}

module.exports = MSTeams;
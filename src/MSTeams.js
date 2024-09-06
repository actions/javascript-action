const {IncomingWebhook} = require('ms-teams-webhook');
const {context: github} = require('@actions/github');
const core = require('@actions/core');

const placeholder = '';
const {
  payload: {
    repository = {
      html_url: placeholder,
      name: placeholder
    },
    compare,
    sender = {
      login: placeholder,
      url: placeholder
    },
    commits = [],
    head_commit = {
      timestamp: placeholder
    }
  },
  eventName,
  workflow
} = github;

const statuses = [{
  id: 'success',
  icon: '✓',
  activityTitle: 'Success!',
  activitySubtitle: head_commit.timestamp,
  activityImage: 'https://raw.githubusercontent.com/Skitionek/notify-microsoft-teams/master/icons/success.png'

}, {
  id: 'failure',
  icon: '✗',
  activityTitle: 'Failure',
  activitySubtitle: head_commit.timestamp,
  activityImage: 'https://raw.githubusercontent.com/Skitionek/notify-microsoft-teams/master/icons/failure.png'

}, {
  id: 'cancelled',
  icon: 'o',
  activityTitle: 'Cancelled',
  activitySubtitle: head_commit.timestamp,
  activityImage: 'https://raw.githubusercontent.com/Skitionek/notify-microsoft-teams/master/icons/cancelled.png'
}, {
  id: 'skipped',
  icon: '⤼',
  activityTitle: 'Skipped',
  activitySubtitle: head_commit.timestamp,
  activityImage: 'https://raw.githubusercontent.com/Skitionek/notify-microsoft-teams/master/icons/skipped.png'
}, {
  id: 'unknown',
  icon: '?',
  activityTitle: 'No job context has been provided',
  activitySubtitle: head_commit.timestamp,
  activityImage: 'https://raw.githubusercontent.com/Skitionek/notify-microsoft-teams/master/icons/unknown.png'
}];

function Status(status) {
  if (!status) {
    core.error(`Unknown status value: ${status}`);
    return statuses.find(({id}) => id === 'unknown');
  }
  const r = statuses.find(({id}) => id === status.toLowerCase());
  if (!r) {
    core.error(`Not implemented status value: ${status}`);
    return statuses.find(({id}) => id === 'unknown');
  }
  return r;
}

const repository_link = `[${repository.full_name}](${repository.html_url})`;
const changelog = commits.length ? `**Changelog:**${commits.reduce((o, c) => console.dir(c) || o + '\n+ ' + c.message, '\n')}` : undefined;
const outputs2markdown = (outputs) => Object.keys(outputs).reduce((o, output_name) => o + `+ ${output_name}:${'\n'}\`\`\`${outputs[output_name]}\`\`\``, '');

const truncateString = (str, maxLength) => {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 3) + '...';
  }
  return str;
};

const summary_generator = (obj, status_key) => {
  const r = {
    type: 'FactSet',
    facts: []
  };
  Object.keys(obj).forEach(step_id => {
    const status = Status(obj[step_id][status_key]);
    r.facts.push({
      title: `${status.icon} ${truncateString(step_id, 15)}`,
      value: status.activityTitle
    });
    if (status.id === 'failure' && obj[step_id].outputs.length) {
      let text = `${step_id}:\n`;
      text += outputs2markdown(obj[step_id].outputs);
      if (text !== '')
        r.facts.push = ({
          type: 'TextBlock',
          text: text
        });
    }
  });
  if (!r.facts.length) return [];
  return [r];
};

const emailsToText = (emails) => {
  if (!emails || !emails.length)
    return '';

  return emails.map(email => `<at>${email}</at>`)
    .reduce((previous, current) => `${previous} ${current}`);
};

const emailsToMsTeamsEntities = (emails) => {
  return emails.map((email) => {
    return {
      type: 'mention',
      text: `<at>${email}</at>`,
      mentioned: {
        id: email,
        name: email
      }
    };
  });
};

const statusSummary = (job) => {
  const {
    activityTitle, activitySubtitle, activityImage, color
  } = Status(job.status);
  return [
    {
      type: 'ColumnSet',
      columns: [
        {
          type: 'Column',
          items: [
            {
              type: 'Image',
              style: 'person',
              url: activityImage,
              altText: 'Result',
              size: 'small'
            }
          ],
          width: 'auto'
        },
        {
          type: 'Column',
          items: [
            {
              type: 'TextBlock',
              weight: 'bolder',
              text: activityTitle
            },
            {
              type: 'TextBlock',
              text: activitySubtitle
            }
          ],
          width: 'stretch'
        }
      ]
    }
  ];
};

const csvToArray = (csv) => {
  return csv.replaceAll(' ', '').split(',');
};

class MSTeams {
  /**
   * Generate msteams payload
   * @param job
   * @param steps
   * @param needs
   * @param title {string} msteams message title
   * @param msteams_emails {string} msteams emails in CSV
   * @return
   */
  async generatePayload({
                          job = {status: 'unknown'},
                          steps = {},
                          needs = {},
                          title = '',
                          msteams_emails = ''
                        }) {
    const steps_summary = summary_generator(steps, 'outcome');
    const needs_summary = summary_generator(needs, 'result');
    const status_summary = statusSummary(job);

    const commitChangeLog = changelog ?
      [
        {
          type: 'TextBlock',
          weight: 'lighter',
          text: changelog,
          wrap: true
        }
      ] : [];

    const mentionedIds = msteams_emails.length > 1 ?
      [{
        type: 'TextBlock',
        text: emailsToText(csvToArray(msteams_emails)),
        wrap: true
      }] : [];

    const headerTitle = {
      type: 'TextBlock',
      size: 'Medium',
      weight: 'Bolder',
      text: title !== '' ? title : `${sender.login} ${eventName} initialised workflow"${workflow}"`,
      style: 'heading',
      wrap: true
    };

    const repositoryLink = {
      type: 'TextBlock',
      size: 'Medium',
      weight: 'lighter',
      text: repository_link
    };

    const actionLinks = {
      type: 'ActionSet',
      actions: [
        {
          type: 'Action.OpenUrl',
          title: 'Repository',
          url: repository.html_url
        },
        {
          type: 'Action.OpenUrl',
          title: 'Compare',
          url: compare
        }
      ]
    };

    const entities = msteams_emails.length > 0 ? emailsToMsTeamsEntities(csvToArray(msteams_emails)) : [{}];

    return {
      'type': 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          body: [
            headerTitle,
            repositoryLink,
            ...commitChangeLog,
            ...steps_summary,
            ...needs_summary,
            ...status_summary,
            actionLinks,
            ...mentionedIds
          ],
          '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
          version: '1.5',
          msteams: {
            entities: entities
          }
        }
      }]
    };
  }

  /**
   * Notify information about github actions to MSTeams
   * @param url
   * @param  payload
   * @returns {Promise} result
   */
  async notify(url, payload) {
    const client = new IncomingWebhook(url);
    const response = await client.send(payload);

    if (!response.text) {
      throw new Error('Failed to send notification to Microsoft Teams.\n' + 'Response:\n' + JSON.stringify(response, null, 2));
    }
  }
}

module.exports = MSTeams;
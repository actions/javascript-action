# Create a JavaScript Action

:rocket: Use this template to bootstrap the creation of a JavaScript action with tests, linting, a validation workflow and publishing.

## Create an action from this template

Click the `Use this Template` and provide the new repo details for your action

## Code in Master

```bash
$ npm install
```

```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

## Change actions.yml

The actions.yml contains defines the inputs and output for your action.

Update the actions.yml with your name, description, inputs and outputs for your action.

See the [documentation](https://help.github.com/en/articles/metadata-syntax-for-github-actions)

## Change the Code

Most toolkit and CI/CD operations involve async operations so the action is run in an async function.

```javascript
const core = require('@actions/core');
...

async function run() {
  try { 
      ...
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
```

See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

## Publish to a distribution branch

Comment out node_modules in .gitignore
```bash
# Dependency directories
# node_modules/
```

```bash
$ git checkout -b releases/v1
```

```bash
$ npm prune --production
```

## Usage:

The uses path will be the org and repo where you create your action

```yaml
uses: actions/javascript-action@v1
with:
  milliseconds: 1000
```




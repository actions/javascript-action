"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const core = require('@actions/core');
const github = require('@actions/github');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const myInput = core.getInput('myInput');
            core.debug(`Hello ${myInput} from inside a container`);
            // Get github context data
            const context = github.context;
            console.log(`We can even get context data, like the repo: ${context.repo.repo}`);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();

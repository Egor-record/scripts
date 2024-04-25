#!/usr/bin/env node
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');


const Tests = {
  checkVue(stagedFiles) {
    const vueFiles = stagedFiles.filter(filename => filename.endsWith('.vue'));
    const tests = {
          hasStyleTag({ data }) {
            const styleTagRegex = /<style\b[^>]*>(.*?)<\/style>/gs;
            return styleTagRegex.test(data);
          },
          fileNameWithSmallLetter({filename}) {
            const lowerCaseRegex = /^[a-z]/;
            return lowerCaseRegex.test(filename);
          }
    }
    const log = (fn, errMessage) => {
          if (fn) {
            console.error("FAIL: ", errMessage)
          } 
    }
    vueFiles.forEach(filename => {
      const filePath = path.resolve(filename);
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
                console.error(`Error reading file ${filePath}: ${err.message}`);
                return;
        }
        for (const testName in tests) {
          if (tests.hasOwnProperty(testName) && typeof tests[testName] === 'function') {
              log(tests[testName]({ data, filename }), `${filename}, ${testName}`)
            }
          }
        });
    });
  }
}



// Execute the git diff command
exec('git diff --cached --name-only', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing git diff: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Error: ${stderr}`);
    return;
  }

  // Parse the output to obtain the list of staged files
  const stagedFiles = stdout.trim().split('\n');


  for (const testName in Tests) {
      if (Tests.hasOwnProperty(testName) && typeof Tests[testName] === 'function') {
        Tests[testName](stagedFiles)
     }
   }


});
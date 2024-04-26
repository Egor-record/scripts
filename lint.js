#!/usr/bin/env node
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');


const Tests = {
  checkVue(stagedFiles) {
    const vueFiles = stagedFiles.filter(filename => filename.endsWith('.vue'));
    const log = (failed, errMessage) => failed ? console.error("FAIL: ", errMessage) : console.log("OK");
    const tests = {
      hasStyleTag({ content }) {
        const styleTagRegex = /<style\b[^>]*>(.*?)<\/style>/gs;
        return styleTagRegex.test(content);
      },
      hasNoComponentName({ content }) {
        const exportDefaultRegex = /export\s+default\s+\{\s*name:\s*'[^']+'/;
        return !exportDefaultRegex.test(content);
      },
      fileNameWithSmallLetter({filename}) {
        const parts = filename.split('/');
        const extractedFilename = parts[parts.length - 1];
        const lowerCaseRegex = /^[a-z]/;
        return lowerCaseRegex.test(extractedFilename);
      },
    }
    const runTest = () => {
        const fileReadPromises = vueFiles.map(filename => {
            const filePath = path.resolve(filename);
            return new Promise((resolve, reject) => {
               return fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                  console.error(`Error reading file ${filename}:`, err);
                  reject()
                }
                resolve(data)
              });
            })
        
        });

        Promise.all(fileReadPromises).then(fileContents => {
            fileContents.forEach((content, index) => {
              for (const testName in tests) {
                if (tests.hasOwnProperty(testName) && typeof tests[testName] === 'function') {
                  log(tests[testName]({ content, filename: vueFiles[index]  }), `${vueFiles[index]}, ${testName}`)
                }
              }
        
            });
          })
          .catch(error => {
            // Handle errors here
            console.error('Error reading files:', error);
        });

      }
    runTest()
  },
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
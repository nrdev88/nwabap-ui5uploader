const execa = require('execa');
const anymatch = require('anymatch');

/**
 * Find files tracked by git, that were changed from certain commit till now
 * @public
 * @param {string} sBase Base folder
 * @param {string} sCommit Commit to compare working tree with
 * @param {string} sPatterns Glob pattern to filter files
 * @returns {array} List of files
 */
function diff(sBase, sCommit, sPatterns) {
    const result = [];

    try {
        execa.sync('git', ['add', sBase]);
    } catch(e) {
    }

    const { stdout } = execa.sync('git', ['diff', sCommit, '-r', '--name-status', '--no-renames']);

    execa.commandSync('git reset HEAD');
    
    stdout.split('\n').forEach(line => {
        const [, sFile] = line.split('\t');
        if (anymatch(sPatterns, sFile)) {
            result.push(sFile);
        }
    });

    return result;
}

module.exports.diff = diff;

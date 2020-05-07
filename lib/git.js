const execa = require('execa');

/**
 * Find files tracked by git, that were changed from certain commit till now
 * @public
 * @param {string} sBase Base folder
 * @param {string} sPatterns Glob pattern to filter files
 * @param {string} sCommit Commit to compare working tree with
 * @param {string} bUnstaged Include unstaged files
 * @returns {array} List of files
 */
function diff(sBase, sPatterns, sCommit, bUnstaged) {
    const oFiles = new Set();
    let sPath = `${ sBase }/${ sPatterns }`;

    if (bUnstaged) {
        const { stdout } = execa.sync('git', ['status', '--short', '-u', sPath]);
        
        if (stdout) {
            stdout.split('\n').forEach(sLine => {
                const sUnstaged = sLine[1];
                const sFile = sLine.substring(3);
                if (sUnstaged !== ' ') {
                    oFiles.add(sFile);
                }
            });
        }
    }

    const { stdout } = execa.sync('git', ['diff', '-r', '--name-status', '--no-renames', sCommit, sPath]);

    if (stdout) {
        stdout.split('\n').forEach(sLine => {
            const [, sFile] = sLine.split('\t');
            oFiles.add(sFile);
        });
    }

    return [...oFiles];
}

module.exports.diff = diff;

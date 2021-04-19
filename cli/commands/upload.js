"use strict";
const program = require('commander');
const colors = require('ansi-colors');
const fs = require('fs');
const FileStore = require('../../lib/filestore');
const git = require('../../lib/git');
const glob = require('fast-glob');

function UploadCommand() {
    return program
        .command('upload')
        .description('upload some files to SAP')
        .option("--conn_server <conn_server>", "SAP host")
        .option("--conn_user <conn_user>", "SAP user")
        .option("--conn_password <conn_password>", "SAP password")
        .option("--conn_client <conn_client>", "Optional parameter to specify the client (transferred as sap-client URL parameter). In case the option is not specified the default client is used if specified.")
        .option("--conn_usestrictssl <conn_usestrictssl>", "Default: true. SSL mode handling. In case of self signed certificates the useStrictSSL mode option can be set to false to allow an upload of files.")
        .option("--base <base>", "Base dir")
        .option("--files <files>", "Files to upload (relative from basedir)")
        .option("--abap_transport <abap_transport>", "ABAP transport no.")
        .option("--abap_package <abap_package>", "ABAP package name")
        .option("--abap_bsp <abap_bsp>", "ABAP BSP container ID")
        .option("--abap_bsp_text <abap_bsp_text>", "ABAP BSP container name")
        .option("--abap_language <abap_language>", "ABAP language")
        .option("--calcappindex <calcappindex>", "Re-calculate application index")
        .option("--git_diff_commit", "Optional git commit, branch or reference to compare current state with. Will only upload files that were somehow changed (added, modified or deleted) since specified state.")
        .option("--git_diff_unstaged", "Include unstaged files in git diff.")
        .option("--preserve_unselected", "Don't delete files from BSP container, that were not selected to upload. Useful when using git_diff_commit option to keep unchanged files untouched.")
        .option("--nwabaprc <nwabaprc>", "Free naming of which .nwabaprc file to use")
        .action(function (_options) {
            const options = {
                conn_server: "",
                conn_user: "",
                conn_password: "",
                conn_client: "",
                conn_usestrictssl: true,
                base: "",
                files: "**",
                abap_transport: "",
                abap_package: "",
                abap_bsp: "",
                abap_bsp_text: "",
                abap_language: "EN",
                calcappindex: false,
                git_diff_commit: "",
                git_diff_unstaged: false,
                preserve_unselected: false,
                files_start_with_dot : false
            };

            if (fs.existsSync(_options.nwabaprc)) {
                console.log(`Using file ${_options.nwabaprc}`)
                Object.assign(options, JSON.parse(fs.readFileSync(_options.nwabaprc.toString(), 'utf8')));
            }
            else if (fs.existsSync('.nwabaprc')) {
                Object.assign(options, JSON.parse(fs.readFileSync('.nwabaprc', 'utf8')));
            }

            Object.keys(options).map(key => {
                if (_options[key] !== undefined) {
                    options[key] = _options[key];
                }
            });

            // Validation
            const validation = {
                errors: [],
                warnings: [],
                information: []
            };

            if (!options.base || !options.files) {
                validation.errors.push('Define both the base dir and files.');
            }

            if (!options.conn_user || !options.conn_password) {
                validation.errors.push('Define both a username and password.');
            }

            if (!options.abap_package || !options.abap_bsp || !options.abap_bsp_text) {
                validation.errors.push('ABAP options not fully specified (check package, BSP container, BSP container text information).');
            }

            // Check for length > 15 excluding /PREFIX/
            if (options.abap_bsp && options.abap_bsp.substring(options.abap_bsp.lastIndexOf('/') + 1).length > 15) {
                validation.errors.push('BSP name must not be longer than 15 characters.');
            }

            if (['$', 'T'].indexOf(options.abap_package.charAt(0)) === -1 && !options.abap_transport) {
                validation.errors.push('You should supply a transport.');
            }

            validation.warnings.map(msg => {
                console.log(colors.yellow(msg));
            });

            validation.errors.map(msg => {
                console.log(colors.red(msg));
            });

            if (validation.errors.length > 0) {
                process.exit(1);
            }

            // Information messages
            if (options.conn_usestrictssl === true || options.conn_usestrictssl === "true" || options.conn_usestrictssl === "1") {
                validation.information.push('If HTTPS is used, strict SSL enabled!');
                options.conn_usestrictssl = true
            } else {
                options.conn_usestrictssl = false
            }

            validation.information.map(msg => {
                console.log(colors.blue(msg));
            });

            // Retrieve files
            let files = [];
            try {
                if (options.base.substr(-1) === '/' || options.base.substr(-1) === '\\') {
                    options.base = options.base.substr(0, options.base.length - 1);
                }
                if (options.git_diff_commit) {
                    files = git.diff(
                        options.base,
                        options.files,                        
                        options.git_diff_commit,
                        options.git_diff_unstaged
                    );
                } else {
                    files = glob.sync(options.files, {
                        cwd: options.base,
                        onlyFiles: true,
                        dot : options.files_start_with_dot
                    });
                }
            } catch(e) {
                console.log(colors.red('Error!'), e);
                process.exit(1);
            }

            if (files.length === 0) {
                console.log(colors.yellow('No files found. Stopping...'));
                process.exit(1);
            }

            console.log(colors.yellow(`Found ${files.length} files. Starting upload...`));

            // Prepare to call libs
            const filestore = new FileStore({
                conn: {
                    server: options.conn_server,
                    client: options.conn_client,
                    useStrictSSL: options.conn_usestrictssl
                },
                auth: {
                    user: options.conn_user,
                    pwd: options.conn_password
                },
                ui5: {
                    language: options.abap_language.toUpperCase(),
                    transportno: options.abap_transport,
                    package: options.abap_package,
                    bspcontainer: options.abap_bsp,
                    bspcontainer_text: options.abap_bsp_text,
                    calc_appindex: (options.calcappindex === true || options.calcappindex === "true" || options.calcappindex === "1")
                },
                preserveUnselected: options.preserve_unselected
            });
            filestore.syncFiles(files, options.base, function (err) {
                if (err) {
                    console.log(colors.red('Error!'), err);
                    process.exitCode = 1;
                }
            });
        });
}

module.exports = UploadCommand;

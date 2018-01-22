# nwabap-ui5uploader

This module allows a developer to upload SAPUI5/OpenUI5 sources into a SAP NetWeaver ABAP system. The behavior is (or should be) the same than it is known from the SAP Web IDE app deployment option "Deploy to SAPUI5 ABAP Repository" or from the "SAPUI5 ABAP Repository Team Provider" available for Eclipse via the "UI Development Toolkit for HTML5".
The main reason for developing this module is to integrate the deployment process into a Continuous Integration environment, in which for instance a Jenkins server executes several build steps and finally deploys the sources to a SAP NetWeaver ABAP system if all previous build steps are ok.
The plugin also allows a developer to deploy the sources to a SAP NetWeaver ABAP system by a npm script using a different IDE than Eclipse or SAP Web IDE (for instance WebStorm).

## Prerequisites

### ABAP Development Tool Services
The ABAP Development Tool Services have to be activated on the SAP NetWeaver ABAP System (transaction SICF, path /sap/bc/adt).
The user used for uploading the sources needs to have the authorization to use the ADT Services and to create/modify BSP applications.
The plugin is tested with NW 7.30, NW 7.40 and NW 7.50 systems.

## Install

`npm install nwabap-ui5uploader --save-dev`

## Usage

This node module describes itself on the command line.

```
nwabap --help
```

```
nwabap upload --help
```

## Examples

Create a npm script that runs the `nwabap` module with the arguments you want.

### Upload to $TMP package

```
nwabap upload --base ./dist --conn_server http://myserver:8000 --conn_user upload --conn_password upl04d --abap_package $TMP --abap_bsp ZZ_UI5_LOCAL --abap_bsp_text 'UI5 upload local objects'
```

### Upload to a transport tracked package

```
nwabap upload --base ./dist --conn_server http://myserver:8000 --conn_user upload --conn_password upl04d --abap_package ZFRONTENDS_TEST --abap_bsp ZABSHR --abap_bsp_text 'Absence HR' --abap_transport PRDNK1230120032
```

## Release History

[CHANGELOG.md](CHANGELOG.md)
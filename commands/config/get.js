'use strict'
/* jshint node:true */
/* global module, process, console, require */

var Command = require('ronin').Command
var forown = require('lodash.forown')
var stringify = require('safe-json-stringify')
var argv = require('../../lib/util').argv
var out = require('../../lib/util').out
var isEmpty = require('../../lib/util').isEmpty
var camelCase = require('../../lib/util').camelCase
var warnAndExit = require('../../lib/util').warnAndExit
// var dashCase = require('../../lib/util').camelToDashCase
var conf = require('../../lib/config')
require('colors')  // just bring in colors

var Get = Command.extend({ use: ['session', 'auth'],
  desc: 'Get current user\'s configuration parameter(s)',

  run: function _run () {
    out.trace('Called with arguments: ' + stringify(argv))

    if (argv._.length < 2) {
      warnAndExit('Too few parameters!', this)
    } else if (argv._.length > 2) {
      warnAndExit('Too many parameters!', this)
    }

    // logsene config get --all
    if (argv.all) {
      forown(conf.getAllSync(), function (v, k) {
        out.info(k + ': ' + v)
      })
      process.exit(0)  // done
    }

    var getParam = function _getParam (paramName) {
      if (!isEmpty(argv[paramName])) {
        out.info(paramName + ': ' + conf.getSync(camelCase(paramName)))
        process.exit(0)  // only a single param per get command (or use get --all)
      }
    }

    // slightly dirty is that I don't know
    // which param the get command was called with
    // so I have to check all of them
    conf.getAvailableParams().forEach(function _forEachParam (param) {
      getParam(param)
    })

    // if we are here, not one known param hit
    out.warn('The provided parameter was not found')
    process.exit(0) // bail out - that's it
  },

  // returns usage help
  help: function _help () {
    return 'Usage: logsene config get [OPTION]'.bold +
        '  Where OPTIONS may be:\n'.grey +
        '    --api-key\n'.yellow +
        '    --token\n'.yellow +
        '    --app-name\n'.yellow +
        '    --default-size\n'.yellow + ' (sets the default number of hits returned for the current session)\n'.grey +
        '    --range-separator'.yellow + ' (used to separate two datetimes when specifying time range)\n'.grey +
        '    --trace\n'.yellow +
        '    --all'.yellow + ' (return listing of all params from the current user\'s session)\n\n'.grey
  }
})

module.exports = Get

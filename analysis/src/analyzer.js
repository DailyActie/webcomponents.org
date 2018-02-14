'use strict';

const Ana = require('./ana_log');

const {Analyzer, generateAnalysis, PackageUrlResolver, FSUrlLoader} = require('polymer-analyzer');
const UrlLoader = require('./url-loader');
const NoOpResolver = require('./noop-resolver');
const path = require('path');

class AnalyzerRunner {
  analyze(root, inputs) {
    return new Promise((resolve, reject) => {
      Ana.log('analyzer/analyze', inputs);

      var paths = inputs || [];

      const analyzer = new Analyzer({
        urlLoader: new FSUrlLoader(path.join(root, '..')),
        urlResolver: new PackageUrlResolver({packageDir: root, componentDir: '../'}),
      });
      debugger;
      // const analyzer = Analyzer.createForDirectory(root);

      // Filter results for only what is in the requested package instead
      // of everything that was analyzed.
      const isInPackage = feature => feature.sourceRange &&
        !feature.sourceRange.file.startsWith('../');

      if (paths.length === 0) {
        analyzer.analyzePackage().then(analysis => {
          resolve(generateAnalysis(analysis, analyzer.urlResolver));
        }).catch(function(error) {
          Ana.fail('analyzer/analyze', paths, error);
          reject({retry: true, error: error});
        });
      } else {
        analyzer.analyze(paths).then(function(analysis) {
          resolve(generateAnalysis(analysis, analyzer.urlResolver));
        }).catch(function(error) {
          Ana.fail('analyzer/analyze', paths, error);
          reject({retry: true, error: error});
        });
      }
    });
  }
}

module.exports = AnalyzerRunner;

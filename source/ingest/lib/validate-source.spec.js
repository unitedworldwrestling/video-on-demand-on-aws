'use strict';

let assert = require('chai').assert;
let expect = require('chai').expect;
var path = require('path');
let AWS = require('aws-sdk-mock');
AWS.setSDK(path.resolve('./node_modules/aws-sdk'));

let lambda = require('../validate-source.js');

describe('lambda', function() {

  let _event = {
    guid: "55ebfeba-acfc-4bce-981a-ea860595442c",
    srcVideo: "example.mpg",
    srcBucket: "bucket"
  };

  let data = {
    ContentLength: 12345
  }

  describe('#validate source ', function() {

    beforeEach(function() {
      process.env.AWS_LAMBDA_FUNCTION_NAME = 'testlambda';
      process.env.ErrorHandler = "errHandler";
    });

    afterEach(function() {
      AWS.restore('S3');
      delete process.env.AWS_LAMBDA_FUNCTION_NAME;
      delete process.env.ErrorHandler;
    });

    it('should return "data" when s3 get successful', function(done) {

      AWS.mock('S3', 'headObject', Promise.resolve(data));

      lambda.handler(_event, null, function(err, data) {
        if (err) done(err);
        else {
          assert.equal(data, _event);
          done();
        }
      });
    });
    it('should return "s3 error" when step execute successful', function(done) {

      AWS.mock('S3', 'headObject', Promise.reject('s3 error'));

      AWS.mock('Lambda', 'invoke', Promise.resolve('sucess'));

      lambda.handler(_event, null, function(err, data) {
        if (err) {
          expect(err).to.equal('s3 error');
          done();
        } else {
          done('invalid failure for negative test');
        }
      });
    });
    it('should return "s3 error" when step execute successful', function(done) {

      AWS.mock('S3', 'headObject', Promise.reject('s3 error'));

      AWS.mock('Lambda', 'invoke', Promise.reject('lambda error'));

      lambda.handler(_event, null, function(err, data) {
        if (err) {
          expect(err).to.equal('s3 error');
          done();
        } else {
          done('invalid failure for negative test');
        }
      });
    });
  });
});

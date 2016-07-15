const {expect} = require('chai');
const fs = require('fs');
const path = require('path');
const parser = require('../../index');

describe('parser', () => {
  it('parser parses less deps', (done) => {
    const fpath = path.join(__dirname, '../fixtures', 't6.less');
    fs.readFile(fpath, (err, file) => {
      if (err) {
        done(err);
      } else {

        parser(function() { return 1 }, file, fpath, {}).then(g => {
          expect(g.nodes().length).to.equal(6);
          done();
        }).catch(err => done(err))
      }
    });
  });
});

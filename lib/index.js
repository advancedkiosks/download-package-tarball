import {join as joinPath} from 'path';

import downloadTarball from 'download-tarball';
import rimraf from 'rimraf-then';
import mkdirp from 'mkdirp-then';
import {readdir, move} from 'fs-extra';
import tmp from 'then-tmp';
import npa from 'npm-package-arg';
import readJSON from 'then-read-json';

const makeParentDir = (dir, scope) => {
  return scope ? mkdirp(joinPath(dir, scope)) : mkdirp(dir);
};

module.exports = async ({url, gotOpts, dir, name}) => {
  const {path: tmpPath, cleanupCallback} = await tmp.dir();
  await downloadTarball({url, gotOpts, dir: tmpPath});
  const [fromDirname] = await readdir(tmpPath);
  const src = joinPath(tmpPath, fromDirname);
  const packageDir = name || (await readJSON(joinPath(src, 'package.json'))).name;
  const {scope} = npa(packageDir);
  const dest = joinPath(dir, packageDir);

  await makeParentDir(dir, scope);
  await rimraf(dest);
  await move(src, dest);

  cleanupCallback();
};

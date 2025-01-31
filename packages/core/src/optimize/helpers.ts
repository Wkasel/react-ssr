import fse from 'fs-extra';
import path from 'path';
import webpack from 'webpack';
import {
  getSsrConfig,
  getEngine,
  getPages,
  getPageId,
} from '../helpers';

const cwd = process.cwd();
const ext = '.' + getEngine();
const config = getSsrConfig();

export const getEntry = async (memfs: any): Promise<[webpack.Entry, string[]]> => {
  const entry: webpack.Entry = {};
  const entryPages = await getPages();
  const entryPath = path.resolve(__dirname, `../lib/webpack/${config.id}.js`);
  let template = fse.readFileSync(entryPath).toString();

  memfs.mkdirpSync(path.join(cwd, 'react-ssr-src'));

  for (let i = 0; i < entryPages.length; i++) {
    const page = entryPages[i];
    const pageId = getPageId(page, '/');
    const dir = path.dirname(pageId);
    const name = path.basename(pageId);
    if (dir !== '.') {
      memfs.mkdirpSync(path.join(cwd, 'react-ssr-src', dir));
    }
    memfs.writeFileSync(
      path.join(cwd, 'react-ssr-src', path.join(dir, `entry-${name}${ext}`)),
      template.replace('__REACT_SSR_PAGE__', page),
    );
    entry[getPageId(page, '_')] = `./${path.join(dir, `entry-${name}${ext}`)}`;
  }

  return [entry, entryPages];
};

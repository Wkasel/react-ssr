<p align="center">😎 @react-ssr/express 😎</p>
<p align="center">
  <a href="https://npm.im/@react-ssr/express" alt="A version of @react-ssr/express">
    <img src="https://img.shields.io/npm/v/@react-ssr/express.svg">
  </a>
  <a href="https://npm.im/@react-ssr/express" alt="Downloads of @react-ssr/express">
    <img src="https://img.shields.io/npm/dt/@react-ssr/express.svg">
  </a>
  <img src="https://img.shields.io/npm/l/@react-ssr/express.svg" alt="Package License (MIT)">
</p>

## Overview

- SSR (Server Side Rendering) as a view template engine
- Passing the server data to the client `props`
- Dynamic `props` without caring about SSR
  - Suitable for dynamic routes like blogging
- Dynamic `Head` component
- HMR when `process.env.NODE_ENV !== 'production'`

## Usage

Install it:

```bash
$ npm install --save @react-ssr/express express react react-dom
```

And add a script to your package.json like this:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

Populate files below inside your project:

**`./.babelrc`**

```json
{
  "presets": [
    "@react-ssr/express/babel"
  ]
}
```

**`./server.js`**

```js
const express = require('express');
const register = require('@react-ssr/express/register');

const app = express();

(async () => {
  // register `.jsx` or `.tsx` as a view template engine
  await register(app);

  app.get('/', (req, res) => {
    const message = 'Hello World!';
    res.render('index', { message });
  });

  app.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
})();
```

**`./views/index.jsx`**

```jsx
export default function Index({ message }) {
  return <p>{message}</p>;
}
```

Then just run `npm start` and go to `http://localhost:3000`.

You'll see `Hello World!`.

## Configuration (`ssr.config.js`)

Here is the default `ssr.config.js`, which is used by `react-ssr` when there are no valid values:

```js
module.exports = {
  id: 'default',
  viewsDir: 'views',
  distDir: '.ssr',
  webpack: (config /* webpack.Configuration */, env /* 'development' | 'production' */) => {
    return config;
  },
};
```

### `ssr.config.js#id`

The id of **UI framework**. (default: `default`)

It can be ignored only when the project does not use any UI frameworks.

Supported UI frameworks are:

- [x] [emotion](https://emotion.sh)
- [x] [styled-components](https://www.styled-components.com)
- [x] [material-ui](https://material-ui.com)
- [ ] [antd](https://ant.design)
- [ ] and more...

For example, if we want to use `emotion`, `ssr.config.js` is like this:

```js
module.exports = {
  id: 'emotion',
};
```

### `ssr.config.js#viewsDir`

The place where we put views. (default: `views`)

A function `res.render('xxx')` will render `views/xxx.jsx` or `views/xxx.tsx`.

A working example is here: [examples/custom-views](https://github.com/saltyshiomix/react-ssr/tree/master/examples/custom-views)

### `ssr.config.js#distDir`

The place where `react-ssr` outputs production results. (default: `.ssr`)

If we use TypeScript or any other library which must be compiled, the config below may be useful:

```js
module.exports = {
  // dist folder should be ignored by `.gitignore`
  distDir: 'dist/.ssr',
};
```

### `ssr.config.js#webpack()`

```js
module.exports = {
  webpack: (config /* webpack.Configuration */, env /* 'development' | 'production' */) => {
    // we can override default webpack config here
    return config;
  },
};
```

For example, let's consider we want to import css files directly:

**views/index.jsx**

```jsx
import '../styles/index.css';
```

**styles/index.css**

```css
body {
  background-color: burlywood;
}
```

Then, we must override the default webpack config like this:

**ssr.config.js**

```js
module.exports = {
  webpack: (config, env) => {
    config.module.rules = [
      ...(config.module.rules),
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ];
    return config;
  },
};
```

A working example is here: [examples/basic-css-import](https://github.com/saltyshiomix/react-ssr/tree/master/examples/basic-css-import)

## Custom Document

Just put `_document.jsx` or `_document.tsx` into the views root:

**./views/_document.jsx**

```jsx
import React from 'react';
import {
  Document,
  Head,
  Main,
} from '@react-ssr/express';

export default class extends Document {
  render() {
    return (
      <html>
        <Head>
          <title>Default Title</title>
        </Head>
        <body>
          <Main />
        </body>
      </html>
    );
  }
};
```

**Note**: **Please put `<Main />` component directly under `<body>` tag AND don't wrap `<Main />` component with another components** because this is a hydration target for the client.

And then, use it as always:

**./views/index.jsx**

```jsx
const Index = (props) => {
  return <p>Hello Layout!</p>;
};

export default Index;
```

A working example is here: [examples/custom-document](https://github.com/saltyshiomix/react-ssr/tree/master/examples/custom-document)

## Dynamic `Head`

We can use the `Head` component **anyware**:

**./views/index.jsx**

```jsx
import React from 'react';
import { Head } from '@react-ssr/express';

const Index = (props) => {
  return (
    <React.Fragment>
      <Head>
        <title>Dynamic Title</title>
        <meta name="description" content="Dynamic Description" />
      </Head>
      <p>Of course, SSR Ready!</p>
    </React.Fragment>
  );
};

export default Index;
```

A working example is here: [examples/basic-dynamic-head](https://github.com/saltyshiomix/react-ssr/tree/master/examples/basic-dynamic-head)

## Supported UI Framework

- [x] [emotion](https://emotion.sh)
- [x] [styled-components](https://www.styled-components.com)
- [x] [material-ui](https://material-ui.com)
- [ ] [antd](https://ant.design)
- [ ] and more...

### With Emotion

In order to enable SSR, we must install these packages:

- [@emotion/cache](https://npm.im/@emotion/cache) as **dependencies**
- [create-emotion-server](https://npm.im/create-emotion-server) as **dependencies**
- [babel-plugin-emotion](https://npm.im/babel-plugin-emotion) as devDependencies

And then, populate `.babelrc` in your project root:

```json
{
  "presets": [
    "@react-ssr/express/babel"
  ],
  "plugins": [
    "emotion"
  ]
}
```

A working example is here: [examples/with-jsx-emotion](https://github.com/saltyshiomix/react-ssr/tree/master/examples/with-jsx-emotion)

### With styled-components

In order to enable SSR, we must install `babel-plugin-styled-components` as devDependencies.

And then, populate `.babelrc` in your project root:

```json
{
  "presets": [
    "@react-ssr/express/babel"
  ],
  "plugins": [
    "styled-components"
  ]
}
```

A working example is here: [examples/with-jsx-styled-components](https://github.com/saltyshiomix/react-ssr/tree/master/examples/with-jsx-styled-components)

### With Material UI

We can use [material-ui](https://material-ui.com) without extra configuration.

A working example is here: [examples/with-jsx-material-ui](https://github.com/saltyshiomix/react-ssr/tree/master/examples/with-jsx-material-ui)

### With Ant Design

WIP

## TypeScript Support

To enable TypeScript engine (`.tsx`), just put `tsconfig.json` in your project root directory.

The code of TypeScript will be like this:

**`./package.json`**

```json
{
  "scripts": {
    "start": "ts-node server.ts"
  }
}
```

**`./server.ts`**

```ts
import express, { Request, Response } from '@react-ssr/express';

const app = express();

app.get('/', (req: Request, res: Response) => {
  const message = 'Hello World!';
  res.render('index', { message });
});

app.listen(3000, () => {
  console.log('> Ready on http://localhost:3000');
});
```

**`./views/index.tsx`**

```tsx
interface IndexProps {
  message: string;
}

export default function Index({ message }: IndexProps) {
  return <p>{message}</p>;
}
```

## Examples

- [examples/basic-blogging](https://github.com/saltyshiomix/react-ssr/tree/master/examples/basic-blogging)
- [examples/basic-css-import](https://github.com/saltyshiomix/react-ssr/tree/master/examples/basic-css-import)
- [examples/basic-dynamic-head](https://github.com/saltyshiomix/react-ssr/tree/master/examples/basic-dynamic-head)
- [examples/basic-jsx](https://github.com/saltyshiomix/react-ssr/tree/master/examples/basic-jsx)
- [examples/basic-nestjs](https://github.com/saltyshiomix/react-ssr/tree/master/examples/basic-nestjs)
- [examples/basic-nestjs-nodemon](https://github.com/saltyshiomix/react-ssr/tree/master/examples/basic-nestjs-nodemon)
- [examples/basic-tsx](https://github.com/saltyshiomix/react-ssr/tree/master/examples/basic-tsx)
- [examples/custom-document](https://github.com/saltyshiomix/react-ssr/tree/master/examples/custom-document)
- [examples/custom-views](https://github.com/saltyshiomix/react-ssr/tree/master/examples/custom-views)
- [examples/with-jsx-emotion](https://github.com/saltyshiomix/react-ssr/tree/master/examples/with-jsx-emotion)
- [examples/with-jsx-material-ui](https://github.com/saltyshiomix/react-ssr/tree/master/examples/with-jsx-material-ui)
- [examples/with-jsx-styled-components](https://github.com/saltyshiomix/react-ssr/tree/master/examples/with-jsx-styled-components)

## Starters

- [react-ssr-jsx-starter](https://github.com/saltyshiomix/react-ssr-jsx-starter)
- [react-ssr-tsx-starter](https://github.com/saltyshiomix/react-ssr-tsx-starter)
- [react-ssr-nestjs-starter](https://github.com/saltyshiomix/react-ssr-nestjs-starter)

## Articles

[The React View Template Engine for Express](https://dev.to/saltyshiomix/the-react-view-template-engine-for-express-42f0)

[[Express] React as a View Template Engine?](https://dev.to/saltyshiomix/express-react-as-a-view-template-engine-h37)

## Related

[reactjs/express-react-views](https://github.com/reactjs/express-react-views)

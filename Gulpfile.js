const gulp     = require('gulp');
// const serve = require('gulp-serve');
const sri = require('gulp-sri');
const git = require('git-rev-sync');
const package = require('./package.json');
const { upload } = require('gulp-s3-publish');
const { S3 } = require('aws-sdk');
const replace = require('gulp-replace');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const webpack = require('webpack-stream');
const webpackCfg = require('./webpack.config.js') ;
const del = require('del');

// DEPLOYMENT CONFIGURATION OPTIONS
const source = ['dist/browser/*.js', 'dist/browser/*.js.map', 'dist/browser/*.css', 'dist/browser/*.json']; // source for deploy
const sourceSRI = ['dist/browser/*.js', 'dist/browser/*.css']; // source for sri generation
const bucket = 'static.filestackapi.com' // upload bucked
const putObjectParams = {
  ACL: 'public-read'
};
const deployPath = 'filestack-drag-and-drop-js'; // upload path
const cacheControl = { // cache controll for each version
  latest: 1,
  version: 30,
  beta: 0,
};

// HELPERS
let currentTag;
const currentBranch = git.branch();

try {
  currentTag = git.tag();
  if (currentTag.indexOf('v') !== 0) {
    currentTag = undefined;
  }
} catch(e) {
  console.log('Current Git Tag not found. Beta will be released');
}

const getMajorVersion = (version) => version.split('.')[0];

console.info('Current GIT Branch is ', currentBranch);
console.info(`Current GIT Tag is`, currentTag);

// S3
const S3Client = new S3();

const uploadFile = (version, CacheControl) => {
  return upload(S3Client, {
    bucket,
    putObjectParams: {
      ...putObjectParams,
      CacheControl: `max-age=${CacheControl * 86400}`,
    },
    uploadPath: `${deployPath}/${version}`,
    dryRun: ['develop', 'main'].indexOf(currentBranch) > -1 ? false : true,
  })
}

gulp.task('build:clean', () => del(['dist/**/*']));

gulp.task('typescript:main', () => {
  const tsProject = ts.createProject('tsconfig.json');
  return tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(replace('@{VERSION}', package.version))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/main'));
});

gulp.task('typescript:modules', () => {
  const tsProject = ts.createProject('tsconfig.module.json');
  return tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(replace('@{VERSION}', package.version))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/module'));
});

gulp.task('build:webpack:prod', () => {
  return gulp.src(webpackCfg.entry)
  .pipe(webpack(webpackCfg))
  .pipe(gulp.dest(webpackCfg.output.path));
});

// GENERATE SRI TAG
gulp.task('sri', () => {
  return gulp.src(sourceSRI)
    .pipe(sri({
      fileName: 'dist/browser/manifest.json',
      transform: (o) => {
        let newOb = {};
        for (const el in o) {
          newOb[el.replace('dist/browser/', '')] = { sri: o[el] };
        };

        return newOb;
      }
    }))
    .pipe(gulp.dest('.'));
});

// DEPLOYMENTS
gulp.task('publish:beta', (done) => {
  if (currentTag) {
    console.log('Skipping publish:beta task');
    return done();
  }

  return gulp.src(source).pipe(uploadFile('beta', cacheControl.beta))
});

gulp.task('publish:latest', (done) => {
  if (!currentTag) {
    console.log('Skipping publish:latest task');
    return done();
  }

  return gulp.src(source).pipe(uploadFile(`${getMajorVersion(package.version)}.x.x`, cacheControl.latest));
});

gulp.task('publish:version', (done) => {
  if (!currentTag) {
    console.log('Skipping publish:version task');
    return done();
  }

  return gulp.src(source).pipe(uploadFile(package.version, cacheControl.version));
});

gulp.task('publish', gulp.series('sri', 'publish:beta', 'publish:version', 'publish:latest'));
gulp.task('build:webpack', gulp.series(['build:webpack:prod']));
gulp.task('build:typescript', gulp.series(['build:clean', 'typescript:main', 'typescript:modules']));
gulp.task('build', gulp.series(['build:typescript', 'build:webpack', 'sri']));

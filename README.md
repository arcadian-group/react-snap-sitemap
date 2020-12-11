# React Snap Sitemap

A companion package for [react-snap](https://github.com/stereobooster/react-snap).

This package allows you to generate a sitemap.xml based off the created directories and files produced by react-snap.

## Installation

`npm install --save @alex-drocks/react-snap-sitemap`

## Useage

Add `&& react-snap-sitemap --base-url=http://example.com/` to the end of your postBuild script after you've the `react-snap` command.

You can also add `--change-frequency=always|daily|weekly|monthly|yearly|never`.
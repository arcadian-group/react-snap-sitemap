# React Snap Sitemap

# **IMPORTANT**: This project is unmaintained

This project was originally created to solve a one-off issue we had with a react-snap project. We are no longer actively maintaining or supporting this package.

Our last action on this project has been to merge in one of the more popular forks of this package: https://github.com/alex-drocks/react-snap-sitemap

It is my strongest recommendation that anyone who actively uses this package migrate over to this fork, as it appears to be somewhat more actively maintained.

---

A companion package for [react-snap](https://github.com/stereobooster/react-snap).

This package allows you to generate a sitemap.xml based off the created directories and files produced by react-snap.

This package was created based off [this comment](https://github.com/stereobooster/react-snap/issues/38#issuecomment-487350403) by [@erel](https://github.com/erel).

## Installation

`npm install -D @arcadian-digital/react-snap-sitemap`

## Usage

Add `&& react-snap-sitemap --base-url=http://example.com/` to the end of your postBuild script after you've the `react-snap` command.

You can also add `--change-frequency=always|daily|weekly|monthly|yearly|never`.

If you need trailing slashes at the end of your URLs add `--add-slash=true`

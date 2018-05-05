# McPassword Hasher extension for firefox

This is an updated version of the classic wjjo password hasher updated to work with web extensions and also with a workaround for many sites that use frameworks that prevented the old extension from finding password blanks.

## Installation

## How to use
1. Open the hasher
   1. by pressing Ctrl+F6 (linux, mac) or Ctrl+Shift+F6 (windows and all else)
   1. or by clicking the icon in your toolbar.
1. Enter a master password
1. Adjust the site tag if necessary
1. Click options and adjust your preferences for this site
1. Confirm by
   1. clicking Fill in Blank, then clicking the red bordered blanks in your page
   1. or by clicking the site password blank and copying the password to your clipboard
1. Your settings will be saved for this site moment you do either of the above actions.

## Extension configuration
Go to the addons page (about:addons) and adjust settings as necessary.  These settings will be used in the absence of more specific settings for a particular site that you've created a password for before.

## Thanks
* Many thanks to the original writer of the password hasher extension that I've used for so many years.
* Thanks to the writer of Password Hasher NG for a solid layout and the idea for master password hint.

## Hacking
It should be enough to run `npx webpack -w` to watch the javascript files in src, automatically recompile them on change, and `npx web-ext run`, which opens a clean browser window with debugging enabled, watches all files mentioned in manifest.json, reloading the extension on any detected change.  I've found it to be a bit fiddly but it is very helpful.

I've set up an npm script to zip up the src directory upon signing a new build.  The reason for this is that the javascript files in the src directory use features that firefox's addon linter doesn't understand and thus rejects it for having javascript errors.  While I could just omit them from the extension, anyone who looked in the file would see only compiled javascript, assume I was harvesting their site passwords and raise the alarm.  This way at the very least, someone who is interested can see all the original source files and reassure themselves that nothing untoward is going on or even build the extension themselves.

## Issues
I've yet to find a site that does not work with the "Fill in the blank" feature in this addon, but I'm sure there are some out there somewhere.  While I can't guarantee that I can get every site to work, I can guarantee that I will at least make the attempt.

## Future Features
* Make it possible to shift click password blanks to fill in multiple password blanks in one go.
* Find some way to auto focus the password blank upon opening the popup window.  I have yet to find a way to make this happen.

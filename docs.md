why you should make a screen recorder as a desktop app instead of web app ?

- why this question even exists is because in browser we have been provided a function named `getDisplayMedia` in `navigator.mediaDevics` on invoking browser shows a prompt to select for the window or screen, user want to share, after selecting it returns you a stream and using `MediaRecorder` that stream can be easily saved and downloaded in your system
- In electron desktop version you have have a more polished custom list of source with your own branding instead of a simple prompt
- And I don't want to go to browser and connect to internet just to record a video
- `getDisplayMedia` can have different implementation in different browser while electron provide a standard implementation
- while you have the stream in nodejs, that means you can use some compression, processing etc.
- and desktop apps will gives you a system level access like saving the files in a specific place and intergration with system tray

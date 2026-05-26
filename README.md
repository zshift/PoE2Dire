# PoE2Dire

Extension to rendering Path of Exile patch notes in a Dota2-style layout.

<img width="1280" height="800" alt="01-overview" src="https://github.com/user-attachments/assets/4efc326c-270c-4a18-b46b-d3ca8be557a6" />
<img width="1201" height="1021" alt="showcase" src="https://github.com/user-attachments/assets/c41b4e58-084c-4a46-969e-76e239129df7" />


The extension only injects on:

```text
https://www.pathofexile.com/forum/*
```

It still declares access to `poewiki.net` and `poe2wiki.net` for icons lookup.

The extension does not auto-convert pages. Click the PoE2Dire toolbar icon on a forum thread to activate it. Click it again or reload to restore the original page.

## Install on Chrome

TBD

## Install on Firefox

[Firefox Browser Add-ons Page](https://addons.mozilla.org/en-US/firefox/addon/poe2dire/)

## Phones (Do you guys not have phones?)

> [!CAUTION]
> This will download the remote code (`https://aisatan.github.io/PoE2Dire/PoE2Dire-bookmarklet.js`) and executing it on your browser.
> It's not required - but I strongly suggest to stay safe and use the incognite mode.

This is for phones or browsers where you cannot/don't want to install the extension.

Video installation on phone: 

https://github.com/user-attachments/assets/a034d803-7d16-443c-8e9b-e5f683d9e309

better quality: https://youtube.com/shorts/AmYBZYfP4YY

The phone bookmarklet loads the published single-file build from GitHub Pages:

```js
javascript:(function(){var s=document.createElement('script');s.src='https://aisatan.github.io/PoE2Dire/PoE2Dire-bookmarklet.js?poe2dire=' + Date.now();s.referrerPolicy='no-referrer';s.onerror=function(){alert('PoE2Dire failed to load. The page may block bookmarklet scripts.');};document.documentElement.appendChild(s);})();
```

How to use it:

1. Create a browser bookmark (any site will do)
2. Edit the bookmark URL and Name.
3. Paste the full `javascript:` code above as the bookmark URL.
4. Put some easy accessable name, like `0000 poe2dire`
5. Open a Path of Exile forum patch-notes page.
6. Run the bookmark (in the most browsers you can write the name of the bookmark to see and activate it)

Some mobile browsers block bookmarklet scripts, so this may not work everywhere, tested on `Brave` only.

## Support 🌠

Please, consider any of this to support:

- Leaving a github star ⭐
- [Buy me a coffee <3](https://buymeacoffee.com/aisatan)
- [Donate to Blender Foundation](https://fund.blender.org/donate-once/)

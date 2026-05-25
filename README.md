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

## Chrome

TBD

## Firefox

TBD

## Phones

This is for phones or browsers where you cannot install the extension.

<img width="1080" height="2410" alt="showcase_mobile" src="https://github.com/user-attachments/assets/c5d5b216-ea17-4733-be05-a1586e827622" />

Video: TBD

The phone bookmarklet loads the published single-file build from GitHub Pages:

```js
javascript:(function(){var s=document.createElement('script');s.src='https://aisatan.github.io/PoE2Dire/PoE2Dire-bookmarklet.js?poe2dire=' + Date.now();s.referrerPolicy='no-referrer';s.onerror=function(){alert('PoE2Dire failed to load. The page may block bookmarklet scripts.');};document.documentElement.appendChild(s);})();
```

How to use it:

1. Create a browser bookmark.
2. Edit the bookmark URL.
3. Paste the full `javascript:` code above as the bookmark URL.
4. Open a Path of Exile forum patch-notes page.
5. Run the bookmark.

Some mobile browsers block bookmarklet scripts, so this may not work everywhere.

## Support 🌠

Please, consider any of this to support:

- Leaving a github star ⭐
- [Buy me a coffee <3](https://buymeacoffee.com/aisatan)
- [Donate to Blender Foundation](https://fund.blender.org/donate-once/)

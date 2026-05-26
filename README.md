# PoE2Dire

Extension to rendering Path of Exile patch notes in a Dota2-style layout.

<img width="1280" height="800" alt="01-overview" src="https://github.com/user-attachments/assets/4efc326c-270c-4a18-b46b-d3ca8be557a6" />
<img width="1201" height="1021" alt="showcase" src="https://github.com/user-attachments/assets/c41b4e58-084c-4a46-969e-76e239129df7" />


The extension only injects on:

```text
https://www.pathofexile.com/forum/*
```

It still declares access to `poewiki.net` and `poe2wiki.net` for icons lookup.

## How to use?
1. Go to any poe patch note forum page ([like this hot one](https://www.pathofexile.com/forum/view-thread/3932540))
2. Click PoE2Dire icon on top to activate it <img width="114" height="79" alt="image" src="https://github.com/user-attachments/assets/2b800f16-d7a4-4f35-b4cc-65940e61ee31" /> (if you don't see it, you need to pin it, use mosaic icon, find it, click it there)
3. Done
4. You can click it again to deactivate, or simply reload.

## Dota2 Style Search Feature

> [!NOTE]
> This works only if you installed via Chrome/Firefox extension

The second feature of this extension is the ability to search by just start typing. 
- Yes, just start typing, for example, type `traps`, until you realize `There is no Carol in H.R`. 
- You can click enter to move to the next result. 
- It auto clear after 2 seconds, so you can easily start searching for a new thing next, so try to search for `daggers` next.

## Install on Chrome

TBD - Waiting for approval

## Install on Firefox

[Firefox Browser Add-ons Page](https://addons.mozilla.org/en-US/firefox/addon/poe2dire/) - Waiting for approval

## Do you guys have phones?

This is for phones or browsers where you cannot/don't want to install the extension.

> [!CAUTION]
> This will download the remote code (`https://aisatan.github.io/PoE2Dire/PoE2Dire-bookmarklet.js`) and **execute** it with your browser.
> It's not required - but I **strongly suggest** to stay safe and use the **incognite mode**.

Video installation on my phone (brave browser): 

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

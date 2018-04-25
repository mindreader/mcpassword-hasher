export class SiteTag {
  static getHostName(url) {

    // about:newtab#foo => "newtab"
    const res = url.match(/about:([a-zA-Z]+)/)
    if (res) return res[1]

    // file://foo/bar/baz.html => "baz.html"
    if (url.indexOf("file://") === 0) {
      const h = url.split("/")
      if (h.length <= 1) return ""
      return h[h.length-1]
    }

    // taken from http://www.primaryobjects.com/2012/11/19/parsing-hostname-and-domain-from-a-url-with-javascript/
    // http://foo.bar.com?id=21 => "bar.com"
    let match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i)
    if (match != null && match.length > 2 && typeof match[2] === "string" && match[2].length > 0) {
      return match[2]
    }

    return null
  }

  // taken from original wjjo password hasher extension (now defunct).
  // bar.com => "bar"         withtoplevel == "bar.com"
  // www.bar.com => "bar"     withtoplevel == "bar.com"
  // newtab      => "newtab"  withtoplevel => "newtab"
  // test.html   => "test"    withtoplevel => "test.html"
  static getDefaultTag(input, withtoplevel) {
    let h = input.split(".")
    if (h.length <= 1)
      return input

    // Handle domains like co.uk
    if (h.length > 2 && h[h.length-1].length == 2 && h[h.length-2] == "co")
      return h[h.length-3] + "." + h[h.length-2] + "." + h[h.length-1]
    return h[h.length-2] + (withtoplevel ? "." + h[h.length-1] : "")
  }
}

export class SiteStorage {

  static _key(url) {
    const hostname = SiteTag.getHostName(url)
    return `mch-settings-${hostname}`
  }

  static get(url) {
    const key = SiteStorage._key(url)
    let lookupkey = {}
    lookupkey[key] = {}

    return Promise.all([ExtPrefStorage.get(), browser.storage.local.get(lookupkey).then(x => x[key])]).catch(() => {
      // Logger.log("site storage get error!")
      // Logger.log(e)
    }).then(pms => {
      const defsettings = pms[0]
      let settings = pms[1]

      if (!("sitetag" in settings)) {
        const hostname = SiteTag.getHostName(url)
        const defsitetag = SiteTag.getDefaultTag(hostname, defsettings.fulldomainsitetag)
        settings.sitetag = defsitetag
      }

      //TODO if we ever deprecate any preferences it would be good to
      //     remove them from here so that they don't clog up storage forever
      return Object.assign({}, JSON.parse(JSON.stringify(defsettings)), JSON.parse(JSON.stringify(settings)))
    })
  }

  static setPrefs(url, sitetag, size, onedigit, onepunc, upperlower, nospecial, digitsonly) {
    const settings = {
      sitetag: sitetag,
      size: size,
      onedigit: onedigit,
      onepunc: onepunc && !nospecial && !digitsonly,
      upperlower: upperlower && !digitsonly,
      nospecial: nospecial,
      digitsonly: digitsonly,
    }
    return SiteStorage.set(url, settings)
  }

  static set(url, settings) {
    const key = SiteStorage._key(url)
    let lookupkey = {}
    lookupkey[key] = settings
    return browser.storage.local.set(lookupkey)
  }
}

export class ExtPrefStorage {

  static defaults() {
    return {
      syncextensions: false,
      syncsites: false,
      masterkeyhint: true,
      fulldomainsitetag: false,
      allowclicksitepass: true,
      size: 8,
      onedigit: true,
      onepunc: true,
      upperlower: true,
      nospecial: false,
      digitsonly: false,
    }
  }

  static get() {
    const key = "mcpasshash-options"
    let lookupkey = {}
    lookupkey[key] = {}

    return browser.storage.local.get(lookupkey).catch(() => {
      // Logger.log("pref storage get error!")
      // Logger.log(e)
    }).then(x => x[key]).then(settings => {
      // in case we have added options, set missing ones to default.
      const defaults = ExtPrefStorage.defaults()

      return Object.assign({}, JSON.parse(JSON.stringify(defaults)), JSON.parse(JSON.stringify(settings)))
    })
  }

  static setPrefs(syncextensions, syncsites,  masterkeyhint, fulldomainsitetag, allowclicksitepass,
    size, onedigit, onepunc, upperlower, nospecial, digitsonly) {

    const settings = {
      syncextensions: syncextensions,
      syncsites: syncsites,
      masterkeyhint: masterkeyhint,
      fulldomainsitetag: fulldomainsitetag,
      allowclicksitepass: allowclicksitepass,
      size: size,
      onedigit: onedigit,
      onepunc: onepunc,
      upperlower: upperlower,
      nospecial: nospecial,
      digitsonly: digitsonly,
    }

    const key = "mcpasshash-options"
    let lookupkey = {}
    lookupkey[key] = settings
    return browser.storage.local.set(lookupkey)
  }
}

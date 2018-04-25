// import Logger from "./Logger"
class Content {
  constructor() {
    this.tabId = this.queryIninitialTab()

    browser.tabs.onActivated.addListener(info =>
      this.tabId = Promise.resolve(info.tabId)
    )
  }

  queryIninitialTab() {
    return new Promise((resolve, reject) => {
      browser.tabs.query({active: true}).then(tabs => {
        if (tabs.length >= 1) resolve(tabs[0].id)
        else reject("there are no active tabs")
      }).catch(err => reject(err))
    })
  }

  passwordGenerated(password) {
    this.tabId.then(tabId =>  {
      browser.tabs.sendMessage(tabId, {event: "pass_generated", password: password})
    // if there is no tab somehow, do nothing.
    }).catch(() => null)
  }

  cancelHighlights(tabId) {
    browser.tabs.sendMessage(tabId, {event: "pass_input_cancel"})
  }

}

class EventHandler {
  constructor({
    password_generated: pass_generated,
    password_input_canceled: pass_input_canceled
  }) {

    this.gotMessage = this.gotMessage.bind(this)

    this.pass_generated = pass_generated
    this.pass_input_cancel = pass_input_canceled

    browser.runtime.onMessage.addListener(this.gotMessage)
  }

  gotMessage(msg, sender) {
    switch (msg.event) {

    // from popup
    case "pass_generated":
      this.pass_generated(msg.password)
      break

    // from content scripts
    case "pass_input_cancel":
      this.pass_input_cancel(sender.tab.id)
      break
    }
  }
}

// I'm not sure if I need this, but sometimes it might be
// useful to people if they remove it from their toolbar.
class MenuHandler {
  static init() {
    browser.menus.create({
      id: "mcpasshash",
      title: "McPassword Hasher",
      contexts: ["password"],
    })

    browser.menus.onClicked.addListener( info => {

      if (info.menuItemId == "mcpasshash") {
        browser.browserAction.openPopup()
      }
    })
  }
}

const content = new Content()
new EventHandler({

  // when the popup has generated a password, it needs to trigger
  // all content scripts to go into highlight mode
  password_generated: password => {
    content.passwordGenerated(password)
  },

  // the highlight mode is no longer in effect either because password
  // has been input into a blank or you have escaped that
  // mode in one content script.  We need to ensure all uninvolved
  // content scripts in this tab get the message that they should stop
  // highlighting as well.
  password_input_canceled: tabId => {
    content.cancelHighlights(tabId)
  }
})

MenuHandler.init()

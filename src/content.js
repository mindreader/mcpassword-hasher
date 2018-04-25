// import Logger from "./Logger"

const waiting_for_password = 1
const highlighting_password_blanks = 2

class PasswordBlankFinder {
  constructor({onClick: onClick}) {
    this.state = waiting_for_password
    this.password = null

    this.onClick = onClick

    this.removeHighlights = this.removeHighlights.bind(this)
  }

  gotPassword(password) {
    if (this.state === highlighting_password_blanks) return

    this.state = highlighting_password_blanks
    this.password = password

    this._findPasswordBlanks().forEach(el => this._highlight(el, () => {
      if (window.getComputedStyle(el, null).visibility === "visible")
        this.passwordFieldClicked(el)
    }))
  }

  passwordFieldClicked(input) {
    this.state = waiting_for_password
    // input.value = this.password <- doesn't work on react sites.
    simulateKey(input, this.password)
    this.removeHighlights()
    this.onClick(input)
  }

  removeHighlights() {
    this.state = waiting_for_password
    document.querySelectorAll(".passhash_clickable").forEach(el =>
      el.parentNode.removeChild(el)
    )
    this.password = null
  }

  _highlight(el, f) {
    var dims = el.getBoundingClientRect()
    const div = document.createElement("div")
    div.classList.add("passhash_clickable")
    div.style.position = "absolute"
    div.style.top = `${Math.round(dims.top + window.scrollY - 2)}px`
    div.style.left = `${Math.round(dims.left + window.scrollX) - 2}px`
    div.style.width = `${Math.round(dims.width)}px`
    div.style.height = `${Math.round(dims.height)}px`
    div.style.border = "2px solid red"
    div.onclick = f
    div.style.zIndex = 2140000000 // FIXME There has to be a better way
    el.ownerDocument.body.appendChild(div)
  }


  _findPasswordBlanks() {

    let docSearch = doc => {
      let res = []
      if (!res.length) res = this._q(doc,"input[type='password']")
      if (!res.length) res = this._q(doc,"input[name='password']")
      if (!res.length) res = this._q(doc,"input[name='passwd']")
      if (!res.length) res = this._q(doc,"input")
      return res
    }

    // search main document
    let res = docSearch(document)
    return res
  }

  _q(doc,query) {
    return doc.querySelectorAll(query)
  }
}

class Events {
  constructor({
    onPassword: onPassword,
    onCancel: onCancel
  }) {

    this.message = this.message.bind(this)
    browser.runtime.onMessage.addListener(this.message)

    this.onPassword = onPassword
    this.onCancel = onCancel
  }

  message(msg) {
    switch (msg.event) {
    
    // from background
    case "pass_generated":
      this.onPassword(msg.password)
      break

    // from background
    case "pass_input_cancel":
      this.onCancel()
      break
    }
  }

}

const pwf = new PasswordBlankFinder({
  onClick: () => {
    // TODO allow for shift clicking to
    // hit additional clicks after first
    browser.runtime.sendMessage({
      event: "pass_input_cancel"
    })
  }
})

new Events({
  onPassword: password =>  pwf.gotPassword(password),
  onCancel: () => pwf.removeHighlights(),
})


function simulateKey(el, password) {
  // this deals with reactjs where it overrides the value set property to dedupe events.
  // TODO find site examples where this is necessary.
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")
    .set.call(el, password)

  el.dispatchEvent(new Event("input", { bubbles: true}))
}

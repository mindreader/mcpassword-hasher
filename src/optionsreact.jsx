import { ExtPrefStorage } from "./storage"
import React from "react"
import CheckBox from "./CheckBox"
import Sizes from "./Sizes"

import "./options.css"


export class McPassHashOptions extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      syncextensions: false,
      syncsites: false,
      masterkeyhint: true,
      fulldomainsitetag: true,
      allowclicksitepass: true,
      size: 8,
      digitsonly: false,
      onepunc: true,
      onedigit: true,
      upperlower: true,
      nospecial: false,

      shouldsave: false,
      shortcut: null,
    }
    this.prefs = ExtPrefStorage.get()
    this.platform = browser.runtime.getPlatformInfo()
  }

  componentDidMount = () => {
    Promise.all([this.prefs, this.platform]).then(pms => {
      const prefs = pms[0]
      const platform = pms[1]

      const shortcut =
        platform.os == "mac" ? "Ctrl + F6" :
          platform.os == "linux" ? "Ctrl + F6" :
            "Ctrl + Shift + F6"

      this.setState({
        masterkeyhint: prefs.masterkeyhint,
        fulldomainsitetag: prefs.fulldomainsitetag,
        allowclicksitepass: prefs.allowclicksitepass,
        size: prefs.size,
        digitsonly: prefs.digitsonly,
        onepunc: prefs.onepunc,
        onedigit: prefs.onedigit,
        upperlower: prefs.upperlower,
        nospecial: prefs.nospecial,
        shortcut: shortcut
      })
    })
  }

  componentDidUpdate() {
    // we must wait until after render to select text.
    if (this.state.shouldsave) {
      this.save()
    }
  }


  masterkeyhintChange = (e) =>     {this.setState({ shouldsave: true, masterkeyhint: e.target.checked })}
  fulldomainsitetagChange = (e) => {this.setState({ shouldsave: true, fulldomainsitetag: e.target.checked })}
  allowclicksitepassChange = (e) => {this.setState({ shouldsave: true, allowclicksitepass: e.target.checked })}

  sizeChange = (e) =>           {this.setState({ shouldsave: true, size: parseInt(e.target.value, 10) })}
  nospecialChange = (e) =>      {this.setState({ shouldsave: true, nospecial: e.target.checked })}
  digitsonlyChange = (e) =>     {this.setState({ shouldsave: true, digitsonly: e.target.checked })}
  onedigitChange = (e) =>       {this.setState({ shouldsave: true, onedigit: e.target.checked })}
  onepuncChange = (e) =>        {this.setState({ shouldsave: true, onepunc: e.target.checked })}
  upperlowerChange = (e) =>     {this.setState({ shouldsave: true, upperlower: e.target.checked })}

  save = () => {
    return ExtPrefStorage.setPrefs(
      false, false, // firefox sync TODO
      this.state.masterkeyhint,
      this.state.fulldomainsitetag,
      this.state.allowclicksitepass,
      this.state.size,
      this.state.onedigit, this.state.onepunc, this.state.upperlower,
      this.state.nospecial, this.state.digitsonly)

  }


  render = () => {

    return (
      <div id="options">
        <div id="userinterface">
          <div className="header">User Interface</div>
          <CheckBox id="masterkeyhint" onChange={this.masterkeyhintChange} checked={this.state.masterkeyhint} desc="Show master key hint in form-field"/>
          <CheckBox id="fulldomainsitetag" onChange={this.fulldomainsitetagChange} checked={this.state.fulldomainsitetag} desc="Guess full domain for site tag"/>
          <CheckBox id="allowclicksitepass" onChange={this.allowclicksitepassChange} checked={this.state.allowclicksitepass} desc="Allow click unmasking of site password (in order to copy and paste it)"/>
        </div>
        <div id="howtouse">
          <div className="header">How to Use</div>
          <div className="text">
            {"Simply browse to a page with a password field and then either hit " + this.state.shortcut + ", or click the McPassHash logo in your toolbar (the blue pound sign)."}
          </div>
          <div className="text">
            {"Enter a super secure password that you only use with this extension into the master password field.  The characters to the right of the password a hint to help you to know you've typed the same password you've typed in the past.  Take note of those characters.  They should be the same each time."}
          </div>
          <div className="text">
            {"Then press \"Fill in Blanks\" and McPassHash will attempt to find potential password fields on your current page and highlight them.  Simply click one of those fields and your password will be entered.  Alternatively you may simply click the Site Password field and you will be able to copy your password and paste it into a blank."}
          </div>
          <div className="text">
            {"There will be a site tag based on the current location of your current browser tag, which you may adjust as you see fit.  Bump will adjust the site tag"}
          </div>
        </div>

        <div id="requirements">
          <div className="header">Requirements</div>

          <CheckBox id="onedigit" onChange={this.onedigitChange} checked={this.state.onedigit} desc="Require at least one digit in password"/>

          <CheckBox id="onepunc" onChange={this.onepuncChange} disabled={this.state.digitsonly || this.state.nospecial}
            checked={this.state.onepunc && !this.state.digitsonly && !this.state.nospecial} desc="Require at least one punctuation character"/>

          <CheckBox id="upperlower" onChange={this.upperlowerChange} disabled={this.state.digitsonly}
            checked={this.state.upperlower && !this.state.digitsonly} desc="Both upper and lower case characters"/>
        </div>

        <div id="restrictions">
          <div className="header">Restrictions</div>
          <CheckBox id="nospecial" onChange={this.nospecialChange} checked={this.state.nospecial} desc="No special characters in password"/>
          <CheckBox id="digitsonly" onChange={this.digitsonlyChange} checked={this.state.digitsonly} desc="Digits only in password"/>
        </div>

        <div id="storage">
          <div className="header">Storage</div>
          <div className="text">This extension uses synced storage to store preferences if you desire, but it is disabled by default.  Keep in mind that firefox browser sync, while convenient and reasonably secure, is not infallible.  While no passwords are stored, site specific preferences, known in-use site tags and extensive browser history would give a dedicated attacker a solid avenue toward brute forcing your master password.</div>
          <CheckBox id="syncextensions" desc="Sync extension specific preferences (those that are on this page) from this browser"/>
          <CheckBox id="syncsites" desc="Sync site specific options and site tags from this browser"/>

        </div>

        <div id="size">
          <div className="header">Size</div>
          <Sizes onChange={this.sizeChange} currentSize={this.state.size}/>
        </div>
      </div>
    )
  }
}

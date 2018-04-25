// import Logger from "./Logger"
import { SiteStorage } from "./storage"
import { PassHashCommon } from "./passhash-common"
import CheckBox from "./CheckBox"
import Sizes from "./Sizes"
import "./popup.css"
import React from "react"

export class McPassHashPopup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      options: false,
      masterpassword: "",
      sitepassfocused: false, // false or the sitepass input element
      hint: "",

      // site prefs
      sitetag: "",
      size: 8,
      digitsonly: false,
      onepunc: true,
      onedigit: true,
      upperlower: true,
      nospecial: false,
    }
  }

  componentDidMount = () => {

    this.tab = new Promise((resolve, reject) => {
      browser.tabs.query({active: true}).then(tabs => {
        if (tabs.length >= 1) resolve(tabs[0])
        else reject("there are no active tabs")
      })
    })

    this.tab.then(tab => 
      // Ensure that once popup has loaded, any existing content
      // scripts will no longer be in highlight mode.
      browser.tabs.sendMessage(tab.id, {event: "pass_input_cancel"})
    )

    // site specific settings
    const siteprefs = this.tab.then(tab => SiteStorage.get(tab.url))

    siteprefs.then(siteprefs => {
      this.setState({
        sitetag: siteprefs.sitetag,
        size: siteprefs.size,
        digitsonly: siteprefs.digitsonly,
        onepunc: siteprefs.onepunc,
        onedigit: siteprefs.onedigit,
        upperlower: siteprefs.upperlower,
        nospecial: siteprefs.nospecial,
      })
    })
  }
  componentDidUpdate() {
    // we must wait until after render to select text.
    if (this.state.sitepassfocused) {
      this.state.sitepassfocused.select()
      this.save()
    }
  }

  save = () => {
    return this.tab.then(tab => {
      return SiteStorage.setPrefs(tab.url, this.state.sitetag, this.state.size,
        this.state.onedigit, this.state.onepunc, this.state.upperlower,
        this.state.nospecial, this.state.digitsonly)
    })
  }

  cancel = () => { window.close() }
  fill = () => {
    browser.runtime.sendMessage({event: "pass_generated", password: this.genpass()})
    this.save().then(() => {
      window.close()
    })
  }

  siteFocused = (e) =>          {
    this.setState({ sitepassfocused: e.target })
    this.save()
  }
  siteUnfocused = () =>         {
    this.setState({ sitepassfocused: false })
    this.save()
  }
  bump = () =>                  {this.setState({ sitetag: PassHashCommon.bump(this.state.sitetag) })}
  siteTagChange = (e) =>        {this.setState({ sitetag: e.target.value })}
  optionsChange = () =>         {this.setState({ options: !this.state.options })}
  sizeChange = (e) =>           {this.setState({ size: parseInt(e.target.value, 10) })}
  nospecialChange = (e) =>      {this.setState({ nospecial: e.target.checked })}
  digitsonlyChange = (e) =>     {this.setState({ digitsonly: e.target.checked })}
  onedigitChange = (e) =>       {this.setState({ onedigit: e.target.checked })}
  onepuncChange = (e) =>        {this.setState({ onepunc: e.target.checked })}
  upperlowerChange = (e) =>  {this.setState({ upperlower: e.target.checked })}
  masterPasswordChange = (e) => {
    this.setState({
      masterpassword: e.target.value,
      hint: this.hint(e.target.value)
    })
  }

  // This password hint field in passwordhasher ng is brilliant!
  // Thank you mr nielsen!
  hint = password => {
    return password.length <= 0 ? "" :
      PassHashCommon.generateHashWord("hint", password, 2,
        false, false, false, true, false)
  }

  genpass = () => {
    return PassHashCommon.generateHashWord(
      this.state.sitetag, this.state.masterpassword, this.state.size,
      this.state.onedigit, this.state.onepunc, this.state.upperlower,
      this.state.nospecial, this.state.digitsonly)
  }
  pass = () => {
    if (this.state.sitepassfocused) {
      return this.genpass()
    }
    else {
      return (this.state.sitetag.length > 0 && this.state.masterpassword.length > 0)
        ? (new Array(this.state.size + 1).join("x")) // no need to actually generate a pass yet.
        : ""
    }
  }

  render = () => {
    return (
      <div className="browser-style" id="mcpasshash-popup">
        <label id="sitetaglabel" htmlFor="sitetag">Site Tag:</label>
        <label id="masterpasswordlabel" htmlFor="master">Master Password:</label>
        <label id="sitepasswordlabel" htmlFor="password">Site Password:</label>

        <input id="sitetag" onChange={this.siteTagChange} value={this.state.sitetag} type="text" name="sitetag" placeholder="site tag" tabIndex="3"/>
        <input id="masterpassword" onChange={this.masterPasswordChange} type="password" name="masterpassword" placeholder="master password" tabIndex="1"/>
        <div id="masterhint">{this.state.hint}</div>
        <input id="sitepassword" name="sitepassword" placeholder="site password" onFocus={this.siteFocused} onBlur={this.siteUnfocused}
          value={this.pass()} type={this.state.sitepassfocused ? "text" : "password"}/>

        <button id="bump" className="browser-style" onClick={this.bump}>Bump</button>
        <button id="options" className="browser-style" onClick={this.optionsChange}>Options</button>

        <div id="restrictions" className={this.state.options ? "" : "hidden"}>
          <div className="header">Restrictions</div>
          <CheckBox id="nospecial" onChange={this.nospecialChange} checked={this.state.nospecial} desc="No special characters"/>
          <CheckBox id="digitsonly" onChange={this.digitsonlyChange} checked={this.state.digitsonly} desc="Digits only"/>
        </div>

        <div id="requirements" className={this.state.options ? "" : "hidden"}>
          <div className="header">Requirements</div>
          <CheckBox id="onedigit" onChange={this.onedigitChange} checked={this.state.onedigit} desc="At least one digit"/>

          <CheckBox id="onepunc" onChange={this.onepuncChange} disabled={this.state.digitsonly || this.state.nospecial}
            checked={this.state.onepunc && !this.state.digitsonly && !this.state.nospecial} desc="At least one punctuation character"/>
          
          <CheckBox id="upperlower" onChange={this.upperlowerChange} disabled={this.state.digitsonly}
            checked={this.state.upperlower && !this.state.digitsonly} desc="Both upper and lower case characters"/>
        </div>

        <div id="size" className={this.state.options ? "" : "hidden"}>
          <div className="header">Size</div>
          <Sizes onChange={this.sizeChange} currentSize={this.state.size}/>
        </div>
        <button className="browser-style" onClick={this.cancel} id="cancelbutton">Cancel</button>
        <button className="browser-style" onClick={this.fill} id="fillblankbutton" tabIndex="2"
          disabled={this.state.masterpassword.length <= 0 || this.state.sitetag.length <= 0}>
          Fill in Blanks
        </button>
      </div>
    )

    //  <!-- input id="clipboardbutton" type="button" value="Copy To Clipboard" disabled -->
  }
}



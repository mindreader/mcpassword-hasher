import React from "react"
import PropTypes from "prop-types"

export default class CheckBox extends React.Component {
  defaultProps = {
    onChange: () => null,
    checked: false,
    disabled: false,
  }

  propTypes = {
    id: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    checked: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
  }

  render() {
    return (
      <div className="browser-style">
        <input id={this.props.id} onChange={this.props.onChange} type="checkbox"
          name={this.props.id} checked={this.props.checked} disabled={this.props.disabled}/>
        <label htmlFor={this.props.id}>{this.props.desc}</label>
      </div>
    )
  }
}

import React from "react"
import PropTypes from "prop-types"

export default class Sizes extends React.Component {

  propTypes = {
    onChange: PropTypes.func.isRequired,
    currentSize: PropTypes.number.isRequired,
  }
  render() {
    const sizes = [4,6,8,10,12,14,16,18,20,22,24,26].map(size =>
      <div key={size} className="browser-style">
        <input id={"size"+size} onChange={this.props.onChange} type="radio" name="size" value={size}
          checked={this.props.currentSize == size}/>
        <label htmlFor={"size"+size}>{size}</label>
      </div>
    )

    return (

      <div className="buttons">
        {sizes}
      </div>
    )
  }
}

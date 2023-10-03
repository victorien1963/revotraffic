import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Button from 'react-bootstrap/Button'

function LoadingButton(props) {
  const { style, variant, btnText, className, onClick, disabled } = props
  const [clicked, setclicked] = useState(false)
  return (
    <Button
      style={{ minWidth: '4rem', ...style }}
      variant={variant}
      className={className}
      onClick={async (e) => {
        setclicked(true)
        await onClick(e)
        setclicked(false)
      }}
      disabled={clicked || disabled}
    >
      {clicked ? (
        // <Spinner className="m-auto" animation="border" variant="luca" />
        <span className="spinner-border spinner-border-sm" />
      ) : (
        btnText
      )}
    </Button>
  )
}

LoadingButton.propTypes = {
  style: PropTypes.shape(),
  variant: PropTypes.string,
  btnText: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
}

LoadingButton.defaultProps = {
  style: {},
  variant: '',
  btnText: '確 定',
  className: '',
  onClick: () => {},
  disabled: false,
}

export default LoadingButton

import React, { useState, useEffect, useRef } from 'react'
import { Form, Button, InputGroup } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faXmark,
  faCheck,
} from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'

function CustomComboBox({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  name,
  id,
  className = '',
  style = {},
  backgroundColor = '#ffffff',
  textColor = '#212529',
  fontSize = '1rem',
  borderColor = '#ced4da',
  hoverBackgroundColor = '#f8f9fa',
  selectedBackgroundColor = '#e9ecef',
  dropdownWidth = '100%',
  maxHeight = '300px',
  noResultsText = 'No matching options',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [filteredOptions, setFilteredOptions] = useState(options)
  const [selectedOption, setSelectedOption] = useState(null)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  // Find the selected option when value changes
  useEffect(() => {
    if (value === null || value === undefined) {
      setSelectedOption(null)
      return
    }
    const option = options.find((opt) => opt.value === value)
    setSelectedOption(option || null)
  }, [value, options])

  // Update filtered options when filter text changes
  useEffect(() => {
    if (!filterText.trim()) {
      setFilteredOptions(options)
      return
    }
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(filterText.toLowerCase())
    )
    setFilteredOptions(filtered)
  }, [filterText, options])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        // Reset filter text if an option is selected
        if (selectedOption) {
          setFilterText('')
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedOption])

  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        // Focus the input when opening
        setTimeout(() => {
          inputRef.current?.focus()
        }, 0)
      }
    }
  }

  const handleOptionSelect = (option) => {
    setSelectedOption(option)
    onChange(option.value)
    setFilterText('')
    setIsOpen(false)
  }

  const handleInputChange = (e) => {
    setFilterText(e.target.value)
    if (!isOpen) {
      setIsOpen(true)
    }
    // If input is cleared and there was a selected option, clear the selection
    if (e.target.value === '' && selectedOption) {
      setSelectedOption(null)
      onChange(null)
    }
  }

  const handleClearSelection = () => {
    setSelectedOption(null)
    setFilterText('')
    onChange(null)
    inputRef.current?.focus()
  }

  const customStyles = {
    container: {
      position: 'relative',
      width: '100%',
      ...style,
    },
    input: {
      backgroundColor,
      color: textColor,
      fontSize,
      borderColor,
      cursor: disabled ? 'not-allowed' : 'text',
      opacity: disabled ? 0.65 : 1,
    },
    dropdown: {
      width: dropdownWidth,
      maxHeight,
      overflowY: 'auto',
      backgroundColor,
      borderColor,
      borderRadius: '0.375rem',
      boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
    },
    option: {
      backgroundColor,
      color: textColor,
      fontSize,
      cursor: 'pointer',
      padding: '0.5rem 1rem',
      borderBottom: `1px solid ${borderColor}`,
    },
    optionHover: {
      backgroundColor: hoverBackgroundColor,
    },
    selectedOption: {
      backgroundColor: selectedBackgroundColor,
    },
  }

  return (
    <div
      ref={dropdownRef}
      className={`custom-combo-box ${className}`}
      style={customStyles.container}
    >
      <InputGroup>
        <Form.Control
          ref={inputRef}
          type="text"
          value={filterText || selectedOption?.label || ''}
          onChange={handleInputChange}
          onClick={handleToggleDropdown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          name={name}
          id={id}
          aria-label={placeholder}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-controls="dropdown-options"
          style={customStyles.input}
        />
        <InputGroup.Text
          style={{
            backgroundColor,
            borderColor,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {selectedOption && (
            <Button
              variant="link"
              size="sm"
              onClick={handleClearSelection}
              aria-label="Clear selection"
              style={{ padding: '0', marginRight: '0.5rem' }}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faXmark} size="sm" />
            </Button>
          )}
          <FontAwesomeIcon
            icon={faChevronDown}
            onClick={handleToggleDropdown}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </InputGroup.Text>
      </InputGroup>
      {isOpen && (
        <div
          id="dropdown-options"
          className="position-absolute w-100 mt-1 border rounded"
          style={customStyles.dropdown}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const isSelected = selectedOption?.value === option.value
              return (
                <option
                  key={option.value.toString()}
                  className="d-flex align-items-center"
                  style={{
                    ...customStyles.option,
                    ...(isSelected ? customStyles.selectedOption : {}),
                  }}
                  onClick={() => handleOptionSelect(option)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleOptionSelect(option)
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = hoverBackgroundColor
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected
                      ? selectedBackgroundColor
                      : backgroundColor
                  }}
                  tabIndex={0}
                  selected={isSelected}
                >
                  <span className="flex-grow-1">{option.label}</span>
                  {isSelected && (
                    <FontAwesomeIcon
                      icon={faCheck}
                      size="sm"
                      className="ms-2"
                    />
                  )}
                </option>
              )
            })
          ) : (
            <div style={{ ...customStyles.option, cursor: 'default' }}>
              {noResultsText}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

CustomComboBox.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.shape({}),
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string,
  fontSize: PropTypes.string,
  borderColor: PropTypes.string,
  hoverBackgroundColor: PropTypes.string,
  selectedBackgroundColor: PropTypes.string,
  dropdownWidth: PropTypes.string,
  maxHeight: PropTypes.string,
  noResultsText: PropTypes.string,
}

CustomComboBox.defaultProps = {
  value: null,
  placeholder: 'Select an option',
  disabled: false,
  required: false,
  name: '',
  id: '',
  className: '',
  style: {},
  backgroundColor: '#ffffff',
  textColor: '#212529',
  fontSize: '1rem',
  borderColor: '#ced4da',
  hoverBackgroundColor: '#f8f9fa',
  selectedBackgroundColor: '#e9ecef',
  dropdownWidth: '100%',
  maxHeight: '300px',
  noResultsText: 'No matching options',
}

export default CustomComboBox

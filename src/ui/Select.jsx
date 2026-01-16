import React from 'react'
import styles from '../styles/UI/select.module.css'

const Select = React.forwardRef(({
  label,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = "Selecione uma opção",
  error,
  disabled = false,
  required = false,
  name,
  id,
  className = '',
  size = 'medium',
  variant = 'default',
  helpText,
  icon,
  ...props
}, ref) => {
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`

  const sizeClasses = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large
  }

  const variantClasses = {
    default: styles.default,
    outlined: styles.outlined,
    filled: styles.filled
  }

  return (
    <div className={`${styles.selectContainer} ${className}`}>
      {label && (
        <label 
          htmlFor={selectId} 
          className={`${styles.label} ${required ? styles.required : ''}`}
        >
          {label}
          {icon && <span className={styles.labelIcon}>{icon}</span>}
        </label>
      )}
      
      <div className={styles.selectWrapper}>
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`
            ${styles.select}
            ${sizeClasses[size] || ''}
            ${variantClasses[variant] || ''}
            ${error ? styles.error : ''}
            ${disabled ? styles.disabled : ''}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden={!placeholder}>
              {placeholder}
            </option>
          )}
          
          {options.map((option, index) => (
            <option 
              key={option.value || option.id || index}
              value={option.value}
              disabled={option.disabled}
              className={styles.option}
            >
              {option.label || option.text || option}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className={styles.arrow}>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M5 7.5L10 12.5L15 7.5" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={styles.errorIcon}
          >
            <path 
              d="M8 5V8M8 11H8.01M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          {error}
        </div>
      )}
      
      {helpText && !error && (
        <div className={styles.helpText}>{helpText}</div>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
import { type InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
  name: string
  placeholder: string
  errors?: string[]
}

const Input = ({ label, id, name, placeholder, errors, ...rest }: Props) => {
  return (
    <div className='flex flex-col gap-3'>
      <label
        className='pl-3 text-sm'
        htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        placeholder={placeholder}
        aria-describedby={`error-${id}`}
        className='text-md bg-accent-50/20 focus:ring-accent-900 h-12 rounded-3xl px-6 backdrop-blur-sm focus:ring focus:ring-offset-2 focus:ring-offset-transparent focus:outline-0'
        {...rest}
      />
      <div
        id={`error-${id}`}
        className='flex flex-col gap-2'
        role='alert'
        aria-live='assertive'>
        {errors?.map((error, index) => (
          <span
            key={index}
            className='pl-3 text-sm text-red-500'>
            {error}
          </span>
        ))}
      </div>
    </div>
  )
}

export default Input

import Input from './Input'
import Textarea from './Textarea'

interface Props {
  actions: {
    contact: string
  }
  inputErrors?: {
    name?: string[]
    email?: string[]
    message?: string[]
  }
  result?: {
    error?: boolean
  }
}

const ContactForm = ({ actions, inputErrors = {}, result }: Props) => {
  return (
    <form
      id='contact-form'
      className='flex flex-col gap-6 px-3 py-12'
      method='POST'
      action={actions.contact}
      noValidate>
      <Input
        id='contact-form-name'
        label='Your name'
        type='text'
        name='name'
        placeholder='David Hasselhoff'
        errors={inputErrors.name}
        autoComplete='true'
      />

      <Input
        id='contact-form-email'
        label='Your email'
        type='email'
        name='email'
        placeholder='davidhasselhoff@paramount.com'
        errors={inputErrors.email}
        autoComplete='true'
      />

      <Textarea
        id='contact-form-message'
        label='Your message'
        name='message'
        placeholder='Hello, I would like to know more about your services.'
        errors={inputErrors.message}
      />

      <div
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
        aria-hidden='true'>
        <label htmlFor='hp'>hp</label>
        <input
          type='text'
          name='hp'
          id='hp'
          autoComplete='off'
        />
      </div>

      <span
        data-part='result'
        className='text-md pl-3 text-green-700'>
        {result && !result.error && <span>Your email has been sent</span>}
      </span>
    </form>
  )
}

export default ContactForm

import { forwardRef, type ForwardedRef, type HTMLAttributes } from 'react'

const Section = forwardRef<HTMLDivElement, HTMLAttributes<HTMLElement>>(
  ({ children }, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <div
        className='relative'
        ref={ref}>
        {children}
      </div>
    )
  },
)

export default Section

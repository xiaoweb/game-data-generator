import { FC } from 'react'

interface IThrowError {
  error: string
}

export const ThrowError: FC<IThrowError> = ({ error }) => {
  if (error) {
    throw error
  }

  return <></>
}

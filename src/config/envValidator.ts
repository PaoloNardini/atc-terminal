import { makeValidator } from 'envalid'
import _ from 'lodash'

const supportedEnviroments = ['production', 'staging', 'dev', 'qa']

export const appEnvironment = makeValidator(x => {
  if (!_.isString(x)) {
    throw Error('Expected string')
  }

  if (!supportedEnviroments.includes(x)) {
    throw Error(
      `The only supported app environment are ${supportedEnviroments.join(',')}`
    )
  }

  return x
})

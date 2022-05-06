import { port, str, num, cleanEnv } from 'envalid'
import { appEnvironment } from './envValidator'

const env = cleanEnv(
  process.env,
  {
    PORT: port({ default: 8080, desc: 'The port where to listen' }),
    APP_ENV: appEnvironment({
      desc: 'The application environment production, staging or dev',
    }),
    AUDIO: num({ default: 0 }),
    TEST_MODE: num({ default: 0 }),
    DEPARTURES_ENABLED: num({ default: 1 }),
    ARRIVALS_ENABLED: num({ default: 0 }),

    STRIP_ARRIVALS: str({ default: 'ARRIVALS'}),
    STRIP_DEPARTURES:str({ default: 'DEPARTURES'}),

    TALK_GENERAL_PREFIX:str({ default: '!'}),

  },
  { strict: true }
)

export const IS_PRODUCTION = env.isProduction

export const PARAMS = {
  port: env.PORT,
  appEnv: env.APP_ENV,
  audio: env.AUDIO,
  test_mode: env.TEST_MODE,
  departures_enabled: env.DEPARTURES_ENABLED,
  arrivals_enabled: env.ARRIVALS_ENABLED,
  talk_general_prefix: env.TALK_GENERAL_PREFIX,
}

export const STRIP = {
  arrival_label: env.STRIP_ARRIVALS,
  departures_label: env.STRIP_DEPARTURES,
}
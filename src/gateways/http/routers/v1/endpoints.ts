import D from 'debug'
import { Request, Response, Router } from 'express'
import { UseCases } from '../../../../core'

const debug = D('app:routers:apiv1')


export function ApiV1({ useCases }: { useCases: UseCases }): Router {
    const router = Router()

    if (useCases) {
    }

    router.get('/version', async (_: Request, res: Response) => {
        debug('called version')
        res.send('api v1')
    })
  
    return router
  }
  
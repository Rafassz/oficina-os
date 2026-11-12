import express from 'express'
import { jwtMiddleware } from '../../../utils'
import { setupGetMeController, setupLoginController } from '../use-cases'

const loginSetup = setupLoginController()
const getMeSetup = setupGetMeController()

const router = express.Router()

router.post('/login', async (req, res) => {
  loginSetup.handle(req, res)
})

router.get('/me', jwtMiddleware, async (req, res) => {
  getMeSetup.handle(req, res)
})

export { router as authenticationRoutes }

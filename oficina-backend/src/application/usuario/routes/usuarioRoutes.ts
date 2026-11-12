import express from 'express'
import { jwtMiddleware } from '../../../utils'
import { setupCreateUsuarioController, setupGetAllUsuariosController } from '../use-cases'

const getAllUsuariosSetup = setupGetAllUsuariosController()
const createUsuarioSetup = setupCreateUsuarioController()

const router = express.Router()

router.get('/', jwtMiddleware, async (req, res) => {
  getAllUsuariosSetup.handle(req, res)
})

router.post('/', jwtMiddleware, async (req, res) => {
  createUsuarioSetup.handle(req, res)
})

export { router as usuarioRoutes }

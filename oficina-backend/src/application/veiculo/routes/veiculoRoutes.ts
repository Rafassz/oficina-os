import express from 'express'
import { jwtMiddleware } from '../../../utils'
import { setupCreateVeiculoController, setupGetVeiculosByPlacaController, setupUpdateVeiculoController } from '../use-cases'

const getVeiculosByPlacaSetup = setupGetVeiculosByPlacaController()
const createVeiculoSetup = setupCreateVeiculoController()
const updateVeiculoSetup = setupUpdateVeiculoController()

const router = express.Router()

router.get('/', jwtMiddleware, async (req, res) => {
  getVeiculosByPlacaSetup.handle(req, res)
})

router.post('/', jwtMiddleware, async (req, res) => {
  createVeiculoSetup.handle(req, res)
})

router.put('/:IdVeiculo', jwtMiddleware, async (req, res) => {
  updateVeiculoSetup.handle(req, res)
})

export { router as veiculoRoutes }

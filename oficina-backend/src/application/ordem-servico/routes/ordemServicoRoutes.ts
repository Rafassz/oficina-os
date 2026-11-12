import express from 'express'
import { jwtMiddleware } from '../../../utils'
import {
  setupCreateOrdemController,
  setupGetAllOrdensController,
  setupGetOrdemByIdController,
  setupMudarStatusOrdemController,
  setupUpdateOrdemController,
} from '../use-cases'

const getAllOrdensSetup = setupGetAllOrdensController()
const getOrdemByIdSetup = setupGetOrdemByIdController()
const createOrdemSetup = setupCreateOrdemController()
const updateOrdemSetup = setupUpdateOrdemController()
const mudarStatusOrdemSetup = setupMudarStatusOrdemController()

const router = express.Router()

router.get('/', jwtMiddleware, async (req, res) => {
  getAllOrdensSetup.handle(req, res)
})

router.get('/:IdOrdemServico', jwtMiddleware, async (req, res) => {
  getOrdemByIdSetup.handle(req, res)
})

router.post('/', jwtMiddleware, async (req, res) => {
  createOrdemSetup.handle(req, res)
})

router.put('/:IdOrdemServico', jwtMiddleware, async (req, res) => {
  updateOrdemSetup.handle(req, res)
})

router.post('/:IdOrdemServico/status', jwtMiddleware, async (req, res) => {
  mudarStatusOrdemSetup.handle(req, res)
})

export { router as ordemServicoRoutes }

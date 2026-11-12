import express from 'express'
import { jwtMiddleware } from '../../../utils'
import {
  setupCreateClienteController,
  setupDeleteClienteController,
  setupGetAllClientesController,
  setupGetClienteDetalheController,
  setupUpdateClienteController,
} from '../use-cases'

const getAllClientesSetup = setupGetAllClientesController()
const getClienteDetalheSetup = setupGetClienteDetalheController()
const createClienteSetup = setupCreateClienteController()
const updateClienteSetup = setupUpdateClienteController()
const deleteClienteSetup = setupDeleteClienteController()

const router = express.Router()

router.get('/', jwtMiddleware, async (req, res) => {
  getAllClientesSetup.handle(req, res)
})

router.get('/:IdCliente', jwtMiddleware, async (req, res) => {
  getClienteDetalheSetup.handle(req, res)
})

router.post('/', jwtMiddleware, async (req, res) => {
  createClienteSetup.handle(req, res)
})

router.put('/:IdCliente', jwtMiddleware, async (req, res) => {
  updateClienteSetup.handle(req, res)
})

router.delete('/:IdCliente', jwtMiddleware, async (req, res) => {
  deleteClienteSetup.handle(req, res)
})

export { router as clienteRoutes }

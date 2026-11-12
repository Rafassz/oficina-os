import express from 'express'
import { jwtMiddleware } from '../../../utils'
import { setupGetDashboardSummaryController } from '../use-cases'

const getDashboardSummarySetup = setupGetDashboardSummaryController()

const router = express.Router()

router.get('/', jwtMiddleware, async (req, res) => {
  getDashboardSummarySetup.handle(req, res)
})

export { router as dashboardRoutes }

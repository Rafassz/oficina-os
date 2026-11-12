import mongoose from 'mongoose'
import { env } from '../../env'

export const setupMongoDB = async (uri: string = env.mongo_uri) => {
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  console.log('\x1b[33m%s\x1b[0m', 'MongoDB conectado em', `${mongoose.connection.host}/${mongoose.connection.name}`)
}

export const closeMongoDB = () => mongoose.disconnect()

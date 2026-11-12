export interface IEnv {
  dev_mode: boolean
  server_port: number
  mongo_uri: string
  jwt_secret: string
  jwt_expires_in: string
  web_origin: string
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const naoEncontrado = (o_que: string) => new HttpError(404, `${o_que} não encontrado(a)`);

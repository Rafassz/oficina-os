// Node 22+ tem um localStorage global próprio (experimental) que fica por cima do jsdom
// e não funciona sem configuração. Nos testes usamos um Storage em memória.
class StorageEmMemoria implements Storage {
  private dados = new Map<string, string>()
  get length() {
    return this.dados.size
  }
  clear() {
    this.dados.clear()
  }
  getItem(chave: string) {
    return this.dados.get(chave) ?? null
  }
  key(i: number) {
    return [...this.dados.keys()][i] ?? null
  }
  removeItem(chave: string) {
    this.dados.delete(chave)
  }
  setItem(chave: string, valor: string) {
    this.dados.set(chave, String(valor))
  }
}

Object.defineProperty(globalThis, 'localStorage', { value: new StorageEmMemoria(), configurable: true })

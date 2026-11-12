import { documento, lerMoeda, linkWhatsApp, numeroOS, placa, telefone } from '..'

describe('formatters', () => {
  it.each([
    ['1.250,90', 125090],
    ['1250.9', 125090],
    ['80', 8000],
    ['R$ 0,99', 99],
    ['', 0],
    ['abc', 0],
  ])('lerMoeda(%s) = %d centavos', (texto, centavos) => {
    expect(lerMoeda(texto)).toBe(centavos)
  })

  it('placa antiga ganha hífen, Mercosul não', () => {
    expect(placa('EZP4410')).toBe('EZP-4410')
    expect(placa('ABC1D23')).toBe('ABC1D23')
  })

  it('telefone fixo e celular', () => {
    expect(telefone('11987451230')).toBe('(11) 98745-1230')
    expect(telefone('1155214477')).toBe('(11) 5521-4477')
  })

  it('CPF e CNPJ', () => {
    expect(documento('32165498700')).toBe('321.654.987-00')
    expect(documento('12345678000190')).toBe('12.345.678/0001-90')
    expect(documento(undefined)).toBe('')
  })

  it('número da OS com zeros à esquerda', () => {
    expect(numeroOS(1047)).toBe('01047')
  })

  it('link do WhatsApp com DDI e mensagem codificada', () => {
    expect(linkWhatsApp('(11) 98745-1230', 'Carro pronto!')).toBe('https://wa.me/5511987451230?text=Carro%20pronto!')
  })
})

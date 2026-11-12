// Variáveis que os testes precisam (os UseCases geram e leem tokens de verdade)
process.env.JWT_SECRET = 'segredo-dos-testes'
process.env.JWT_EXPIRES_IN = '1h'
process.env.DEV_MODE = 'false'

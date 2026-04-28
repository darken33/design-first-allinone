export default {
  hello: {
    input: {
      target: './specs/001-hello-api-node/openapi.yaml'
    },
    output: {
      target: './src/generated/types.ts',
      schemas: './src/generated/schemas',
      mode: 'types_only'
    }
  }
};

// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    overrides: {
      typescript: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        'no-console': 'off',
      },
    },
  },
)

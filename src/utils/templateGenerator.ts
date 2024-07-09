import { IDependencyMap } from '../interfaces/IDependencyPath'
import { IMethod } from '../interfaces/IMethod'

export const generateTestTemplate = (
  className: string,
  dependencies: string[],
  dependencyImportPaths: IDependencyMap,
  methods: IMethod[]
): string => {
  const dependencyImports = generateDependencyImports(dependencyImportPaths, className)
  const mockInstances = dependencies.map(dep => `const ${lowerCaseFirstLetter(dep)} = mocker.createMockInstance(${dep})`).join('\n  ')

  const describeBlock = `describe('${className}', () => {
  const mocker = AutoMocker.createJestMocker(jest)
  ${mockInstances}

  beforeEach(() => {
    jest.resetAllMocks()
  })`

  const methodTests = methods.map(method => `describe('${method.name}', () => {
    it('should ', ${method.isAsync ? 'async ' : ''}() => {
      // Arrange
      const instance = create${className}()
      
      // Act
      
      // Assert
      })
    })`).join('\n\n  ')

  const createInstanceFunction = `
  function create${className}(): ${className} {
    return new ${className}(
      ${dependencies.map(dep => `${lowerCaseFirstLetter(dep)},`).join('\n      ')}
    )
  }`

  const template = `${dependencyImports}

${describeBlock}

  ${methodTests}

  ${createInstanceFunction}
})`

  return template
}

const lowerCaseFirstLetter = (word: string): string => {
  return word.charAt(0).toLocaleLowerCase() + word.slice(1)
}

const generateDependencyImports = (dependencyImportPaths: IDependencyMap, className: string): string => {
  const importStatements: string[] = []

  importStatements.push(`import { AutoMocker } from 'automocker'`)
  importStatements.push(`import { ${className} } from '../${className}'`)

  for (const [path, dependencies] of Object.entries(dependencyImportPaths)) {
    let actualPath = path

    if (path.startsWith('./')) {
      actualPath = ('../').concat(path.substring(2))
    } else if (path.startsWith('../')) {
      actualPath = ('../').concat(path)
    } else if (path.startsWith('@')) {
      const importNames = dependencies.map(dep => dep.split('/').pop())
      const importStatement = `import { ${importNames.join(', ')} } from '${actualPath}'`
      
      importStatements.unshift(importStatement)

      continue
    }

    const importNames = dependencies.map(dep => dep.split('/').pop())
    const importStatement = `import { ${importNames.join(', ')} } from '${actualPath}'`

    importStatements.push(importStatement)
  }

  return importStatements.join('\n')
}
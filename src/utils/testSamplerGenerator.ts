import { parseClassName, parseDependencies, parseDependencyImportPaths, parsePublicMethods } from './parsers'
import { generateTestTemplate } from './templateGenerator'


export const generateTestSample = (nestJsClass: string) => {
  const className = parseClassName(nestJsClass)
  const dependencies = parseDependencies(nestJsClass)
  const dependencyImportPaths = parseDependencyImportPaths(nestJsClass, dependencies!)
  const publicMethods = parsePublicMethods(nestJsClass)

  if (!className || !dependencies || !dependencyImportPaths || !publicMethods) {
    throw new Error('Invalid Nest.js class')
  }

  return generateTestTemplate(className, dependencies, dependencyImportPaths, publicMethods)
}


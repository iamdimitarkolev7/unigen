import * as ts from 'typescript'
import { IMethod } from '../interfaces/IMethod'
import { IDependencyMap } from '../interfaces/IDependencyPath'

export const parseDependencies = (nestJsClass: string): string[] | null => {
  const sourceFile = ts.createSourceFile('temp.ts', nestJsClass, ts.ScriptTarget.Latest, true)
  const dependencies: string[] = []

  const visitNode = (node: ts.Node) => {
    if (ts.isConstructorDeclaration(node)) {
      node.parameters.forEach(param => {
        if (ts.isParameter(param)) {
          const type = param.type
          if (type && ts.isTypeReferenceNode(type)) {
            const dependency = type.typeName.getText(sourceFile)
            dependencies.push(dependency)
          }
        }
      })
    }
    ts.forEachChild(node, visitNode)
  }

  visitNode(sourceFile)

  return dependencies
}

export const parseDependencyImportPaths = (nestJsClass: string, dependencies: string[]): IDependencyMap => {
  const sourceFile = ts.createSourceFile('temp.ts', nestJsClass, ts.ScriptTarget.Latest, true)
  const dependencyMap: IDependencyMap = {}

  ts.forEachChild(sourceFile, node => {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier

      if (ts.isStringLiteral(moduleSpecifier)) {
        const path = moduleSpecifier.text
        const importClause = node.importClause

        if (importClause && importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
          const dependenciesInImport = importClause.namedBindings.elements.map(element => element.getText())
          const filteredDependencies = dependenciesInImport.filter(dep => dependencies.includes(dep))

          if (filteredDependencies.length > 0) {
            dependencyMap[path] = filteredDependencies
          }
        }
      }
    }
  })

  return dependencyMap
}

export const parseClassName = (nestJsClass: string): string | null => {
  const sourceFile = ts.createSourceFile('temp.ts', nestJsClass, ts.ScriptTarget.Latest, true)
  let className: string | null = null

  const visitNode = (node: ts.Node) => {
    if (ts.isClassDeclaration(node)) {
      className = node.name ? node.name.getText(sourceFile) : null
      return
    }

    ts.forEachChild(node, visitNode)
  }

  visitNode(sourceFile)

  return className
}

export const parsePublicMethods = (sourceCode: string): IMethod[] => {
  const sourceFile = ts.createSourceFile('temp.ts', sourceCode, ts.ScriptTarget.Latest, true)
  const publicMethods: IMethod[] = []

  const visitNode = (node: ts.Node) => {
    if (ts.isMethodDeclaration(node) && !node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.PrivateKeyword)) {
      const methodName = node.name.getText(sourceFile)
      const isAsync = !!node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.AsyncKeyword)

      publicMethods.push({ name: methodName, isAsync })
    }
    
    ts.forEachChild(node, visitNode)
  }

  visitNode(sourceFile)

  return publicMethods
}
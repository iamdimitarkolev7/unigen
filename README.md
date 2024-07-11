# unigen

A package that helps us setting up our Nest.js class unit testing
___

# Installation

```
$ npm i -g unigen
$ npm i --save unigen
```

# Example usage
Let's say this is our class named NestJsClass.ts: 
```
import { SomeDependency1 } from './SomeDependency1'
import { SomeDependency2 } from '../../SomeDependency2'

export class NestJsClass {
  constructor(
    private readonly someDependency1: SomeDependency1,
    private readonly someDependency1: SomeDependency2,
  ) {}

  async foo1(): Promise<void> {
    // Some code
  }

  private async foo2() {
    // Some code
  }
}

```
In order to use the package run **unigen NestJsClass** in the terminal

Then the unigen package finds recursively the exact __ tests __ folder in which our NestJsClass.spec.ts test file will be created. If there is not such folder it will create one. The generated class template will be: 

```
import { AutoMocker } from 'automocker'
import {NestJsClass} from '../NestJsClass'
import { SomeDependency1 } from '../SomeDependency1'
import { SomeDependency2 } from '../../../SomeDependency2'

describe('NestJsClass', () => {
  const mocker = AutoMocker.createJestMocker(jest)
  const someDependency1 = mocker.createMockInstance(SomeDependency1)
  const someDependency2 = mocker.createMockInstance(SomeDependency2)

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('foo1', () => {
    it('should ', async () => {
      // Arrange
      const instance = createNestJsClass();
      
      // Act
      
      // Assert
      })
    })

  
  function createNestJsClass(): NestJsClass {
    return new NestJsClass(
      someDependency1,
      someDependency2,
    )
  }
})
```


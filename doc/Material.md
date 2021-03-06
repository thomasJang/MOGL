# Material
* [Constructor](#constructor)

**method**

* [addVertexShader](#addvertexshader-idstring-)
* [getVertexCount](#getvertexcount)
* [getTriangleCount](#gettrianglecount)
* [getVolume](#getvolume)
* [removeVertexShader](#removevertexshader-idstring-)

**const**

* [Geometry.x](#geometryx)
* [Geometry.y](#geometryy)
* [Geometry.z](#geometryz)
* [Geometry.r](#geometryr)
* [Geometry.g](#geometryg)
* [Geometry.b](#geometryb)
* [Geometry.a](#geometrya)
* [Geometry.normalX](#geometrynormalx)
* [Geometry.normalY](#geometrynormaly)
* [Geometry.normalZ](#geometrynormalz)

[top](#)
## Constructor

```javascript
Geometry( vertexBuffer:Array, indexBuffer:Array[, vertexInfo:Array]  )
```

**description**

정점배열과 인덱스 배열을 이용하여 기하구조를 정의함.
* 생성자에서 지정된 버퍼 및 정보는 변경불가로 읽기만 가능함.

**param**

1. vertexBuffer:Array or TypedArray - 정점 배열.
2. indexBuffer:Array or TypedArray - 인덱스배열.
3. ?vertexInfo:Array - 정점하나에 대한 정의. 생략시에는 ['x', 'y', 'z']로 정의됨. 다음과 같은 상수항을 사용할 수 있음.
    * Geometry.x or 'x' - x좌표.
    * Geometry.y or 'y' - y좌표.
    * Geometry.z or 'z' - z좌표.
    * Geometry.r or 'r' - 색상Red값.
    * Geometry.g or 'g' - 색상Green값.
    * Geometry.b or 'b' - 색상Blue값.
    * Geometry.a or 'a' - 색상Alpha값.
    * Geometry.normalX or 'nx' - 법선벡터의 x값.
    * Geometry.normalY or 'ny' - 법선벡터의 y값.
    * Geometry.normalZ or 'nz' - 법선벡터의 z값.

**sample**

```javascript
var cube = new Geometry( 
    //vertexBuffer
    [1,0,0, 0,0,1, 0,1,1,
     1,0,0, 0,0,1, 0,1,1, 
     1,0,0, 0,0,1, 0,1,1],
    //indexBuffer
    [0,1,2, 2,3,4, 4,5,6],
    //vertextInfo
    [Geometry.x, Geometry.y, Geometry.z]
);
```

[top](#)
## addVertexShader( id:string )

**description**

Mesh를 통해 최종적으로 포함될 Scene에 등록된 shader를 사용함.
* Scene에 직접 등록되는 경우는 id를 addGeometry 시점에 평가함.
* Mesh에서 직접 생성하여 삽입하는 경우는 addMesh시점에 평가함.
* 이미 직간접적으로 Scene에 포함된 경우는 메서드호출시점에 평가함.

**param**

1. id:string - 최종 포함될 Scene에 등록된 vertex shader의 id.

**return**

Geometry - 메서드체이닝을 위해 자신을 반환함.

**sample**

```javascript
var lobby = world.getScene('lobby');

// waffle shader등록
lobby.addVertexShader( 'waffle', vshader );

// Geometry 생성 및 Scene 등록
var cube = lobby.addGeometry( 'cube', new Geometry( v1, i1 ) );

//이미 Scene에 등록된 Geometry므로 메서드 호출시점에 평가
cube.addVertexShader( 'waffle' )  //waffle shader가 존재하지 않으면 에러

//미등록된 Geometry
var sample = new Geometry( v2, i2, info2 );
sample.addVertexShader('aaa')  //미등록객체는 무조건 통과됨
```

[top](#)
## getVertexCount()

**description**

Geometry에 정의된 정점의 갯수.

**param**

없음.

**return**

number - Geometry에 정의된 정점의 갯수.

**sample**

```javascript
var cube = world.getScene('lobby').getGeometry('cube');
var vcount = cube.getVertexCount();
```

[top](#)
## getTriangleCount()

**description**

Geometry에 정의된 삼각면의 갯수.

**param**

없음

**return**

number - Geometry에 정의된 삼각면의 갯수.

**sample**

```javascript
var cube = world.getScene('lobby').getGeometry('cube');
var tcount = cube.getTriangleCount();
```

[top](#)
## getVolume()

**description**

x,y,z축 기준의 크기를 배열로 반환함.

**param**

없음

**return**

TypedArray - [x크기, y크기, z크기] 형태의 배열. 매번 같은 객체를 반환하고 수정해도 반영되지 않는 읽기 전용.

**sample**

```javascript
var cube = world.getScene('lobby').getGeometry('cube');
var sizeX = cube.getVolume()[0];
```

[top](#)
## removeVertexShader( id:string )

**description**

addVertexShader를 통해 등록한 shader를 제거함.

**param**

1. id:string - addVertexShader에서 지정한 id.

**return**

Geometry - 메서드 체이닝을 위해 자신을 반환함.

**sample**

```javascript
var cube = lobby.addGeometry( 'cube', new Geometry( v1, i1 ) );
cube.addVertexShader('waffle').removeVertexShader('waffle');
```

[top](#)
## Geometry.x

**description**

개별 정점요소의 정보. x좌표. 'x'

[top](#)
## Geometry.y

**description**

개별 정점요소의 정보. y좌표. 'y'

[top](#)
## Geometry.z

**description**

개별 정점요소의 정보. z좌표. 'z'

[top](#)
## Geometry.r

**description**

개별 정점요소의 정보. 색상 Red값. 'r'

[top](#)
## Geometry.g

**description**

개별 정점요소의 정보. 색상 Green값. 'g'

[top](#)
## Geometry.b

**description**

개별 정점요소의 정보. 색상 Blue값. 'b'

[top](#)
## Geometry.a

**description**

개별 정점요소의 정보. 색상 Alpha값. 'a'

[top](#)
## Geometry.normalX

**description**

개별 정점요소의 정보. 법선 벡터의 x값. 'nx'

[top](#)
## Geometry.normalY

**description**

개별 정점요소의 정보. 법선 벡터의 y값. 'ny'

[top](#)
## Geometry.normalZ

**description**

개별 정점요소의 정보. 법선 벡터의 z값. 'nz'

[top](#)

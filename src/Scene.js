/**
 * Created by redcamel on 2015-05-05.
 */
'use strict'
var Scene = (function () {
    var Scene, fn;
    Scene = function Scene() {
        this._update=0
        this._cvs = null,
        // for JS
        this._children = {},
        this._cameras={},
        this._textures = {},
        this._materials = {},
        this._geometrys = {},
        this._vertexShaders = {},
        this._fragmentShaders = {}
        // for GPU
        this._gl = null,
        this._glVBOs = {},
        this._glUVBOs = {},
        this._glIBOs = {},
        this._glPROGRAMs = {},
        this._glTEXTUREs ={},
        this._glFREAMBUFFERs ={}

        var baseVertexShader = {
            attributes: ['vec3 aVertexPosition'],
            uniforms: ['mat4 uPixelMatrix','mat4 uCameraMatrix','vec3 uRotate', 'vec3 uScale', 'vec3 uPosition', 'vec3 uColor'],
            varyings: ['vec3 vColor'],
            function: [VertexShader.baseFunction],
            main: ['' +
            'gl_Position = uPixelMatrix*uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale)*vec4(aVertexPosition, 1.0);\n' +
            'vColor = uColor ;']
        }
        var baseFragmentShader = {
            precision: 'mediump float',
            uniforms: [],
            varyings: ['vec3 vColor'],
            function: [],
            main: ['gl_FragColor =  vec4(vColor, 1.0)']
        }

        var bitmapVertexShader = {
            attributes: ['vec3 aVertexPosition', 'vec2 aUV'],
            uniforms: ['mat4 uPixelMatrix','mat4 uCameraMatrix','vec3 uRotate', 'vec3 uScale', 'vec3 uPosition'],
            varyings: ['vec2 vUV'],
            function: [VertexShader.baseFunction],
            main: ['' +
            'gl_Position = uPixelMatrix*uCameraMatrix*positionMTX(uPosition)*rotationMTX(uRotate)*scaleMTX(uScale)*vec4(aVertexPosition, 1.0);\n' +
            'vUV = aUV;'
            ]
        }
        var bitmapFragmentShader = {
            precision: 'mediump float',
            uniforms: ['sampler2D uSampler'],
            varyings: ['vec2 vUV'],
            function: [],
            main: ['gl_FragColor =  texture2D(uSampler, vec2(vUV.s, vUV.t))']
        }
        this.addVertexShader('base', baseVertexShader);
        this.addFragmentShader('base', baseFragmentShader);
        this.addVertexShader('bitmap', bitmapVertexShader);
        this.addFragmentShader('bitmap', bitmapFragmentShader);
    }
    /////////////////////////////////////////////////////////////////
    var makeVBO = function makeVBO(self, name, data, stride) {
        var gl = self._gl,buffer = self._glVBOs[name]
        if (buffer) return buffer
        buffer = gl.createBuffer(),
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer),
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW),
        buffer.name = name,
        buffer.type = 'VBO',
        buffer.data = data,
        buffer.stride = stride,
        buffer.numItem = data.length / stride,
        self._glVBOs[name] = buffer,
        console.log('VBO생성', self._glVBOs[name])
        return self._glVBOs[name]
    }

    var makeIBO = function makeIBO(self, name, data, stride) {
        var gl = self._gl, buffer = self._glIBOs[name]
        if (buffer) return buffer
        buffer = gl.createBuffer(),
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer),
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW),
        buffer.name = name,
        buffer.type = 'IBO',
        buffer.data = data,
        buffer.stride = stride,
        buffer.numItem = data.length / stride,
        self._glIBOs[name] = buffer,
        console.log('IBO생성', self._glIBOs[name])
        return self._glIBOs[name]
    }

    var makeUVBO = function makeUVBO(self, name, data, stride) {
        var gl = self._gl,buffer = self._glUVBOs[name]
        if (buffer) return buffer
        buffer = gl.createBuffer(),
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer),
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW),
            buffer.name = name,
            buffer.type = 'UVBO',
            buffer.data = data,
            buffer.stride = stride,
            buffer.numItem = data.length / stride,
            self._glUVBOs[name] = buffer,
            console.log('UVBO생성', self._glUVBOs[name])
        return self._glUVBOs[name]
    }

    var makeProgram = function makeProgram(self, name) {
        var gl = self._gl, vShader, fShader, program,i
        vShader = vertexShaderParser( self,self._vertexShaders[name]),
        fShader = fragmentShaderParser(self,self._fragmentShaders[name]),
        program = gl.createProgram(),
        gl.attachShader(program, vShader),
        gl.attachShader(program, fShader),
        gl.linkProgram(program),
        vShader.name = name + '_vertex', fShader.name = name + '_fragment', program.name = name
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) MoGL.error(name, ' 프로그램 쉐이더 초기화 실패!', 0)
        gl.useProgram(program)
        for (i = 0; i < vShader.attributes.length; i++) {
            gl.bindBuffer(gl.ARRAY_BUFFER, self._glVBOs['null']),
            gl.enableVertexAttribArray(program[vShader.attributes[i]] = gl.getAttribLocation(program, vShader.attributes[i])),
            gl.vertexAttribPointer(program[vShader.attributes[i]], self._glVBOs['null'].stride, gl.FLOAT, false, 0, 0)
        }
        for (i = 0; i < vShader.uniforms.length; i++) {
            program[vShader.uniforms[i]] = gl.getUniformLocation(program, vShader.uniforms[i])
        }
        self._glPROGRAMs[name] = program
        console.log(vShader)
        console.log(fShader)
        console.log(program)
        return program
    }

    var vertexShaderParser = function vertexShaderParser(self, source) {
        var gl=self._gl,t0, len, i, resultStr,shader = gl.createShader(gl.VERTEX_SHADER)
        shader.uniforms = [],
        shader.attributes = [],
        resultStr = "", t0 = source.attributes, len = t0.length;
        for (i = 0; i < len; i++) {
            resultStr += 'attribute ' + t0[i] + ';\n',
            shader.attributes.push(t0[i].split(' ')[1])
        }
        t0 = source.uniforms, len = t0.length
        for (i = 0; i < len; i++) {
            resultStr += 'uniform ' + t0[i] + ';\n',
            shader.uniforms.push(t0[i].split(' ')[1])
        }
        t0 = source.varyings, len = t0.length
        for (i = 0; i < len; i++) {
            resultStr += 'varying ' + t0[i] + ';\n'
        }
        resultStr += VertexShader.baseFunction,
        resultStr += 'void main(void){\n',
        resultStr += source.main + ';\n',
        resultStr += '}\n',
        console.log(resultStr),
        gl.shaderSource(shader, resultStr),
        gl.compileShader(shader)
        return shader
    }
    var fragmentShaderParser = function fragmentShaderParser(self,source){
        var gl=self._gl,resultStr = "", i,t0,len,shader = gl.createShader(gl.FRAGMENT_SHADER);
        shader.uniforms = []
        if(source.precision) resultStr+='precision '+source.precision+';\n'
        else resultStr+='precision mediump float;\n'
        t0 = source.uniforms, len = t0.length
        for(i=0; i<len; i++) {
            resultStr += 'uniform '+t0[i]+';\n',
            shader.uniforms.push(t0[i].split(' ')[1])
        }
        t0=source.varyings,len = t0.length
        for(i=0; i<len; i++) {
            resultStr += 'varying '+t0[i]+';\n'
        }
        resultStr+='void main(void){\n',
        resultStr+=source.main+';\n',
        resultStr+='}\n',
        gl.shaderSource(shader, resultStr), gl.compileShader(shader),
        shader.uniforms = source.uniforms
        return shader
    }
    var makeTexture = function makeTexture(self, id,image) {
        var gl = self._gl, texture = self._glTEXTUREs[id];
        if (texture) return texture
        texture = gl.createTexture(),
        //TODO 일단 이미지만
        texture.img = new Image()
        console.log(typeof image,image)
        if (image instanceof ImageData) texture.img.src = image.data
        else if(image instanceof HTMLCanvasElement) texture.img.src = image.toDataURL()
        else if (image instanceof HTMLImageElement) texture.img.src = image.src
        else if (image['substring'] && image.substring(0, 10) == 'data:image' && image.indexOf('base64') > -1) texture.img.src = image //base64문자열 - urlData형식으로 지정된 base64문자열
        else if (typeof image == 'string') texture.img.src = image
        //TODO 비디오 처리

        texture.img.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D, texture),
            //TODO 다변화 대응해야됨
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.img);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE),
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE),
            gl.generateMipmap(gl.TEXTURE_2D)
            gl.bindTexture(gl.TEXTURE_2D, null)
            texture.loaded=1
        }
        texture.data = image
        self._glTEXTUREs[id] = texture
        return texture
    }

    var makeFrameBuffer = function makeFrameBuffer(self, camera){
        //TODO 프레임 버퍼 크기가 2n승이 아닐떄 처리
        var gl =self._gl
        var framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        framebuffer.x = camera._renderArea[0];
        framebuffer.y = camera._renderArea[1];
        framebuffer.width = camera._renderArea[2];
        framebuffer.height = camera._renderArea[3]

        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture),
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer.width, framebuffer.height,0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE),
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE),
        gl.generateMipmap(gl.TEXTURE_2D);


        var renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer),
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, framebuffer.width, framebuffer.height),
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture,0),
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer),
        gl.bindTexture(gl.TEXTURE_2D, null),
        gl.bindRenderbuffer(gl.RENDERBUFFER, null),
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        self._glFREAMBUFFERs[camera.uuid] = {
            frameBuffer : framebuffer,
            texture : texture
        }
    }
/////////////////////////////////////////////////////////////////
    fn = Scene.prototype,
    fn.update = function update() { MoGL.isAlive(this);
        this._glVBOs['null'] = makeVBO(this, 'null', new Float32Array([0.0,0.0,0.0]), 3)
        //for GPU
        for (var k in this._children) {
            var mesh = this._children[k], name, geo = mesh._geometry;
            if (!this._glVBOs[mesh._geometry] && mesh._geometry) {
                name = geo._name,
                this._glVBOs[name] = makeVBO(this, name, geo._position, 3),
                this._glUVBOs[name] = makeUVBO(this, name, geo._uv, 2),
                this._glIBOs[name] = makeIBO(this, name, geo._index, 1)
            }
        }
        if (!this._glVBOs['rect']) {
            this.addGeometry('rect', new Geometry([
                1.0, 1.0, 0.0, 0.0, 0.0,
                -1.0, 1.0, 0.0, 1.0, 0.0,
                1.0, -1.0, 0.0, 0.0, 1.0,
                -1.0, -1.0, 0.0, 1.0, 1.0
            ], [0, 1, 2, 1, 2, 3], [Vertex.x, Vertex.y, Vertex.z, Vertex.u, Vertex.v])),
            this._glVBOs['rect'] = makeVBO(this, 'rect', [1.0, 1.0, 0.0,-1.0, 1.0, 0.0,1.0, -1.0, 0.0,-1.0, -1.0, 0.0], 3),
            this._glUVBOs['rect'] = makeUVBO(this, 'rect', [0.0, 0.0,1.0, 0.0,0.0, 1.0,1.0, 1.0], 2),
            this._glIBOs['rect'] = makeIBO(this, 'rect', [0, 1, 2, 1, 2, 3], 1)
        }
        for (k in this._cameras) {
            var camera = this._cameras[k]
            camera._cvs = this._cvs
            if (!camera._renderArea) camera.setRenderArea(0, 0, this._cvs.width, this._cvs.height)
            camera.getProjectionMatrix()

            if(camera._updateRenderArea){
                makeFrameBuffer(this,camera)
                camera._updateRenderArea = 0
            }
        }
        var checks = this._vertexShaders;
        for (k in checks) makeProgram(this, k)

        console.log('////////////////////////////////////////////'),
        console.log('Scene 업데이트'),
        console.log('this._glVBOs :',this._glVBOs),
        console.log('this._glIBOs :',this._glIBOs),
        console.log('this._glPROGRAMs :',this._glPROGRAMs),
        console.log('this._geometrys :',this._geometrys),
        console.log('this._materials :',this._materials),
        console.log('this._textures :',this._textures),
        console.log('this._vertexShaders :',this._vertexShaders),
        console.log('this._fragmentShaders :',this._fragmentShaders),
        console.log('this._glFREAMBUFFERs :',this._glFREAMBUFFERs),
        console.log('////////////////////////////////////////////'),
        this._update = 0
    },
    fn.addChild = function addChild(id, mesh) { MoGL.isAlive(this); // isAlive는 함수선언 줄에 바로 같이 씁니다.
        var k, checks;
        if (this._children[id]) MoGL.error('Scene', 'addChild', 0)
        if (!(mesh instanceof Mesh)) MoGL.error('Scene', 'addChild', 1)
        mesh._scene = this,mesh._parent = this,
        mesh.setGeometry(mesh._geometry),
        mesh.setMaterial(mesh._material),
        mesh._material._count++,
        checks = mesh._geometry._vertexShaders;
        for (k in checks) if (typeof checks[k] == 'string') if (!this._vertexShaders[checks[k]]) MoGL.error('Scene', 'addChild', 2)
        checks = mesh._material._fragmentShaders;
        for (k in checks) if (typeof checks[k] == 'string') if (!this._fragmentShaders[checks[k]]) MoGL.error('Scene', 'addChild', 3)
        checks = mesh._material._textures;
        for (k in checks)
            if (typeof checks[k] == 'string')
                if (!this._textures[checks[k]]) MoGL.error('Scene', 'addChild', 4)
                else {
                    console.log(mesh._material._textures),
                    console.log(checks[k]),
                    mesh._material._textures[checks[k]] = this._textures[checks[k]]
                }
        if(mesh instanceof Camera) this._cameras[id] = mesh,mesh._cvs = this._cvs
        else this._children[id] = mesh
        this._update=1
        return this
    },
    fn.addGeometry = function (id, geometry) { MoGL.isAlive(this);
        if (this._geometrys[id]) MoGL.error('Scene', 'addGeometry', 0)
        if (!(geometry instanceof Geometry)) MoGL.error('Scene', 'addGeometry', 1)
        var checks = geometry._vertexShaders, k;
        for (k in checks) if (typeof checks[k] == 'string') if (!this._vertexShaders[checks[k]]) MoGL.error('Scene', 'addGeometry', 2)
        this._geometrys[id] = geometry
        return this
    },
    fn.addMaterial = function (id, material) { MoGL.isAlive(this);
        if (this._materials[id]) MoGL.error('Scene', 'addMaterial', 0)
        if (!(material instanceof Material)) MoGL.error('Scene', 'addMaterial', 1)
        var checks = material._fragmentShaders, k;
        for (k in checks) if (typeof checks[k] == 'string') if (!this._fragmentShaders[checks[k]]) MoGL.error('Scene', 'addMaterial', 2)
        checks = material._textures;
        for (k in checks) if (typeof checks[k] == 'string') if (!this._textures[checks[k]]) {
            MoGL.error('Scene', 'addMaterial', 3)
        }
        this._materials[id] = material
        this._materials[id]._scene = this
        return this
    },
    fn.addTexture = function addTexture(id, image/*,resizeType*/) { MoGL.isAlive(this);
        if (this._textures[id]) MoGL.error('Scene', 'addTexture', 0)
        if (checkDraft(image)) MoGL.error('Scene', 'addTexture', 1)
        function checkDraft(target) {
            if (target instanceof HTMLImageElement) return 0
            if (target instanceof HTMLCanvasElement) return 0
            if (target instanceof HTMLVideoElement) return 0
            if (target instanceof ImageData) return 0
            if (target['substring'] && target.substring(0, 10) == 'data:image' && target.indexOf('base64') > -1) return 0// base64문자열 - urlData형식으로 지정된 base64문자열
            if (typeof target == 'string') return 0
            // TODO 블랍은 어카지 -__;;;;;;;;;;;;;;;;;;;;;;;;실제 이미지를 포함하고 있는 Blob객체.
            return 1
        }
        if(this._textures[id]) this._textures[id].img=makeTexture(this,id,image)
        else{
            this._textures[id] = { count: 0, last: 0, img: null, resizeType: arguments[2] || null }
            this._textures[id].img=makeTexture(this,id,image)
            console.log(this._textures)
            console.log(id, image)

        }
        return this
    },
    fn.addFragmentShader = function addFragmentShader(id, shaderStr) { MoGL.isAlive(this);
        if (this._fragmentShaders[id]) MoGL.error('Scene', 'addFragmentShader', 0)
        // TODO'Scene.addVertexShader:1' - MoGL 표준 인터페이스를 준수하지 않는 vertex shader를 등록하려할 때.
        // TODO 마일스톤0.2
        this._fragmentShaders[id] = shaderStr
        return this
    },
    fn.addVertexShader = function addVertexShader(id, shaderStr) { MoGL.isAlive(this);
        if (this._vertexShaders[id]) MoGL.error('Scene', 'addVertexShader', 0)
        // TODO'Scene.addVertexShader:1' - MoGL 표준 인터페이스를 준수하지 않는 vertex shader를 등록하려할 때.
        // TODO 마일스톤0.2
        this._vertexShaders[id] = shaderStr
        return this
    },
    ///////////////////////////////////////////////////////////////////////////
    // Get
    fn.getChild = function getChild(id) { MoGL.isAlive(this);
        var t = this._children[id];
        t = t ? t : this._cameras[id]
        return t ? t : null
    },
    fn.getGeometry = function getGeometry(id) { MoGL.isAlive(this);
        var t = this._geometrys[id];
        return t ? t : null
    },
    fn.getMaterial = function getMaterial(id) { MoGL.isAlive(this);
        var t = this._materials[id]
        return t ? t : null
    },
    fn.getTexture = function getTexture(id) { MoGL.isAlive(this);
        var t = this._textures[id]
        return t ? t : null
    },
    fn.getFragmentShader = function (id) { MoGL.isAlive(this);
        // TODO 마일스톤0.2
        return this._fragmentShaders[id]
    },
    fn.getVertexShader = function (id) { MoGL.isAlive(this);
        // TODO 마일스톤0.2
        return this._vertexShaders[id]
    },
    ///////////////////////////////////////////////////////////////////////////
    // Remove
    fn.removeChild = function removeChild(id) { MoGL.isAlive(this);
        return this._children[id] ? (this._children[id]._material._count--, this._children[id]._scene = null,this._children[id]._parent = null, delete this._children[id], true) : false
    },
    fn.removeGeometry = function removeGeometry(id) { MoGL.isAlive(this);
        return this._geometrys[id] ? (delete this._geometrys[id], true) : false
    },
    fn.removeMaterial = function removeMaterial(id) { MoGL.isAlive(this);
        return this._materials[id] ? (delete this._materials[id], true) : false
    },
    fn.removeTexture = function removeTexture(id) { MoGL.isAlive(this);
        return this._textures[id] ? (delete this._textures[id], true) : false
    },
    fn.removeFragmentShader = function removeFragmentShader() { MoGL.isAlive(this);
        // TODO 마일스톤0.2
        return this
    },
    fn.removeVertexShader = function VertexShader() { MoGL.isAlive(this);
        // TODO 마일스톤0.2
        return this
    }
    return MoGL.ext(Scene, MoGL);
})();
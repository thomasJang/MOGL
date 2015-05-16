/**
 * Created by redcamel on 2015-05-05.
 */
var Material = (function () {
    var Material, fn;
    var hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i, hex_s = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i;
    Material = function Material() {
        var t0 = arguments[0], t1, ta
        this._textures = {
            __indexList :[]
        },
        this._r = 1,
        this._g = 1,
        this._b = 1,
        this._a = 1,
        this._count = 0,
        this._scene = null,
        this._name = null
        if (arguments.length == 1) {
            if (t0.length > 7) ta = +t0.substr(7), t0 = t0.substr(0, 7)
            if (t0.charAt(0) == '#') {
                if (t1 = hex.exec(t0)) {
                    this._r = parseInt(t1[1], 16) / 255,
                    this._g = parseInt(t1[2], 16) / 255,
                    this._b = parseInt(t1[3], 16) / 255
                } else {
                    t1 = hex_s.exec(t0),
                    this._r = parseInt(t1[1] + t1[1], 16) / 255,
                    this._g = parseInt(t1[2] + t1[2], 16) / 255,
                    this._b = parseInt(t1[3] + t1[3], 16) / 255
                }
                this._a = ta ? ta > 1 ? 1 : ta : 1
            }
        } else {
            this._r = arguments[0],
            this._g = arguments[1],
            this._b = arguments[2],
            this._a = arguments[3] ? arguments[3] : 1
        }
    },
    fn = Material.prototype,
    fn.addTexture = function addTexture(textureID/*,index,blendMode*/) {
        //TODO 와 이거어렵네..
        //TODO index 구현
        //TODO blnedMode 구현 구현
        var t = this._scene
        if (t && !t._textures[textureID]) MoGL.error('Material', 'addTexture', 0)
        if (this._textures[textureID]) MoGL.error('Material', 'addTexture', 1)
        this._textures[textureID] = textureID
        var result
        if (arguments[1]) result=this._textures.__indexList.splice(arguments[1], 0,{id: textureID,blendMode : arguments[2]})
        else result=this._textures.__indexList.push({id: textureID,blendMode : arguments[2]})
        return this
    },
    fn.getRefCount = function getRefCount(){
        return this._count
    },
    fn.removeTexture = function removeTexture(textureID){
        var i = this._textures.__indexList.length
        while(i--){
            if(this._textures.__indexList[i].id == textureID){
                this._textures.__indexList.splice(i, 1)
                break
            }
        }
        delete this._textures[textureID]
        return this
    }
    return MoGL.ext(Material, MoGL);
})();
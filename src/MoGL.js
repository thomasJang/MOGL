var MoGL = (function(){
	var isFactory, isSuperChain, 
		uuidProp, isAliveProp, idProp, 
		uuid, counter, totalCount, 
		MoGL, fn;
	
	//내부용 상수
	isFactory = {factory:1},//팩토리 함수용 식별상수
	isSuperChain = {superChain:1},//생성자체인용 상수
	
	//인스턴스 카운트 시스템
	uuid = 0,//모든 인스턴스는 고유한 uuid를 갖게 됨.
	totalCount = 0, //생성된 인스턴스의 갯수를 관리함
	counter = {}, //클래스별로 관리
	
	//속성지정자용 기술객체
	uuidProp = {value:0},
	isAliveProp = {value:true, writable:true},
	idProp = {value:null, writable:true},
	
	MoGL = function MoGL(){
		uuidProp.value = uuid++;
		Object.defineProperty( this, 'uuid', uuidProp ),
		Object.defineProperty( this, 'isAlive', isAliveProp ),
		Object.defineProperty( this, '_id', idProp ),
		totalCount++;
	},
	fn = MoGL.prototype,
	//id처리기
	Object.defineProperty( fn, 'id', {
		get:function idGet(){return this._id;},
		set:function idSet(v){this._id = v;}
	} ),
	//파괴자
	Object.defineProperty( fn, 'destroy', {
		value:function destroy(){
			var key;
			for( key in this ) if( this.hasOwnProperty(key) ) this[key] = null;
			this.isAlive = false;
			counter[this.constructor.uuid]--;
			totalCount--;
		}
	} ),
	//id setter
	Object.defineProperty( fn, 'setId', {
		value:function setId(v){
			this.id = v;
			return this;
		}
	} ),
	Object.freeze(fn);
	//인스턴스의 갯수를 알아냄
	MoGL.count = function count( cls ){
		if( typeof cls == 'function' ){
			return counter[cls.uuid];
		}else{
			return totalCount;
		}
	},
	//표준 error처리
	MoGL.error = function error( cls, method, id ){
		throw new Error( cls + '.' + method + ':' + id );
	},
	//isAlive확인
	MoGL.isAlive = function isAlive(instance){
		if( !instance.isAlive ) throw new Error( 'Destroyed Object:' + instance );
	};
	//parent클래스를 상속하는 자식클래스를 만들어냄.
	MoGL.ext = function ext( child, parent ){
		var cls, oldProto, newProto, key;
		
		//부모검사
		if( parent !== MoGL && !( 'uuid' in parent ) ) MoGL.error( 'MoGL', 'ext', 0 );
		
		//생성자클래스
		cls = function(){
			var arg, arg0 = arguments[0];
			if( arg0 === isSuperChain ){
				parent.apply( this, arguments[1] ),
				child.apply( this, arguments[1] );
			}else if( this instanceof cls ){
				if( arg0 === isFactory ){
					arg = arguments[1];
				}else{
					arg = arguments;
				}
				parent.call( this, isSuperChain, arg ),
				child.apply( this, arg ),
				Object.seal(this),
				counter[cls.uuid]++;
				return this;
			}else{
				return cls.call( Object.create( cls.prototype), isFactory, arguments );
			}
		};

		//uuid 및 인스턴스카운터 초기화
		Object.defineProperty( cls, 'uuid', {value:uuid++} );
		if( !( cls.uuid in counter ) ) counter[cls.uuid] = 0;
		
		//parent와 프로토타입체인생성
		newProto = Object.create(parent.prototype);
		//기존 child의 프로토타입속성을 복사
		oldProto = child.prototype;
		for( key in oldProto ) if( oldProto.hasOwnProperty(key) ) newProto[key] = oldProto[key];
		//정적 속성을 복사
		for( key in child ) if( child.hasOwnProperty(key) ) cls[key] = child[key];
		//새롭게 프로토타입을 정의함
		cls.prototype = newProto;
		Object.freeze(cls),
		Object.seal(newProto);
		return cls;
    },
	Object.freeze(MoGL);
	return MoGL;
})();

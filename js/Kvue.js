

class KVue {
		constructor(options) {
			this.$options = options;
			//数据响应式
			this.$data = options.data;
			
			this.observe(this.$data)
			
			new Compile(options.el,this);
			
			if(options.create){
				options.create.call(this)
			}
		}
		
		observe(obj) {
			//检验数据类型必须是对象
			if(!obj||typeof obj !=='object') {
				return;
			}
			Object.keys(obj).forEach((key)=>{
				this.defineReactive(obj,key,obj[key]);
				this.proxyData(key);
				
			})
		}
		
		//数据响应式
		defineReactive(obj,key,val){
			this.observe(val);   //递归解决数据的嵌套
			const dep = new Dep();
			 Object.defineProperty(obj, key, {
            get() {
                Dep.target && dep.addDep(Dep.target);
                return val
            },
            set(newVal) {
                if (newVal === val) {
                    return;
                }
                val = newVal;
                // console.log(`${key}属性更新了：${newVal}`)
                dep.notify();
            }
			})
		}
		
		
		//代理函数
		proxyData(key) {
			Object.defineProperty(this,key,{
				get() {
					return this.$data[key]
				},
				set(newVal) {
					this.$data[key] = newVal
				}
			})
		}

}


//依赖收集
//Dep:用来管理watcher

class Dep {
	constructor() {
		//这里进行收集依赖
		this.deps = []		
	}
	
	//添加依赖
	addDep(dep) {
		this.deps.push(dep)
	}
	
	//通知方法,搜辑所有的watcher去更新
	notify() {
		this.deps.forEach((dep)=>dep.updata())
	}
	
}


 
//watcher 用来做具体更新的对象

class Watcher {
	constructor(vm,key,cb) {
		this.vm = vm;
		this.key = key;
		this.cb  = cb;
		
		//奖当前watcher实例指定到Dep静态属性target
		
		Dep.target = this;
		this.vm[this.key];
		Dep.target  =null;
	}
	updata() {
		this.cb.call(this.vm,this.vm[this.key])
	}
}

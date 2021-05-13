class Compile {
		constructor(el,vm) {
			//要不编译的宿主节点
			this.$el = document.querySelector(el);
			this.$vm = vm;// 在其他的节点中方便使用
			
			
			 //编译
            if (this.$el) {
                //转换内部内容为片段Fragment
                this.$fragment = this.node2Fragment(this.$el);
                //执行编译
                this.compile(this.$fragment);
                //将编译完的html追加到$el
                this.$el.appendChild(this.$fragment);
            }
		}
		
		//将宿主元素中的代码片段拿出来进行遍历，这样做比较的高效
		
		node2Fragment(el) {
			const frag = document.createDocumentFragment();
			//将el中所有的子元素搬家 移动到frag中去
			let child
			while (child = el.firstChild)  {
				frag.appendChild(child)
				console.log('虚拟节点：-----createDocumentFragment')
			}
			
			return frag;
		}
		
		
		//编译核心代码
		
		compile(el) {
		   const childNodes = el.childNodes;
		   Array.from(childNodes).forEach((node)=>{
		   		//判断类型
		   	if(this.isElement(node)) {
		   		 //元素 
		   		 console.log('编译元素',node.nodeName);
		   		 
		   		 //查询k- @。：
		   		 
		   		 const nodeAttrs = node.attributes;
		   		 Array.from(nodeAttrs).forEach((attr)=>{
		   		 	
		   		 	const attrName = attr.name;
		   		 	const exp = attr.value;
		   		 	
		   		 	if(this.isDirective(attrName)) {
		   		 	  const dir = attrName.substring(2);
		   		 	  //指令执行
		   		 	  this[dir] && this[dir](node, this.$vm, exp);
		   		 	}
		   		 	
		   		 	 if(this.isEvent(attrName)) {
		   		 	//@click
		   		 	let dir = attrName.substring(1);
		   		 	
		   		 	this.eventHandler(node,this.$vm,exp,dir)
		   		 	
		   		 }
		   		 })
		   		 
		   		
		   	}
		   	
		   	else if(this.isInterpolation(node)) {
		   		this.compileText(node)
		   	}
		   	
		   	//递归子节点
		   	
		   	if(node.childNodes&&node.childNodes.length>0) {
		   		this.compile(node)
		   	}
		   
		   })
		   
		}
		
		
		isDirective(attr) {
			
			return attr.indexOf('k-') ==0;
		}
		
		isEvent(attr) {
			
			return attr.indexOf('@')==0;
		}
		
		isElement(node) {
			return node.nodeType ===1;
		}
		
		
		//是不是插值文本
		
		isInterpolation(node) {
			return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
		}
		
		
		 compileText(node) {
		 	
		 	//console.log()
		 	
		 	this.updata(node,this.$vm,RegExp.$1,'text')
		 	
		 }
		 
		 updata(node,vm,exp,dir) {
		 	
		 	const updataFn = this[dir+'Updater']; //在当前的类里面组合一个函数名
		 	
		 	//先判断updatarFn是否存在
		 	updataFn&&updataFn(node,vm[exp]);
		 	
		 	new Watcher(vm,exp,(value)=>{
		 		updataFn&&updataFn(node,value)
		 	})
		 	
		 }
		 
		 //更新的具体操作
		 textUpdater(node,value) {
		 	node.textContent = value;
		 }
		 
		 text(node,vm,exp) {
		   this.updata(node,vm,exp,'text');
		 }
		 
		 
		 eventHandler(node,vm,exp,dir) {
		    let fn = vm.$options.methods && vm.$options.methods[exp];
		    if(dir && fn) {
		    	   node.addEventListener(dir,fn.bind(vm),false);
		    }
		 }
		 
		 
		 model(node,vm,exp) {
		 	
		 	  this.updata(node, vm, exp, 'model');    
		        let val = vm.exp;    
		        node.addEventListener('input', (e) => {      
		            let newValue = e.target.value;      
		            vm[exp] = newValue;      
		            val = newValue;
		        })
		 }
	
		modelUpdater(node,value) {
			node.value = value;
		}
		
		html(node,vm,exp) {
			this.updata(node,vm,exp,'html');
		}
		htmlUpdater(node,value) {
			node.innerHTML = value;
		}
}

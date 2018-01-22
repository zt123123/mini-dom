var utils = (function(window) {

	var flag = "getComputedStyle" in window;

	function win(attr, value) {
		if(typeof value !== "undefined") {
			document.documentElement[attr] = value;
			document.body[attr] = value;
		}
		return document.documentElement[attr] || document.body[attr];
	}

	function getCss(curEle, attr) {
		var val = null,
			reg = null;
		if(!flag) {
			if(attr === "opacity") {
				val = curEle.currentStyle["filter"];
				reg = /^alpha\(opacity=(\d+(?:\.\d+)?)\)$/i
				val = reg.test(val) ? reg.exec(val)[1] / 100 : 1;
			} else {
				val = curEle.currentStyle[attr];
			}
		} else {
			val = window.getComputedStyle(curEle, null)[attr];
		}

		reg = /^(-?\d+(\.\d+)?)(px|pt|rem|rm)?$/i;
		if(reg.test(val)) {
			return parseFloat(val);
		} else {
			return val;
		}
	}

	function listToArray(likeAry) {
		var ary = [];
		if(!flag) {
			for(var i = 0; i < likeAry.length; i++) {
				ary[ary.length] = likeAry[i];
			}
		} else {
			ary = Array.prototype.slice.call(likeAry);
		}
		return ary;
	}

	function trim(str) {
		return str.replace(/(^ +| +$)/g, "");
	}

	function jsonParse(str) {
		var obj = null;
		if(!flag) {
			obj = eval("(" + str + ")");
		} else {
			obj = JSON.parse(str);
		}
		return obj;
	}

	function offset(curEle) {
		var top = null,
			left = null,
			par = curEle.offsetParent;

		left += curEle.offsetLeft;
		top += curEle.offsetTop;

		while(par) {
			//IE8已经包含边框
			if(navigator.userAgent.indexOf("MSIE 8") === -1) {
				//累加父级边框
				left += par.clientLeft;
				top += par.clientTop;
			}

			//累加父级参照物偏移量
			left += par.offsetLeft;
			top += par.offsetTop;

			par = par.offsetParent;
		}

		return {
			top: top,
			left: left
		}
	}

	function children(curEle, tagName) {
		var nodeList = curEle.childNodes;
		var ary = [];

		if(!flag) {
			for(var i = 0, len = nodeList.length; i < len; i++) {
				var curNode = nodeList[i];
				if(curNode.nodeType === 1) {
					ary[ary.length] = curNode;
				}
				nodeList = null;
			}
		} else {
			//类数组转换为数组
			ary = Array.prototype.slice.call(curEle.children);
		}
		//二次筛选
		if(typeof tagName === "string") {
			for(var j = 0; j < ary.length; j++) {
				var curEleNode = ary[j];
				if(curEleNode.nodeName.toLowerCase() !== tagName.toLowerCase()) {
					ary.splice(j, 1);
					j--;
				}
			}
		}
		return ary;
	}

	function prev(curEle) {
		if(flag) {
			return curEle.previousElementSibling;
		}
		var pre = curEle.previousSibling;
		while(pre && pre.nodeType !== 1) {
			pre = pre.previousSibling;
		}
		return pre;
	}

	function prevAll(curEle) {
		var ary = [];
		var pre = this.prev(curEle);
		while(pre) {
			ary.unshift(pre);
			pre = this.prev(pre);
		}
		return ary;
	}

	function next(curEle) {
		if(flag) {
			return curEle.nextElementSibling;
		}
		var next = curEle.nextSibling;
		while(next && next.nodeType !== 1) {
			next = next.previousSibling;
		}
		return next;
	}

	function nextAll(curEle) {
		var ary = [];
		var next = this.next(curEle);
		while(next) {
			ary.push(next);
			next = this.next(next);
		}
		return ary;
	}

	function sibling(curEle) {
		var ary = [];
		var pre = this.prev(curEle);
		var next = this.next(curEle);
		pre ? ary.push(pre) : null;
		next ? ary.push(next) : null;
		return ary;
	}

	function siblings(curEle) {
		return this.prevAll(curEle).concat(this.nextAll(curEle));
	}

	function index(curEle) {
		return this.prevAll(curEle).length;
	}

	function firstChild(curEle) {
		var children = this.children(curEle);
		return children.length > 0 ? children[0] : null;
	}

	function lastChild(curEle) {
		var children = this.children(curEle);
		return children.length > 0 ? children[children.length - 1] : null;
	}

	function append(newEle, container) {
		container.appendChild(newEle);
	}

	function prepend(newEle, container) {
		var firstEle = this.firstChild(container);
		if(firstEle) {
			container.insertBefore(newEle, firstEle);
			return;
		}
		this.append(newEle, container);
	}

	function insertBefore(newEle, oldEle) {
		oldEle.parentNode.insertBefore(newEle, oldEle);
	}

	function insertAfter(newEle, oldEle) {
		var next = this.next(oldEle);
		if(next) {
			oldEle.parentNode.insertBefore(newEle, next);
			return;
		}
		oldEle.parentNode.appendChild(newEle);

	}

	function hasClass(curEle, className) {
		var reg = new RegExp("(^| +)" + className + "( +|$))");
		return reg.test(curEle.className)
	}

	function addClass(curEle, className) {
		//防止传递的多个类名，先拆分成数组
		var ary = this.trim(className).split(/ +/g);
		for(var i = 0; i < ary.length; i++) {
			var curClass = ary[i];
			if(!this.hasClass(curEle, curClass)) {
				curEle.className += " " + curClass;
			}
		}
	}

	function removeClass(curEle, className) {
		//防止传递的多个类名，先拆分成数组
		var ary = this.trim(className).split(/ +/g);
		var reg = new RegExp("(^| +)" + className + "( +|$))", "g");
		for(var i = 0; i < ary.length; i++) {
			var curClass = ary[i];
			if(this.hasClass(curEle, curClass)) {
				curEle.className = curEle.className.replace(reg, " ");
			}
		}
	}

	function getEleByClass(className, context) {
		context = context || document;
		if(flag) {
			return this.listToArray(context.getElementsByClassName(className));
		}

		var ary = [];
		var classNameAry = this.trim(className).split(/ +/g);
		var nodeList = context.getElementsByTagName("*");
		for(var i = 0, len = nodeList.length; i < len; i++) {
			var curNode = nodeList[i];

			var isOk = true;

			for(var j = 0; j < classNameAry.length; j++) {
				var curName = classNameAry[j];
				var reg = new RegExp("(^| +)" + curName + "( +|$)")
				if(!reg.test(curNode.className)) {
					isOk = false;
					break;
				}
			}
			if(isOk) {
				ary.push(curNode);
			}
		}
		return ary;
	}

	function setCss(curEle, attr, value) {
		reg = /^(width|height|top|right|bottom|left|(margin|padding)(Top|Right|Bottom|Right|)?)$/;

		if(attr === "float") {
			curEle.style["cssFloat"] = value;
			curEle.style["styleFloat"] = value;
			return;
		}

		if(attr === "opacity") {
			curEle.style["opacity"] = value;
			curEle.style["filter"] = "alpha(opacity=" + value * 100 + ")";
			return;
		}

		if(reg.test(attr)) {
			if(!isNaN(value)) {
				curEle.style[attr] = value + "px";
			}
		}
		curEle.style[attr] = value;

	}

	function setGroupCss(curEle, obj) {
		obj = obj || 0;
		if(obj.toString() !== "[object Object]") {
			return;
		}
		for(var key in obj) {
			if(obj.hasOwnProperty(key)) {
				this.setCss(curEle, key, obj[key]);
			}
		}
	}

	function css(curEle) {
		var arg2 = arguments[1];
		if(typeof arg2 === "string") {
			var arg3 = arguments[2];
			if(typeof arg3 === "undefined") {
				return this.getCss.call(curEle, arguments);
			}
			this.setCss.call(curEle, arguments);
		}
		arg2 = arg2 || 0;
		if(arg2.toString() === "[object Object]") {
			this.setGroupCss.apply(this, arguments);
		}
	}

	return {
		win: win, //操作浏览器盒子模型
		listToArray: listToArray, //类数组转换为数组
		trim: trim, //去除字符串首尾空格
		jsonParse: jsonParse, //格式化JSON
		offset: offset, //获取元素偏移量
		children: children, //获取元素所有子节点
		prev: prev, //获取哥哥节点
		prevAll: prevAll, //获取所有哥哥节点
		next: next, //获取弟弟节点
		nextAll: nextAll, //获取所有弟弟节点
		sibling: sibling, //获取相邻两个节点
		siblings: siblings, //获取所有兄弟节点
		index: index, //获取当前元素索引
		firstChild: firstChild, //获取当前元素第一个子节点
		lastChild: lastChild, //获取当前元素最后一个子节点
		append: append, //向当前元素末尾追加一个元素
		prepend: prepend, //向当前元素之前追加一个元素
		insertBefore: insertBefore, //把当前元素追加指定元素之前
		insertAfter: insertAfter, //把当前元素追加指定元素之后
		hasClass: hasClass, //判断元素是否有某个类名
		addClass: addClass, //给元素增加样式
		removeClass: removeClass, //删除元素样式
		getEleByClass: getEleByClass, //通过类名获取元素
		getCss: getCss, //获取元素样式
		setCss: setCss, //设置元素样式
		css: css //获取设置css
	}
})(window)
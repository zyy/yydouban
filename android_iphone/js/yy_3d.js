/**
 * @author Administrator
 */
//imf:imageflow
var imf = function(){
    var $support = {
        //3d转换
        transform3d: ('WebKitCSSMatrix' in window),
        touch: ('ontouchstart' in window)
    };
    
    //事件 是否支持触摸 不支持转为鼠标事件
    var $E = {
        start: $support.touch ? 'touchstart' : 'mousedown',
        move: $support.touch ? 'touchmove' : 'mousemove',
        end: $support.touch ? 'touchend' : 'mouseup',
        transEnd: 'webkitTransitionEnd'
    };
    var lf = 0;
    //实例
    var instances = [];
    //通过Class获得元素
    function getElementsByClass(object, tag, className){
        var o = object.getElementsByTagName(tag);
        for (var i = 0, n = o.length, ret = []; i < n; i++) 
            if (o[i].className == className) 
                ret.push(o[i]);
        if (ret.length == 1) 
            ret = ret[0];
        return ret;
    }
    //添加事件
    function addEvent(o, e, f){
        if (window.addEventListener) //添加事件监听器
            o.addEventListener(e, f, false);
        else 
            if (window.attachEvent)//附加事件 
                r = o.attachEvent('on' + e, f);
    }
    //创建倒影
    function createReflexion(cont, img){
        var flx = false;
        if (document.createElement("canvas").getContext) {
            flx = document.createElement("canvas");
            flx.width = img.width;
            flx.height = img.height;
            var context = flx.getContext("2d");
            //翻转
            context.translate(0, img.height);
            //比例
            context.scale(1, -1);
            //画图片
            context.drawImage(img, 0, 0, img.width, img.height);
            //全局复合操作
            context.globalCompositeOperation = "destination-out";
            //梯度
            var gradient = context.createLinearGradient(0, 0, 0, img.height * 2);
            //渐变颜色
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
            //填充风格
            context.fillStyle = gradient;
            //填充矩形
            context.fillRect(0, 0, img.width, img.height * 2);
        }
        else {
            /* ---- DXImageTransform ---- */
            /* ---- DX图像变换 ----*/
            flx = document.createElement('img');
            flx.src = img.src;
            //风格过滤器
            //opacity:透明度
            flx.style.filter = 'flipv progid:DXImageTransform.Microsoft.Alpha(' +
            'opacity=50, style=1, finishOpacity=0, startx=0, starty=0, finishx=0, finishy=' +
            (img.height * .25) +
            ')';
        }
        /* ---- insert Reflexion ---- */
        /* ---- 插入倒影 ---- */
        //位置=绝对位置
        flx.style.position = 'absolute';
        flx.style.left = '-62.5em';
        //追加倒影
        cont.appendChild(flx);
        return flx;
    }
    /* //////////// ==== ImageFlow Constructor ==== //////////// */
    /* //////////// ==== 图像流的构造函数 ==== //////////// */
    function ImageFlow(oCont, size, zoom, border){
        this.diapos = [];
        this.scr = false;
        this.size = size;
        //放大
        this.zoom = zoom;
        this.bdw = border;
        this.oCont = oCont;
        this.oc = document.getElementById(oCont);
        this.scrollbar = getElementsByClass(this.oc, 'div', 'scrollbar');
        this.text = getElementsByClass(this.oc, 'div', 'text');
        this.title = getElementsByClass(this.text, 'div', 'title');
        //说明
        this.legend = getElementsByClass(this.text, 'div', 'legend');
        this.bar = getElementsByClass(this.oc, 'img', 'bar');
        //左箭头
        this.arL = getElementsByClass(this.oc, 'img', 'arrow-left');
        //右箭头
        this.arR = getElementsByClass(this.oc, 'img', 'arrow-right');
        //滚动条宽度
        this.bw = this.bar.width;
        this.alw = this.arL.width - 5;
        this.arw = this.arR.width - 5;
        this.bar.parent = this.oc.parent = this;
        this.arL.parent = this.arR.parent = this;
        this.view = this.back = -1;
        this.resize();
        this.oc.onselectstart = function(){
            return false;
        }
        /* ---- create images ---- */
        /* ---- 创建图片 ---- */
        var img = getElementsByClass(this.oc, 'div', 'bank').getElementsByTagName('a');
        this.NF = img.length;
        for (var i = 0, o; o = img[i]; i++) {
            this.diapos[i] = new Diapo(this, i, o.rel, o.title || '- ' + i + ' -', o.innerHTML || o.rel, o.href || '', o.target || '_self');
        }
        /* ==== add mouse wheel events ==== */
        /* ==== 添加鼠标滚轮事件 （手机上可以不要这个事件） ==== */
        if (window.addEventListener) 
            this.oc.addEventListener('DOMMouseScroll', function(e){
                this.parent.scroll(-e.detail);
            }, false);
        else 
            this.oc.onmousewheel = function(){
                this.parent.scroll(event.wheelDelta);
            }
        /* ==== scrollbar drag N drop ==== */
        /* ==== 滚动条拖动n下降  ==== */
        this.bar.onmousedown = function(e){
            if (!e) 
                e = window.event;
            var scl = e.screenX - this.offsetLeft;
            var self = this.parent;
            /* ---- move bar ---- */
            this.parent.oc.onmousemove = function(e){
                if (!e) 
                    e = window.event;
                self.bar.style.left = Math.round(Math.min((self.ws - self.arw - self.bw), Math.max(self.alw, e.screenX - scl))) + 'px';
                self.view = Math.round(((e.screenX - scl)) / (self.ws - self.alw - self.arw - self.bw) * self.NF);
                if (self.view != self.back) 
                    self.calc();
                return false;
            }
            /* ---- release scrollbar ---- */
            /* ---- 释放滚动条 ---- */
            this.parent.oc.onmouseup = function(e){
                self.oc.onmousemove = null;
                return false;
            }
            return false;
        }
        /* ==== right arrow ==== */
        /* ====右箭头==== */
        this.arR.onclick = this.arR.ondblclick = function(){
            if (this.parent.view < this.parent.NF - 1) 
                this.parent.calc(1);
        }
        /* ==== Left arrow ==== */
        /* ==== 左箭头 ==== */
        this.arL.onclick = this.arL.ondblclick = function(){
            if (this.parent.view > 0) 
                this.parent.calc(-1);
        }
    }
    /* //////////// ==== ImageFlow prototype ==== //////////// */
    /* //////////// ==== 图像流原型 ==== //////////// */
    ImageFlow.prototype = {
        /* ==== targets ==== */
        /* ==== 目标，任务 ==== */
        calc: function(inc){
            if (inc) 
                this.view += inc;
            var tw = 0;
            var lw = 0;
            var o = this.diapos[this.view];
            if (o && o.loaded) {
                /* ---- reset ---- */
                /* ---- 重置 ---- */
                var ob = this.diapos[this.back];
                if (ob && ob != o) {
                    ob.img.className = 'diapo';
                    ob.z1 = 1;
                }
                /* ---- update legend ---- */
                /* ---- 更新标题和说明  ---- */
                this.title.replaceChild(document.createTextNode(o.title), this.title.firstChild);
                this.legend.replaceChild(document.createTextNode(o.text), this.legend.firstChild);
                /* ---- update hyperlink ---- */
                /* ---- 更新超链接 ---- */
                if (o.url) {
                    o.img.className = 'diapo link';
                    window.status = 'hyperlink: ' + o.url;
                }
                else {
                    o.img.className = 'diapo';
                    window.status = '';
                }
                /* ---- calculate target sizes & positions ---- */
                /* ---- 计算目标的大小和位置 ---- */
                o.w1 = Math.min(o.iw, this.wh * .5) * o.z1;
                var x0 = o.x1 = (this.wh * .5) - (o.w1 * .5);
                var x = x0 + o.w1 + this.bdw;
                for (var i = this.view + 1, o; o = this.diapos[i]; i++) {
                    if (o.loaded) {
                        o.x1 = x;
                        o.w1 = (this.ht / o.r) * this.size;
                        x += o.w1 + this.bdw;
                        tw += o.w1 + this.bdw;
                    }
                }
                x = x0 - this.bdw;
                for (var i = this.view - 1, o; o = this.diapos[i]; i--) {
                    if (o.loaded) {
                        o.w1 = (this.ht / o.r) * this.size;
                        o.x1 = x - o.w1;
                        x -= o.w1 + this.bdw;
                        tw += o.w1 + this.bdw;
                        lw += o.w1 + this.bdw;
                    }
                }
                /* ---- move scrollbar ---- */
                /* ---- 移动滚动条 ---- */
                if (!this.scr && tw) {
                    var r = (this.ws - this.alw - this.arw - this.bw) / tw;
                    this.bar.style.left = Math.round(this.alw + lw * r) + 'px';
                }
                /* ---- save preview view ---- */
                /* ---- 保存预览视图  ---- */
                this.back = this.view;
            }
        },
        /* ==== mousewheel scrolling ==== */
        /* ==== 鼠标滚轮滚动 ==== */
        scroll: function(sc){
            if (sc < 0) {
                if (this.view < this.NF - 1) 
                    this.calc(1);
            }
            else {
                if (this.view > 0) 
                    this.calc(-1);
            }
        },
        /* ==== resize  ==== */
        /* ==== 调整大小  ==== */
        resize: function(){
            this.wh = this.oc.clientWidth;
            this.ht = this.oc.clientHeight;
            this.ws = this.scrollbar.offsetWidth;
            this.calc();
            this.run(true);
        },
        /* ==== move all images  ==== */
        /* ==== 移动所有图片  ==== */
        run: function(res){
            var i = this.NF;
            while (i--) 
                this.diapos[i].move(res);
        }
    }
    /* //////////// ==== Diapo Constructor ==== //////////// */
    /* //////////// ==== Diapo构造方法 ==== //////////// */
    Diapo = function(parent, N, src, title, text, url, target){
        var self = this;
        this.parent = parent;
        this.loaded = false;
        this.isDown = false;
        this.title = title;
        this.text = text;
        this.url = url;
        this.target = target;
        this.N = N;
        this.img = document.createElement('img');
        this.img.src = src;
        this.img.parent = this;
        this.img.className = 'diapo';
        this.x0 = this.parent.oc.clientWidth;
        this.x1 = this.x0;
        this.w0 = 0;
        this.w1 = 0;
        this.z1 = this.parent.zoom;
        this.img.parent = this;
		this.isMoved = false;
		//图片滑动事件
        this.img.ontouchstart = function(event){
			//touch事件
            var touch = event.touches[0];
			//初始位置
            self.startX = touch.pageX;
        }
        this.img.ontouchmove = function(event){
            var touch = event.touches[0];
			//位移差
            self.mx = touch.pageX - self.startX;
			self.isMoved = true;
        }
        this.img.ontouchend = function(event){
			if (self.isMoved) {
				if (self.mx > 0) {
					var lenght = Math.abs(self.mx);
					var num = parseInt(lenght / 30);
					this.parent.parent.view -= num;
					if (this.parent.parent.view < 0) 
						this.parent.parent.view = 0;
				}
				else 
					if (self.mx < 0) {
						var lenght = Math.abs(self.mx);
						var num = parseInt(lenght / 30);
						this.parent.parent.view += num;
						if (this.parent.parent.view > this.parent.parent.diapos.length - 1) 
							this.parent.parent.view = this.parent.parent.diapos.length - 1;
					}
				this.parent.parent.calc();
				self.isMoved = false;
			}
			self.mx = 0;
        }
        
        this.img.onclick = function(){
            this.parent.click();
        }
        this.parent.oc.appendChild(this.img);
        /* ---- display external link ---- */
        /* ---- 显示外部链接 ---- */
        if (url) {
            this.img.onmouseover = function(){
                this.className = 'diapo link';
            }
            this.img.onmouseout = function(){
                this.className = 'diapo';
            }
        }
    }
    /* //////////// ==== Diapo prototype ==== //////////// */
    /* //////////// ==== Diapo原型 ==== //////////// */
    Diapo.prototype = {
        /* ==== HTML rendering ==== */
        /* ==== HTML渲染 ==== */
        move: function(res){
            if (this.loaded) {
                var sx = this.x1 - this.x0;
                var sw = this.w1 - this.w0;
                if (Math.abs(sx) > 2 || Math.abs(sw) > 2 || res) {
                    /* ---- paint only when moving ---- */
                    /* ---- 仅移动时绘制 ---- */
                    this.x0 += sx * .1;
                    this.w0 += sw * .1;
                    if (this.x0 < this.parent.wh && this.x0 + this.w0 > 0) {
                        /* ---- paint only visible images ---- */
                        /* ---- 仅图片可见时绘制 ---- */
                        this.visible = true;
                        var o = this.img.style;
                        var h = this.w0 * this.r;
                        /* ---- diapo ---- */
                        o.left = Math.round(this.x0) + 'px';
                        o.bottom = Math.floor(this.parent.ht * .25) + 'px';
                        o.width = Math.round(this.w0) + 'px';
                        o.height = Math.round(h) + 'px';
                        /* ---- reflexion ---- */
                        /* ---- 影子 ---- */
                        if (this.flx) {
                            var o = this.flx.style;
                            o.left = Math.round(this.x0) + 'px';
                            o.top = Math.ceil(this.parent.ht * .75 + 1) + 'px';
                            o.width = Math.round(this.w0) + 'px';
                            o.height = Math.round(h) + 'px';
                        }
                    }
                    else {
                        /* ---- disable invisible images ---- */
                        /* ---- 禁用不可见的图像 ---- */
                        if (this.visible) {
                            this.visible = false;
                            this.img.style.width = '0em';
                            if (this.flx) 
                                this.flx.style.width = '0em';
                        }
                    }
                }
            }
            else {
                /* ==== image onload ==== */
                /* ==== 图片onload事件 ==== */
                if (this.img.complete && this.img.width) {
                    /* ---- get size image ---- */
                    /* ---- 获得图片大小 ---- */
                    this.iw = this.img.width + 80;
                    this.ih = this.img.height + 80;
                    this.r = this.ih / this.iw;
                    this.loaded = true;
                    /* ---- create reflexion ---- */
                    /* ---- 创建影子 ---- */
                    this.flx = createReflexion(this.parent.oc, this.img);
                    if (this.parent.view < 0) 
                        this.parent.view = this.N;
                    this.parent.calc();
                }
            }
        },
        /* ==== diapo onclick ==== */
        /* ==== diapo 点击事件  ==== */
        click: function(){
            if (this.parent.view == this.N) {
                /* ---- click on zoomed diapo ---- */
                /* ---- 点击放大 diapo ---- */
                if (this.url) {
                    /* ---- open hyperlink ---- */
                    /* ---- 打开超链接 ---- */
                    window.open(this.url, this.target);
                }
//                else {
//                    /* ---- zoom in/out ---- */
//                    /* ---- 放大/缩小 ---- */
//                    this.z1 = this.z1 == 1 ? this.parent.zoom : 1;
//                    this.parent.calc();
//                }
            }
            else {
                /* ---- select diapo ---- */
                /* ---- 选择 diapo ---- */
                this.parent.view = this.N;
                this.parent.calc();
            }
            return false;
        }
    }
    /* //////////// ==== public methods ==== //////////// */
    /* //////////// ==== 公共方法 ==== //////////// */
    return {
        /* ==== initialize script ==== */
        /* ==== 初始化script ==== */
        create: function(div, size, zoom, border){
            /* ---- instanciate imageFlow ---- */
            /* ---- 实例化图像流 ---- */
            var load = function(){
                var loaded = false;
                var i = instances.length;
                while (i--) 
                    if (instances[i].oCont == div) 
                        loaded = true;
                if (!loaded) {
                    /* ---- push new imageFlow instance ---- */
                    /* ---- 推新图像流实例 ---- */
                    instances.push(new ImageFlow(div, size, zoom, border));
                    /* ---- init script (once) ---- */
                    /* ---- 加载 script (第一次) ---- */
                    if (!imf.initialized) {
                        imf.initialized = true;
                        /* ---- window resize event ---- */
                        /* ---- 窗口大小调整事件 ---- */
                        addEvent(window, 'resize', function(){
                            var i = instances.length;
                            while (i--) 
                                instances[i].resize();
                        });
                        /* ---- stop drag N drop ---- */
                        /* ---- 停止拖动n下降 ---- */
                        addEvent(document.getElementById(div), 'mouseout', function(e){
                            if (!e) 
                                e = window.event;
                            var tg = e.relatedTarget || e.toElement;
                            if (tg && tg.tagName == 'HTML') {
                                var i = instances.length;
                                while (i--) 
                                    instances[i].oc.onmousemove = null;
                            }
                            return false;
                        });
                        /* ---- set interval loop ---- */
                        /* ---- 设置间隔循环 ---- */
                        setInterval(function(){
                            var i = instances.length;
                            while (i--) 
                                instances[i].run();
                        }, 16);
                    }
                }
            }
            /* ---- window onload event ---- */
            /* ---- 窗口onload事件 ---- */
            addEvent(window, 'load', function(){
                load();
            });
        }
    }
}();

/* ==== create imageFlow ==== */
// div ID    , size, zoom, border
// div的id，大小，缩放，边框
imf.create("imageFlow", 0.35, 1.7, 15);

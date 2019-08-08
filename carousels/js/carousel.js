;
(function($) {
	var Carousel = function(carousel) {
		var self = this;
		//保存单个carousel对象
		this.carousel = carousel;
		this.carouselItemMain = carousel.find('ul.carousel-list'); //ul
		this.carouselItems = carousel.find('li.carousel-item'); //li
		if(this.carouselItems.size() % 2 == 0) {
			var num = this.carouselItems.size() / 2;
			this.carouselItemMain.append(this.carouselItems.eq(num).clone());
			this.carouselItems = this.carouselItemMain.children();
		}
		this.prevBtn = carousel.find('div.btn-prev');
		this.nextBtn = carousel.find('div.btn-next');
		this.firstCarouselItem = this.carouselItems.eq(0);
		this.lastCarouselItem = this.carouselItems.last();
		this.rotateFlag = true;
		//默认配置参数
		this.setting = {
			"width": 970, //幻灯片宽度
			"height": 337, //幻灯片高度
			"carouselWidth": 600, //图片宽度
			"carouselHeight": 337, //图片高度
			"scale": 0.8, //缩放比例
			"autoPlay": true, //自动播放
			"delay": 3000, //自动播放时间间隔
			"speed": 500, //过渡
			"verticalAlign": "middle" //对齐方式：middle, bottom
		};
		$.extend(this.setting, this.getSetting());
		//设置配置参数
		this.setSettingValue();
		this.setCarouselPos();
		this.nextBtn.click(function() {
			if(self.rotateFlag) {
				self.rotateFlag = false;
				self.carouselRotate("left");
			}
		});
		this.prevBtn.click(function() {
			if(self.rotateFlag) {
				self.rotateFlag = false;
				self.carouselRotate("right");
			}
		});
		//是否开启自动播放
		if(this.setting.autoPlay) {
			this.autoPlay();
			this.carousel.hover(function() {
				window.clearInterval(self.timer);
			}, function() {
				self.autoPlay();
			})
		}
	}
	Carousel.prototype = {
		//自动播放
		autoPlay: function() {
			var self = this;
			this.timer = window.setInterval(function() {
				self.nextBtn.click();
			}, this.setting.delay);
		},
		//旋转
		carouselRotate: function(dir) {
			var _this_ = this;
			var zIndexArr = [];
			if(dir === "left") {
				this.carouselItems.each(function() {
					var self = $(this),
						prev = self.prev().get(0) ? self.prev() : _this_.lastCarouselItem,
						width = prev.width(),
						height = prev.height(),
						left = prev.css('left'),
						top = prev.css('top'),
						zIndex = prev.css('z-index'),
						opacity = prev.css('opacity');
					zIndexArr.push(zIndex);
					self.animate({
						width: width,
						height: height,
						left: left,
						top: top,
						opacity: opacity
					}, _this_.setting.speed, function() {
						_this_.rotateFlag = true;
					});
				});
				this.carouselItems.each(function(i) {
					$(this).css('z-index', zIndexArr[i]);
				});
			} else if(dir === "right") {
				this.carouselItems.each(function() {
					var self = $(this),
						next = self.next().get(0) ? self.next() : _this_.firstCarouselItem,
						width = next.width(),
						height = next.height(),
						left = next.css('left'),
						top = next.css('top'),
						zIndex = next.css('z-index'),
						opacity = next.css('opacity');
					zIndexArr.push(zIndex);
					self.animate({
						width: width,
						height: height,
						left: left,
						top: top,
						opacity: opacity
					}, _this_.setting.speed, function() {
						_this_.rotateFlag = true;
					});
				});
				this.carouselItems.each(function(i) {
					$(this).css('z-index', zIndexArr[i]);
				});
			}
		},
		//设置剩余帧的位置关系
		setCarouselPos: function() {
			var self = this;
			var sliceItems = this.carouselItems.slice(1),
				sliceSize = sliceItems.size() / 2,
				rightSlice = sliceItems.slice(0, sliceSize),
				level = Math.floor(this.carouselItems.size() / 2),
				leftSlice = sliceItems.slice(sliceSize);
			//设置右边帧的位置关系
			var rw = this.setting.carouselWidth,
				rh = this.setting.carouselHeight,
				gap = ((this.setting.width - rw) / 2) / level,
				firstLeft = (this.setting.width - rw) / 2,
				fixLeftOffset = firstLeft + rw;
			rightSlice.each(function(i) {
				level--;
				var j = i + 1;
				rw = rw * self.setting.scale;
				rh = rh * self.setting.scale;
				$(this).css({
					width: rw,
					height: rh,
					left: fixLeftOffset + gap * (++i) - rw,
					top: self.setVerticalAlign(rh),
					zIndex: level,
					opacity: 1 / (++j)
				});
			});
			//设置左边位置关系
			var lw = rightSlice.last().width(),
				lh = rightSlice.last().height(),
				oloop = Math.floor(this.carouselItems.size() / 2) + 1;
			leftSlice.each(function(i) {
				$(this).css({
					width: lw,
					height: lh,
					left: i * gap,
					top: self.setVerticalAlign(lh),
					zIndex: i,
					opacity: 1 / (oloop--)
				});
				lw = lw / self.setting.scale;
				lh = lh / self.setting.scale;
			});
		},
		//设置垂直排列对齐
		setVerticalAlign: function(height) {
			var verticalType = this.setting.verticalAlign,
				top = 0;
			if(verticalType === "middle") {
				top = (this.setting.height - height) / 2;
			} else if(verticalType === 'bottom') {
				top = this.setting.height - height;
			} else if(verticalType === 'top') {
				top = 0;
			} else {
				top = (this.setting.height - height) / 2;
			}
			return top;
		},
		//设置配置参数控制基本的宽高
		setSettingValue: function() {
			//整个幻灯片区域宽高
			this.carousel.css({
				width: this.setting.width,
				height: this.setting.height
			});
			//ul宽高
			this.carouselItemMain.css({
				width: this.setting.width,
				height: this.setting.height
			});
			//计算上下切换按钮宽高
			var w = (this.setting.width - this.setting.carouselWidth) / 2;
			//配置上下切换按钮宽高
			this.prevBtn.css({
				width: w,
				height: this.setting.height,
				zIndex: Math.ceil(this.carouselItems.size() / 2)
			});
			this.nextBtn.css({
				width: w,
				height: this.setting.height,
				zIndex: Math.ceil(this.carouselItems.size() / 2)
			});
			//配置第一帧幻灯片位置和宽高
			this.firstCarouselItem.css({
				width: this.setting.carouselWidth,
				height: this.setting.carouselHeight,
				left: w,
				top: 0,
				zIndex: Math.floor(this.carouselItems.size() / 2)
			});
		},
		//获人工配置参数
		getSetting: function() {
			var setting = this.carousel.attr('data-setting');
			if(setting && setting != "") {
				return $.parseJSON(setting);
			} else {
				return {};
			}
		}
	};
	Carousel.init = function(carousel) {
		var _this_ = this;
		carousel.each(function() {
			new _this_($(this));
		});
	};
	//全局注册
	window['Carousel'] = Carousel;
})(jQuery);